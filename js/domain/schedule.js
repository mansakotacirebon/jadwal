export const FILTER_KEYS = ["hari", "kelas", "mapel", "guru"];

export function createInitialFilters(hari = "") {
  return {
    hari,
    kelas: "",
    mapel: "",
    guru: "",
    search: "",
  };
}

export function getFilterOptions(data, filters, targetKey) {
  const filteredData = data.filter((item) => {
    return FILTER_KEYS.every(
      (key) => key === targetKey || !filters[key] || item[key] === filters[key],
    );
  });

  const options = [...new Set(filteredData.map((item) => item[targetKey]))];
  return targetKey === "hari"
    ? options.sort((a, b) => b.localeCompare(a, "id"))
    : options.sort();
}

export function filterSchedules(data, filters) {
  const searchTerm = filters.search.toLowerCase();

  return data.filter((item) => {
    const matchesFilters = FILTER_KEYS.every(
      (key) => !filters[key] || item[key] === filters[key],
    );
    const matchesSearch =
      !searchTerm ||
      item.mapel.toLowerCase().includes(searchTerm) ||
      item.guru.toLowerCase().includes(searchTerm) ||
      item.kelas.toLowerCase().includes(searchTerm);

    return matchesFilters && matchesSearch;
  });
}
