function parseCsv(text) {
  const normalizedText = text.replace(/^\uFEFF/, "");
  const lines = normalizedText
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return [];
  }

  const rows = lines.map((line) => {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  });

  const [header, ...records] = rows;
  return records
    .map((record) => {
      const item = {};
      header.forEach((key, index) => {
        item[key.trim()] = (record[index] ?? "").trim();
      });

      return {
        hari: item.hari || "",
        jam: item.jam || "",
        kelas: item.kelas || "",
        mapel: item.mapel || "",
        guru: item.guru || "",
      };
    })
    .filter(
      (item) =>
        item.hari && item.jam && item.kelas && item.mapel && item.guru,
    );
}

export async function loadScheduleData() {
  const response = await fetch("./datajadwal.csv", { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return parseCsv(await response.text());
}
