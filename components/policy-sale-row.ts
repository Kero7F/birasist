/**
 * Satır verisi: Poliçeler listesi + makbuz + sözleşme PDF için ortak şekil.
 * Tarihler istemciye ISO string olarak iletilir.
 */
export type PolicySaleRow = {
  id: string;
  sozlesmeNo: string;
  contractNo: string;
  agency: string;
  /** Acente şirket ünvanı (User.sirketAdi) — PDF/makbuz bayi adında öncelikli */
  sirketAdi?: string | null;
  bayiKodu: string;
  customer: string;
  customerIdentity: string;
  plate: string;
  packageName: string;
  packagePrice: number;
  totalPrice: number;
  paymentLabel: string;
  saleDateDisplay: string;
  createdAt: string;
  startDate: string;
  endDate: string | null;
  durationDays: number;
  netPrice: number | null;
  kdvAmount: number | null;
  kdvRate: number | null;
  acikAdres: string | null;
  marka: string | null;
  model: string | null;
  modelYili: number | null;
  kullanimTarzi: string | null;
  /** Marka/model boşsa sözleşmede `car_brand_model` metninden türetilir */
  carBrandModel?: string;
  /** Makbuz PDF: bayi adı; yoksa `agency` kullanılır */
  bayiAdi?: string;
  /** Makbuz PDF: müşteri görünen ad; yoksa `customer` */
  customerName?: string;
  /** Makbuz PDF: ödeme türü (örn. `Kredi Kartı`); yoksa `paymentLabel` */
  odemeYontemi?: string;
  /** Makbuz PDF: gösterilecek tutar; yoksa `totalPrice` */
  fiyat?: number;
  taksitSayisi?: number;
  /** Kredi kartı ödemesinde maskeli numara */
  krediKartiMaskeli?: string;
  musteri?: { adSoyad?: string };
};
