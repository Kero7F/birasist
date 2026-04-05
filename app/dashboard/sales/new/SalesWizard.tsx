"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import {
  CAR_BRANDS,
  VEHICLE_USAGE_TYPES,
  YEARS
} from "@/lib/data/vehicles";
import {
  NameInput,
  TcInput,
  PhoneInput
} from "@/components/ui/SmartInputs";
import LocationSelect from "@/components/LocationSelect";
import {
  checkCustomerByTc,
  checkVehicleByPlate,
  type CheckCustomerState,
  type CheckVehicleState
} from "../actions";
import { checkoutPolicy } from "../actions";

type CustomerOption = {
  id: string;
  full_name: string;
  tc_no: string;
  phone: string;
};

type PackageOption = {
  id: string;
  name: string;
  limits_description: string;
  base_price: number;
  commission_amount: number;
  price: number;
  commission: number;
};

type SalesWizardProps = {
  customers: CustomerOption[];
  packages: PackageOption[];
  walletBalance: number;
};

type Step = 1 | 2 | 3 | 4;

const brandKeys = Object.keys(CAR_BRANDS);

export function SalesWizard({
  customers,
  packages,
  walletBalance
}: SalesWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const router = useRouter();

  const [tcNo, setTcNo] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [ilId, setIlId] = useState<number | null>(null);
  const [ilceId, setIlceId] = useState<number | null>(null);
  const [cityName, setCityName] = useState<string>("");
  const [districtName, setDistrictName] = useState<string>("");
  const [isNewCustomer, setIsNewCustomer] = useState<boolean>(true);

  const [plateNumber, setPlateNumber] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [usageType, setUsageType] = useState<string>("");
  const [isNewVehicle, setIsNewVehicle] = useState<boolean>(true);

  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const todayIso = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );
  const [serviceStartDate, setServiceStartDate] = useState<string>(todayIso);
  const [kvkkAccepted, setKvkkAccepted] = useState<boolean>(false);
  const [sameDayTraffic, setSameDayTraffic] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "wallet" | "credit_card"
  >("cash");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [calculatedCommission, setCalculatedCommission] = useState<number>(0);
  const [finalCommission, setFinalCommission] = useState<number>(0);
  const [netPrice, setNetPrice] = useState<number>(0);

  const [customerCheckState, customerCheckAction] = useFormState<
    CheckCustomerState,
    FormData
  >(checkCustomerByTc, { checked: false, found: false });

  const [vehicleCheckState, vehicleCheckAction] = useFormState<
    CheckVehicleState,
    FormData
  >(checkVehicleByPlate, { checked: false, found: false });

  useEffect(() => {
    if (!customerCheckState.checked) return;

    if (customerCheckState.found) {
      setFirstName(customerCheckState.firstName ?? "");
      setLastName(customerCheckState.lastName ?? "");
      setPhone(customerCheckState.phone ?? "");
      setIsNewCustomer(false);
    } else {
      setIsNewCustomer(true);
    }
  }, [customerCheckState]);

  useEffect(() => {
    if (!vehicleCheckState.checked) return;

    if (vehicleCheckState.found) {
      setPlateNumber(vehicleCheckState.plateNumber ?? plateNumber);
      setBrand(vehicleCheckState.brand ?? "");
      setModel(vehicleCheckState.model ?? "");
      setYear(
        vehicleCheckState.year != null
          ? String(vehicleCheckState.year)
          : year
      );
      setUsageType(vehicleCheckState.usageType ?? "");
      setIsNewVehicle(false);
    } else {
      setIsNewVehicle(true);
    }
  }, [vehicleCheckState, plateNumber, year]);

  const modelsForBrand = useMemo(() => {
    if (!brand || !CAR_BRANDS[brand]) return [] as string[];
    return CAR_BRANDS[brand];
  }, [brand]);

  const handleTcChange = (value: string) => {
    setTcNo(value);

    if (value.length === 11) {
      const fd = new FormData();
      fd.set("tc", value);
      customerCheckAction(fd);
    }
  };

  const handlePlateChange = (raw: string) => {
    const formattedPlate = raw.replace(/\s/g, "").toUpperCase();
    setPlateNumber(formattedPlate);

    if (!formattedPlate) return;

    if (formattedPlate.length >= 5) {
      const fd = new FormData();
      fd.set("plate", formattedPlate);
      vehicleCheckAction(fd);
    }
  };

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) ?? null,
    [packages, selectedPackageId]
  );

  const fullPackagePrice = useMemo(() => {
    if (!selectedPackage) return 0;
    return selectedPackage.price > 0
      ? selectedPackage.price
      : selectedPackage.base_price;
  }, [selectedPackage]);

  const priceOptions = useMemo(() => {
    if (!selectedPackage) return [] as number[];
    const base = selectedPackage.base_price;
    return [0, 200, 400, 600].map((inc) => base + inc);
  }, [selectedPackage]);

  useEffect(() => {
    if (!selectedPackage) {
      setSelectedPrice(null);
      setCalculatedCommission(0);
      setFinalCommission(0);
      setNetPrice(0);
      setDiscount(0);
      return;
    }

    if (selectedPrice === null) {
      setSelectedPrice(selectedPackage.base_price);
    }
  }, [selectedPackage, selectedPrice]);

  useEffect(() => {
    if (!selectedPackage || selectedPrice === null) {
      setCalculatedCommission(0);
      setFinalCommission(0);
      setNetPrice(0);
      return;
    }

    // Temporary manual commission logic until admin configuration is ready.
    const baseCommission =
      selectedPackage.name === "Yol Yardım Plus"
        ? 270
        : selectedPackage.commission_amount;

    const safeDiscount = Math.min(discount, baseCommission);

    setCalculatedCommission(baseCommission);
    setFinalCommission(baseCommission - safeDiscount);
    setNetPrice(selectedPrice - safeDiscount);
    if (safeDiscount !== discount) {
      setDiscount(safeDiscount);
    }
  }, [selectedPackage, selectedPrice, discount]);

  const canGoNext = (): boolean => {
    if (step === 1) {
      return (
        tcNo.length === 11 &&
        firstName.trim().length > 0 &&
        phone.trim().length > 0
      );
    }
    if (step === 2) {
      return (
        plateNumber.trim().length > 0 &&
        brand.trim().length > 0 &&
        model.trim().length > 0 &&
        year.trim().length > 0 &&
        usageType.trim().length > 0
      );
    }
    if (step === 3) {
      return selectedPackageId.length > 0 && kvkkAccepted;
    }
    return true;
  };

  const goNext = () => {
    if (!canGoNext()) return;
    setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev));
  };

  const goBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  };

  const handleCheckout = () => {
    setSubmitError(null);
    // Step 3 — Hizmet Başlangıç Tarihi (`type="date"` → YYYY-MM-DD); sunucuda startDate/endDate buna göre yazılır.
    const startDateIso = serviceStartDate.trim();
    const payload = {
      paymentMethod,
      customer: {
        tcNo,
        firstName,
        lastName,
        phone,
        il_id: ilId,
        ilce_id: ilceId,
        isNewCustomer
      },
      vehicle: {
        plateNumber,
        brand,
        model,
        year,
        usageType,
        isNewVehicle
      },
      selectedPackage,
      startDate: startDateIso,
      pricing: {
        selectedPrice,
        discount,
        finalCommission,
        netPrice
      },
      payment: {
        method: paymentMethod,
        sameDayTraffic
      }
    };

    startTransition(async () => {
      try {
        await checkoutPolicy(payload);
        alert("Poliçe başarıyla kesildi!");
        router.push("/dashboard/policeler");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "İşlem sırasında beklenmeyen bir hata oluştu.";
        setSubmitError(message);
        alert(message);
      }
    });
  };

  const currentStepLabel = (current: Step) => {
    switch (current) {
      case 1:
        return "Müşteri Bilgileri";
      case 2:
        return "Araç Bilgileri";
      case 3:
        return "Paket Seçimi";
      case 4:
        return "Özet & Onay";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm">
        <div className="flex flex-1 items-center gap-3">
          {[1, 2, 3, 4].map((s) => {
            const index = s as Step;
            const isActive = step === index;
            const isCompleted = step > index;

            return (
              <div
                key={index}
                className="flex flex-1 items-center gap-2 last:flex-none"
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-emerald-950"
                        : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {index}
                </div>
                <span
                  className={`hidden text-xs font-medium md:inline ${
                    isActive
                      ? "text-foreground"
                      : isCompleted
                        ? "text-emerald-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {currentStepLabel(index)}
                </span>
                {index < 4 && (
                  <div className="hidden flex-1 border-t border-dashed border-border md:block" />
                )}
              </div>
            );
          })}
        </div>
        <span className="ml-4 hidden text-xs text-muted-foreground md:inline">
          Adım {step} / 4
        </span>
      </div>

      {step === 1 && (
        <section className="rounded-lg border border-border bg-card p-4 space-y-4 dark:bg-card">
          <h2 className="text-sm font-semibold text-foreground">
            1. Müşteri Bilgileri
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="wizard-tc"
                className="block text-xs font-medium text-muted-foreground"
              >
                TC Kimlik No
              </label>
              <TcInput
                id="wizard-tc"
                name="wizard-tc"
                value={tcNo}
                onChange={(val) => handleTcChange(val)}
                placeholder="11 haneli TC no"
              />
              {customerCheckState.error && (
                <p className="text-xs text-red-400">
                  {customerCheckState.error}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="wizard-phone"
                className="block text-xs font-medium text-muted-foreground"
              >
                Telefon
              </label>
              <PhoneInput
                id="wizard-phone"
                name="wizard-phone"
                value={phone}
                onChange={(val) => setPhone(val)}
                placeholder="+90 (5XX) XXX XX XX"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="wizard-firstName"
                className="block text-xs font-medium text-muted-foreground"
              >
                Ad
              </label>
              <NameInput
                id="wizard-firstName"
                name="wizard-firstName"
                value={firstName}
                onChange={(val) => setFirstName(val)}
                placeholder="Ad"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="wizard-lastName"
                className="block text-xs font-medium text-muted-foreground"
              >
                Soyad
              </label>
              <NameInput
                id="wizard-lastName"
                name="wizard-lastName"
                value={lastName}
                onChange={(val) => setLastName(val)}
                placeholder="Soyad"
              />
            </div>
          </div>

          <LocationSelect
            onCitySelect={(id, name) => {
              setIlId(id);
              setCityName(name);
              setIlceId(null);
              setDistrictName("");
            }}
            onDistrictSelect={(id, name) => {
              setIlceId(id);
              setDistrictName(name);
            }}
          />
        </section>
      )}

      {step === 2 && (
        <section className="rounded-lg border border-border bg-card p-4 space-y-4 dark:bg-card">
          <h2 className="text-sm font-semibold text-foreground">
            2. Araç Bilgileri
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="wizard-plate"
                className="block text-xs font-medium text-muted-foreground"
              >
                Araç Plakası
              </label>
              <input
                id="wizard-plate"
                type="text"
                value={plateNumber}
                onChange={(e) => handlePlateChange(e.target.value)}
                maxLength={11}
                className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground uppercase outline-none transition focus:ring-2 focus:ring-ring"
                placeholder="34ABC123"
              />
              {vehicleCheckState.error && (
                <p className="text-xs text-red-400">
                  {vehicleCheckState.error}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="wizard-usageType"
                className="block text-xs font-medium text-muted-foreground"
              >
                Araç Kullanım Türü
              </label>
              <select
                id="wizard-usageType"
                value={usageType}
                onChange={(e) => setUsageType(e.target.value)}
                className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
              >
                <option value="">Kullanım türü seçin...</option>
                {VEHICLE_USAGE_TYPES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="wizard-brand"
                className="block text-xs font-medium text-muted-foreground"
              >
                Araç Markası
              </label>
              <select
                id="wizard-brand"
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setModel("");
                }}
                className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
              >
                <option value="">Marka seçin...</option>
                {brandKeys.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="wizard-model"
                className="block text-xs font-medium text-muted-foreground"
              >
                Araç Modeli
              </label>
              <select
                id="wizard-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!brand}
                className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option value="">Önce marka seçin...</option>
                {modelsForBrand.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="wizard-year"
                className="block text-xs font-medium text-muted-foreground"
              >
                Model Yılı
              </label>
              <select
                id="wizard-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
              >
                <option value="">Yıl seçin...</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="rounded-lg border border-border bg-card p-4 space-y-5 dark:bg-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                3. Paket Seçimi
              </h2>
              <p className="text-xs text-muted-foreground">
                Hizmet başlangıç tarihini seçin ve paketin kapsamını inceleyin.
              </p>
            </div>
            <div className="space-y-1 text-right">
              <label
                htmlFor="service-start-date"
                className="block text-[11px] font-medium text-muted-foreground"
              >
                Hizmet Başlangıç Tarihi
              </label>
              <input
                id="service-start-date"
                type="date"
                value={serviceStartDate}
                min={todayIso}
                onChange={(e) => setServiceStartDate(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none transition focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {packages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Henüz tanımlı paket bulunmamaktadır.
            </p>
          ) : (
          <div className="grid gap-4 md:grid-cols-[2fr_minmax(260px,1.4fr)]">
            <div className="grid gap-3 sm:grid-cols-2">
                {packages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`flex flex-col items-stretch rounded-lg border px-4 py-3 text-left text-sm transition ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">
                          {pkg.name}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {pkg.base_price.toLocaleString("tr-TR", {
                            style: "currency",
                            currency: "TRY"
                          })}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                        {pkg.limits_description}
                      </p>
                      <p className="mt-1 text-[11px] text-emerald-500">
                        Komisyon:{" "}
                        {pkg.commission_amount.toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY"
                        })}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 rounded-lg border border-border bg-background/60 p-3 text-sm">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Paket &amp; Fiyat Özeti
                </h3>
                {selectedPackage ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">
                        {selectedPackage.name}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {selectedPackage.base_price.toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY"
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedPackage.limits_description}
                    </p>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-muted-foreground">
                          Satış Fiyatı
                        </label>
                        <select
                          value={selectedPrice ?? ""}
                          onChange={(e) =>
                            setSelectedPrice(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Fiyat seçin...</option>
                          {priceOptions.map((p) => (
                            <option key={p} value={p}>
                              {p.toLocaleString("tr-TR", {
                                style: "currency",
                                currency: "TRY"
                              })}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-muted-foreground">
                          İskonto Tutarı (₺)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={discount}
                          onChange={(e) =>
                            setDiscount(Math.max(0, Number(e.target.value) || 0))
                          }
                          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="mt-2 space-y-0.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Komisyon
                          </span>
                          <span className="font-medium text-foreground">
                            {calculatedCommission.toLocaleString("tr-TR", {
                              style: "currency",
                              currency: "TRY"
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            İskonto
                          </span>
                          <span className="font-medium text-red-500">
                            -
                            {discount.toLocaleString("tr-TR", {
                              style: "currency",
                              currency: "TRY"
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Kalan Komisyon
                          </span>
                          <span className="font-medium text-emerald-500">
                            {finalCommission.toLocaleString("tr-TR", {
                              style: "currency",
                              currency: "TRY"
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-dashed border-border pt-1 mt-1">
                          <span className="text-muted-foreground">
                            Net Fiyat
                          </span>
                          <span className="font-semibold text-foreground">
                            {netPrice.toLocaleString("tr-TR", {
                              style: "currency",
                              currency: "TRY"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sağdan bir paket seçtiğinizde kapsam ve fiyat hesaplaması
                    burada gösterilecektir.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-xs">
            <input
              id="kvkk-checkbox"
              type="checkbox"
              checked={kvkkAccepted}
              onChange={(e) => setKvkkAccepted(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-border bg-background text-primary focus:ring-2 focus:ring-ring"
            />
            <label
              htmlFor="kvkk-checkbox"
              className="cursor-pointer text-[11px] leading-snug text-muted-foreground"
            >
              KVKK ve Mesafeli Satış Sözleşmesini okudum, kabul ediyorum.
            </label>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="rounded-lg border border-border bg-card p-4 space-y-4 dark:bg-card">
          <h2 className="text-sm font-semibold text-foreground">
            4. Özet &amp; Ödeme
          </h2>
          {submitError && (
            <div className="rounded-md border border-red-500/60 bg-red-950/60 px-3 py-2 text-xs text-red-100">
              {submitError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
            {/* Left: Summary */}
            <div className="space-y-4 text-sm">
              <div className="rounded-md border border-border bg-background/60 p-3 space-y-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Müşteri
                </h3>
                <p className="text-foreground">
                  {firstName} {lastName}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({tcNo || "TC yok"})
                  </span>
                </p>
                <p className="text-muted-foreground">
                  {phone || "Telefon yok"}
                </p>
                {(cityName || districtName) && (
                  <p className="text-muted-foreground text-xs">
                    {cityName} {districtName && ` / ${districtName}`}
                  </p>
                )}
              </div>

              <div className="rounded-md border border-border bg-background/60 p-3 space-y-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Araç
                </h3>
                <p className="text-foreground font-mono">{plateNumber}</p>
                <p className="text-muted-foreground">
                  {brand} {model && `/ ${model}`} {year && `• ${year}`}
                </p>
                <p className="text-muted-foreground text-xs">
                  {usageType || "Kullanım türü seçilmedi"}
                </p>
              </div>

              <div className="rounded-md border border-border bg-background/60 p-3 space-y-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Paket Özeti
                </h3>
                {selectedPackageId ? (
                  (() => {
                    const pkg =
                      packages.find((p) => p.id === selectedPackageId) ?? null;
                    if (!pkg)
                      return (
                        <p className="text-xs text-muted-foreground">—</p>
                      );
                    return (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">
                            {pkg.name}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {pkg.base_price.toLocaleString("tr-TR", {
                              style: "currency",
                              currency: "TRY"
                            })}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {pkg.limits_description}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Hizmet Başlangıç Tarihi:{" "}
                          <span className="font-medium text-foreground">
                            {serviceStartDate ||
                              new Date().toLocaleDateString("tr-TR")}
                          </span>
                        </p>
                      </>
                    );
                  })()
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Henüz bir paket seçilmedi.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Payment */}
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2 text-xs">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">
                    Trafik poliçesi aynı gün başlıyor mu?
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {serviceStartDate === todayIso
                      ? "Aynı gün başlayan poliçeler için ek kontrol yapılacaktır."
                      : "Poliçe tarihi değiştirildi."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (serviceStartDate !== todayIso) return;
                    setSameDayTraffic((v) => !v);
                  }}
                  disabled={serviceStartDate !== todayIso}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
                    sameDayTraffic
                      ? "border-emerald-500 bg-emerald-500/90"
                      : "border-border bg-background"
                  } ${serviceStartDate !== todayIso ? "opacity-60" : ""}`}
                  aria-pressed={sameDayTraffic}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition ${
                      sameDayTraffic ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="payment-method"
                  className="block text-xs font-medium text-muted-foreground"
                >
                  Ödeme Yöntemi
                </label>
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value as "cash" | "wallet" | "credit_card"
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                >
                  <option value="cash">Nakit / POS</option>
                  <option value="wallet">Cüzdan Bakiyesi</option>
                  <option value="credit_card">Kredi Kartı</option>
                </select>
              </div>

              {paymentMethod === "wallet" && (
                <div className="rounded-md border border-border bg-background/60 px-3 py-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Mevcut Bakiyemden Öde
                    </span>
                    <span className="text-[11px] font-mono text-emerald-500">
                      {walletBalance.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY"
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Paket fiyatı kadar bakiye gerekir; tahsilat net maliyet
                    (komisyon düşülmüş) üzerinden cüzdandan düşülür.
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={
                        isSubmitting ||
                        netPrice <= 0 ||
                        walletBalance < fullPackagePrice
                      }
                      className="inline-flex w-full items-center justify-center rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-950 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting
                        ? "İşleniyor..."
                        : `Mevcut Bakiyem İle Öde (${netPrice.toLocaleString(
                            "tr-TR",
                            {
                              style: "currency",
                              currency: "TRY"
                            }
                          )})`}
                    </button>
                    {walletBalance < fullPackagePrice && fullPackagePrice > 0 && (
                      <p className="mt-1 text-[11px] text-red-500">
                        Yetersiz bakiye. Paket tutarı için bakiyeniz yetersiz.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === "credit_card" && (
                <div className="rounded-md border border-border bg-background/60 px-3 py-3 text-xs">
                  <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                    Kart İle Öde
                  </span>
                  <div className="mt-2 grid gap-2">
                    <input
                      type="text"
                      placeholder="Kart üzerindeki isim"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="text"
                      placeholder="Kart numarası"
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="AA/YY"
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={isSubmitting || netPrice <= 0}
                        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSubmitting
                          ? "İşleniyor..."
                          : `Kart ile Öde (${netPrice.toLocaleString("tr-TR", {
                              style: "currency",
                              currency: "TRY"
                            })})`}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="rounded-md border border-dashed border-border bg-background/40 px-3 py-3 text-xs">
                  <p className="mb-2 text-[11px] text-muted-foreground">
                    Ödeme fiziksel olarak nakit veya POS üzerinden tahsil
                    edilecektir; cüzdandan net maliyet düşümü uygulanır.
                  </p>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isSubmitting || netPrice <= 0}
                    className="inline-flex w-full items-center justify-center rounded-md border border-emerald-600 bg-emerald-600 px-3 py-2 text-sm font-medium text-emerald-50 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting
                      ? "İşleniyor..."
                      : "Nakit / POS ile Poliçeyi Kes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Geri
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext()}
            className="rounded-md border border-primary bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Devam Et
          </button>
        ) : (
          <p className="max-w-xs text-right text-xs text-muted-foreground">
            Ödemeyi tamamlamak için sağdaki ilgili butonu kullanın.
          </p>
        )}
      </div>
    </div>
  );
}

