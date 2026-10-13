import { createScheduleService } from "./application/scheduleService.js";
import { createPresetRepository } from "./data/presetRepository.js";
import { loadScheduleData } from "./data/scheduleRepository.js";
import { createScheduleView } from "./presentation/scheduleView.js";
import { initializeSidebar } from "./presentation/sidebar.js";
import { initializeTheme } from "./presentation/theme.js";

function registerServiceWorker(window) {
  if (!("serviceWorker" in window.navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    window.navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

function getCurrentDay() {
  const days = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  return days[new Date().getDay()];
}

async function initializeApp() {
  initializeTheme(document, window);
  initializeSidebar(document, window);
  registerServiceWorker(window);

  try {
    const scheduleData = await loadScheduleData();
    if (scheduleData.length === 0) {
      throw new Error("Data jadwal kosong atau tidak valid.");
    }

    const service = createScheduleService(scheduleData);
    const view = createScheduleView(document);
    const presetRepository = createPresetRepository(window.localStorage);
    let hasPreset = false;
    let presetStatus = "";

    function render() {
      const filters = service.getFilters();
      const optionsByKey = Object.fromEntries(
        ["hari", "kelas", "mapel", "guru"].map((key) => [
          key,
          service.getFilterOptions(key),
        ]),
      );
      view.renderFilterOptions(optionsByKey, filters);
      view.renderSchedules(service.getFilteredSchedules());
      view.renderPreset(hasPreset, presetStatus);
      view.renderFilterBadges(filters, (key) => {
        service.clearFilter(key);
        render();
      });
    }

    try {
      const preset = presetRepository.load();
      if (preset) {
        service.setDefaultPreset(preset);
        hasPreset = true;
      }
    } catch (error) {
      presetStatus = "Preset gagal dibaca dari penyimpanan browser.";
      console.error("Gagal membaca preset jadwal:", error);
    }

    service.setInitialDay(getCurrentDay());
    view.bindEvents({
      onFilterChange(key, value) {
        service.setFilter(key, value);
        render();
      },
      onSearch(value) {
        service.setFilter("search", value);
        render();
      },
      onReset() {
        service.resetFilters(getCurrentDay());
        render();
      },
      onSavePreset(preset) {
        if (!preset.kelas && !preset.guru) {
          presetStatus = "Pilih guru atau kelas sebelum menyimpan preset.";
          render();
          return;
        }

        try {
          presetRepository.save(preset);
          service.setDefaultPreset(preset);
          hasPreset = true;
          presetStatus = "Preset berhasil disimpan.";
        } catch (error) {
          presetStatus =
            "Preset gagal disimpan. Periksa izin penyimpanan browser.";
          console.error("Gagal menyimpan preset jadwal:", error);
        }
        render();
      },
      onDeletePreset() {
        try {
          presetRepository.remove();
          service.clearDefaultPreset();
          hasPreset = false;
          presetStatus = "Preset berhasil dihapus.";
        } catch (error) {
          presetStatus =
            "Preset gagal dihapus. Periksa izin penyimpanan browser.";
          console.error("Gagal menghapus preset jadwal:", error);
        }
        render();
      },
    });
    render();
  } catch (error) {
    console.error("Gagal menginisialisasi jadwal:", error);
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
