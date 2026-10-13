import {
  createInitialFilters,
  filterSchedules,
  getFilterOptions,
  FILTER_KEYS,
} from "../domain/schedule.js";

export function createScheduleService(data) {
  let filters = createInitialFilters();
  let defaultDay = "";
  let defaultPreset = { kelas: "", guru: "" };

  function normalizeFilters(preservedKey) {
    FILTER_KEYS.forEach((key) => {
      if (key === preservedKey) {
        return;
      }

      if (defaultPreset[key] && filters[key] === defaultPreset[key]) {
        return;
      }

      const options = getFilterOptions(data, filters, key);
      if (filters[key] && !options.includes(filters[key])) {
        filters[key] = "";
      }
    });
  }

  return {
    getFilters() {
      return { ...filters };
    },
    getFilterOptions(key) {
      return getFilterOptions(data, filters, key);
    },
    getFilteredSchedules() {
      return filterSchedules(data, filters);
    },
    setInitialDay(day) {
      defaultDay = day;
      filters = createInitialFilters(day);
      filters.kelas = defaultPreset.kelas;
      filters.guru = defaultPreset.guru;
    },
    setFilter(key, value) {
      if (key === "search") {
        filters.search = value;
        return;
      }

      filters[key] = value;
      normalizeFilters(key);
    },
    clearFilter(key) {
      filters[key] = "";
      normalizeFilters();
    },
    resetFilters(day = defaultDay) {
      defaultDay = day;
      filters = createInitialFilters(defaultDay);
      filters.kelas = defaultPreset.kelas;
      filters.guru = defaultPreset.guru;
    },
    setDefaultPreset(preset) {
      defaultPreset = { kelas: preset.kelas, guru: preset.guru };
      filters.kelas = defaultPreset.kelas;
      filters.guru = defaultPreset.guru;
    },
    clearDefaultPreset() {
      defaultPreset = { kelas: "", guru: "" };
      filters.kelas = "";
      filters.guru = "";
    },
  };
}
