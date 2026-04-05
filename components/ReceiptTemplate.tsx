import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import "@/components/pdf-roboto-fonts";
import { resolvePolicyBayiAdi } from "@/components/policy-bayi-display";
import type { PolicySaleRow } from "@/components/policy-sale-row";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandAsist: {
    color: "#ed1c24",
    fontSize: 18,
    fontWeight: 700,
  },
  brandOne: {
    color: "#000000",
    fontSize: 18,
    fontWeight: 700,
  },
  phone: {
    color: "#ed1c24",
    fontSize: 11,
    fontWeight: 700,
  },
  title: {
    textAlign: "center",
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: 700,
    marginTop: 30,
    marginBottom: 30,
  },
  gridContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
    marginTop: 20,
  },
  gridRow: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  gridColumn: {
    display: "flex",
    flexDirection: "row",
    width: "50%",
  },
  label: {
    width: "40%",
    fontWeight: "bold",
    fontSize: 10,
    color: "#000",
  },
  value: {
    width: "60%",
    fontSize: 10,
    color: "#374151",
  },
  footerText: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 40,
    lineHeight: 1.5,
  },
  highlightName: {
    color: "#3b82f6",
    textTransform: "uppercase",
  },
  highlightBold: {
    fontWeight: "bold",
    color: "#000",
  },
});

function formatTryLira(value: number): string {
  const n = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${n} ₺`;
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function GridField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.gridColumn}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function ReceiptTemplate({ sale }: { sale: PolicySaleRow }) {
  const bayiAdi = resolvePolicyBayiAdi(sale);
  const bayiKodu = sale.bayiKodu;
  const odemeYontemi = sale.odemeYontemi ?? sale.paymentLabel;
  const isKrediKarti = odemeYontemi.trim() === "Kredi Kartı";
  const krediKartNo = isKrediKarti
    ? (sale.krediKartiMaskeli ?? "**** **** **** ****")
    : "";
  const primTutariStr = formatTryLira(
    sale.fiyat ?? sale.packagePrice ?? sale.totalPrice
  );
  const toplamPrimStr = formatTryLira(sale.fiyat ?? sale.totalPrice);
  const taksitSayisi = String(sale.taksitSayisi ?? 1);
  const footerMusteri =
    sale.customerName?.trim() ||
    sale.musteri?.adSoyad?.trim() ||
    sale.customer?.trim() ||
    "MÜŞTERİ";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>
            <Text style={styles.brandAsist}>ASIST</Text>
            <Text style={styles.brandOne}>ONE</Text>
          </Text>
          <Text style={styles.phone}>0 506 756 60 64</Text>
        </View>

        <Text style={styles.title}>TAHSİLAT MAKBUZU</Text>

        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <GridField label="Bayi Adı" value={bayiAdi} />
            <GridField label="Bayi Kodu" value={bayiKodu || "—"} />
          </View>
          <View style={styles.gridRow}>
            <GridField label="Sözleşme Numarası" value={sale.sozlesmeNo} />
            <GridField
              label="Tarih"
              value={formatCreatedAt(sale.createdAt)}
            />
          </View>
          <View style={styles.gridRow}>
            <GridField label="Kredi Kartı No" value={krediKartNo} />
            <GridField label="Prim Tutarı" value={primTutariStr} />
          </View>
          <View style={styles.gridRow}>
            <GridField label="Taksit Sayısı" value={taksitSayisi} />
            <GridField label="Toplam Prim Tutarı" value={toplamPrimStr} />
          </View>
        </View>

        <Text style={styles.footerText}>
          Sayın{" "}
          <Text style={styles.highlightName}>{footerMusteri}</Text>,{" "}
          <Text style={styles.highlightBold}>{sale.sozlesmeNo}</Text> nolu hizmet
          sözleşmenizin bedeli{" "}
          <Text style={styles.highlightBold}>{toplamPrimStr}</Text> olarak
          tahsil edilmiştir. İşlem tutarınız tahsilat yönteminize göre
          yansıyacaktır. Farklı türlü ödemelerde kredi kartı numarası alanı boş
          görünecektir.
        </Text>
      </Page>
    </Document>
  );
}
