const PRESET_KEY = "jadwal-default-preset-v1";

export function createPresetRepository(storage) {
  return {
    load() {
      const serializedPreset = storage.getItem(PRESET_KEY);
      if (!serializedPreset) {
        return null;
      }

      let preset;
      try {
        preset = JSON.parse(serializedPreset);
      } catch (error) {
        throw new Error("Data preset tersimpan tidak dapat dibaca.", {
          cause: error,
        });
      }

      if (
        !preset ||
        typeof preset.kelas !== "string" ||
        typeof preset.guru !== "string"
      ) {
        throw new Error("Format preset tersimpan tidak valid.");
      }

      return { kelas: preset.kelas, guru: preset.guru };
    },
    save(preset) {
      storage.setItem(
        PRESET_KEY,
        JSON.stringify({ kelas: preset.kelas, guru: preset.guru }),
      );
    },
    remove() {
      storage.removeItem(PRESET_KEY);
    },
  };
}