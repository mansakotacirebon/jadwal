const FILTER_KEYS = ["hari", "kelas", "mapel", "guru"];

const FILTER_LABELS = {
  hari: " ",
  kelas: " ",
  mapel: " ",
  guru: " ",
  search: " ",
};

const FILTER_PLACEHOLDERS = {
  hari: "Jumlah Hari",
  kelas: "Jumlah Kelas",
  mapel: "Jumlah Mapel",
  guru: "Jumlah Guru",
};

function requireElement(document, id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Elemen #${id} tidak ditemukan.`);
  }
  return element;
}

function createElement(document, tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

export function createScheduleView(document) {
  const elements = {
    grid: requireElement(document, "schedule-grid"),
    emptyState: requireElement(document, "empty-state"),
    totalCount: requireElement(document, "total-count"),
    filterBadgesBar: requireElement(document, "filter-badges-bar"),
    inputs: {
      hari: requireElement(document, "filter-hari"),
      kelas: requireElement(document, "filter-kelas"),
      mapel: requireElement(document, "filter-mapel"),
      guru: requireElement(document, "filter-guru"),
      search: requireElement(document, "search-input"),
    },
    counts: {
      hari: requireElement(document, "count-hari"),
      kelas: requireElement(document, "count-kelas"),
      mapel: requireElement(document, "count-mapel"),
      guru: requireElement(document, "count-guru"),
    },
    resetButton: requireElement(document, "reset-filters"),
    savePresetButton: requireElement(document, "save-preset"),
    deletePresetButton: requireElement(document, "delete-preset"),
    presetStatus: requireElement(document, "preset-status"),
  };

  function renderFilterOptions(optionsByKey, filters) {
    FILTER_KEYS.forEach((key) => {
      const select = elements.inputs[key];
      select.replaceChildren();
      const options = [...optionsByKey[key]];
      if (filters[key] && !options.includes(filters[key])) {
        options.push(filters[key]);
      }

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = FILTER_PLACEHOLDERS[key];
      select.appendChild(placeholder);

      options.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });

      select.value = filters[key];
      elements.counts[key].textContent = optionsByKey[key].length;
    });
  }

  function renderPreset(hasPreset, status = "") {
    elements.savePresetButton.textContent = hasPreset
      ? "Perbarui preset"
      : "Simpan preset";
    elements.deletePresetButton.hidden = !hasPreset;
    elements.presetStatus.textContent =
      status ||
      (hasPreset ? "Preset guru/kelas tersimpan." : "Belum ada preset.");
  }

  function renderSchedules(data) {
    elements.grid.replaceChildren();
    elements.totalCount.textContent = data.length;
    elements.emptyState.classList.toggle("hidden", data.length > 0);

    data.forEach((item, index) => {
      const card = document.createElement("div");
      const hourKey = (item.jam || "").slice(0, 2).trim();
      card.className = `card ${
        hourKey ? `card-jam-${hourKey}` : "card-jam-default"
      }`;
      card.style.animationDelay = `${Math.min(index * 30, 1000)}ms`;

      const cardHeader = document.createElement("div");
      cardHeader.className = "card-header";

      const subjectDetails = document.createElement("div");
      subjectDetails.append(
        createElement(document, "h3", "card-mapel", item.mapel),
        createElement(document, "p", "card-guru", item.guru),
      );
      cardHeader.append(
        subjectDetails,
        createElement(document, "span", "tag tag-kelas", item.kelas),
      );

      const cardBody = document.createElement("div");
      cardBody.className = "card-body";
      const infoRow = document.createElement("div");
      infoRow.className = "info-row";
      infoRow.append(
        createElement(document, "span", "", "📆"),
        createElement(document, "span", "info-val", item.hari),
        createElement(document, "span", "", "  ||"),
        createElement(document, "span", "", "⏰"),
        createElement(document, "span", "info-val", item.jam),
      );
      cardBody.appendChild(infoRow);
      card.append(cardHeader, cardBody);
      elements.grid.appendChild(card);
    });
  }

  function renderFilterBadges(filters, onClearFilter) {
    elements.filterBadgesBar
      .querySelectorAll(".filter-badge")
      .forEach((badge) => badge.remove());

    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (!value) {
        return;
      }

      count += 1;
      const badge = document.createElement("span");
      badge.className = "filter-badge";
      badge.title = `Hapus filter ${FILTER_LABELS[key]}`;
      badge.append(
        createElement(document, "span", "badge-key", FILTER_LABELS[key]),
        createElement(document, "span", "badge-val", value),
      );

      const closeButton = createElement(
        document,
        "span",
        "badge-close",
        "×",
      );
      closeButton.setAttribute("aria-label", "hapus");
      closeButton.addEventListener("click", () => {
        if (key === "search") {
          elements.inputs.search.value = "";
        }
        onClearFilter(key);
      });
      badge.appendChild(closeButton);
      elements.filterBadgesBar.appendChild(badge);
    });

    elements.filterBadgesBar.classList.toggle("has-badges", count > 0);
  }

  function bindEvents({
    onFilterChange,
    onSearch,
    onReset,
    onSavePreset,
    onDeletePreset,
  }) {
    FILTER_KEYS.forEach((key) => {
      elements.inputs[key].addEventListener("change", (event) => {
        onFilterChange(key, event.target.value);
      });
    });

    elements.inputs.search.addEventListener("input", (event) => {
      onSearch(event.target.value);
    });
    elements.resetButton.addEventListener("click", () => {
      elements.inputs.search.value = "";
      onReset();
    });
    elements.savePresetButton.addEventListener("click", () => {
      onSavePreset({
        kelas: elements.inputs.kelas.value,
        guru: elements.inputs.guru.value,
      });
    });
    elements.deletePresetButton.addEventListener("click", onDeletePreset);
  }

  return {
    bindEvents,
    renderFilterBadges,
    renderFilterOptions,
    renderPreset,
    renderSchedules,
  };
}
