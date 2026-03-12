import carData from "./cars.json";

export const CAR_BRANDS: Record<string, string[]> = carData;

export const VEHICLE_USAGE_TYPES = [
  "Hususi Otomobil",
  "Kamyonet (Hususi Kullanım)",
  "Motosiklet (Hususi Kullanım)",
  "Zirai Kullanım Traktör",
  "Kamyonet (Açık Kasa)",
  "Panelvan / Kapalı Kasalı Kamyonet",
] as const;

/** Current year + 1 down to 1990, for model year selector. */
function buildYears(): number[] {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;
  const minYear = 1990;
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }
  return years;
}

export const YEARS = buildYears();

export type VehicleUsageType = (typeof VEHICLE_USAGE_TYPES)[number];
