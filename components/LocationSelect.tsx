"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type City = {
  id: number;
  adi: string | null;
};

type District = {
  id: number;
  adi: string | null;
  il_id: number | null;
};

type LocationSelectProps = {
  onCitySelect: (id: number, name: string) => void;
  onDistrictSelect: (id: number, name: string) => void;
};

export default function LocationSelect({
  onCitySelect,
  onDistrictSelect,
}: LocationSelectProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  const [cityQuery, setCityQuery] = useState("");
  const [districtQuery, setDistrictQuery] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const cityContainerRef = useRef<HTMLDivElement>(null);
  const districtContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchCities() {
      setLoadingCities(true);
      try {
        const res = await fetch("/api/locations/cities", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch cities");
        const data = (await res.json()) as City[];
        if (isMounted) setCities(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setCities([]);
      } finally {
        if (isMounted) setLoadingCities(false);
      }
    }

    fetchCities();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchDistricts(cityId: number) {
      setLoadingDistricts(true);
      try {
        const res = await fetch(`/api/locations/districts?cityId=${cityId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch districts");
        const data = (await res.json()) as District[];
        if (isMounted) setDistricts(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setDistricts([]);
      } finally {
        if (isMounted) setLoadingDistricts(false);
      }
    }

    if (selectedCityId === null) {
      setDistricts([]);
      return;
    }

    fetchDistricts(selectedCityId);

    return () => {
      isMounted = false;
    };
  }, [selectedCityId]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (cityContainerRef.current && !cityContainerRef.current.contains(target)) {
        setShowCityDropdown(false);
      }
      if (
        districtContainerRef.current &&
        !districtContainerRef.current.contains(target)
      ) {
        setShowDistrictDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((city) => (city.adi ?? "").toLowerCase().includes(q));
  }, [cities, cityQuery]);

  const filteredDistricts = useMemo(() => {
    const q = districtQuery.trim().toLowerCase();
    if (!q) return districts;
    return districts.filter((district) =>
      (district.adi ?? "").toLowerCase().includes(q)
    );
  }, [districts, districtQuery]);

  function handleCitySelect(city: City) {
    const cityName = city.adi ?? "";
    setSelectedCityId(city.id);
    setCityQuery(cityName);
    setDistrictQuery("");
    setShowCityDropdown(false);
    setShowDistrictDropdown(false);
    onCitySelect(city.id, cityName);
  }

  function handleDistrictSelect(district: District) {
    const districtName = district.adi ?? "";
    setDistrictQuery(districtName);
    setShowDistrictDropdown(false);
    onDistrictSelect(district.id, districtName);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="relative" ref={cityContainerRef}>
        <label className="mb-1 block text-sm font-medium text-foreground">Sehir</label>
        <input
          type="text"
          value={cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value);
            setShowCityDropdown(true);
          }}
          onFocus={() => setShowCityDropdown(true)}
          placeholder={loadingCities ? "Sehirler yukleniyor..." : "Sehir ara..."}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {showCityDropdown && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
            {loadingCities ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">Yukleniyor...</li>
            ) : filteredCities.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Sonuc bulunamadi.
              </li>
            ) : (
              filteredCities.map((city) => (
                <li
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className="cursor-pointer px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  {city.adi ?? "-"}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div className="relative" ref={districtContainerRef}>
        <label className="mb-1 block text-sm font-medium text-foreground">Ilce</label>
        <input
          type="text"
          value={districtQuery}
          onChange={(e) => {
            setDistrictQuery(e.target.value);
            if (selectedCityId !== null) setShowDistrictDropdown(true);
          }}
          onFocus={() => {
            if (selectedCityId !== null) setShowDistrictDropdown(true);
          }}
          disabled={selectedCityId === null}
          placeholder={
            selectedCityId === null
              ? "Once sehir secin"
              : loadingDistricts
              ? "Ilceler yukleniyor..."
              : "Ilce ara..."
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {showDistrictDropdown && selectedCityId !== null && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
            {loadingDistricts ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">Yukleniyor...</li>
            ) : filteredDistricts.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Sonuc bulunamadi.
              </li>
            ) : (
              filteredDistricts.map((district) => (
                <li
                  key={district.id}
                  onClick={() => handleDistrictSelect(district)}
                  className="cursor-pointer px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  {district.adi ?? "-"}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

