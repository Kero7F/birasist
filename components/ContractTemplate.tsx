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

export function formatContractDateDMY(
  value: Date | string | null | undefined
): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Roboto",
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginBottom: 15,
    border: "1pt solid black",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1pt solid black",
  },
  headerRow: {
    backgroundColor: "#ed1c24",
    color: "white",
    fontWeight: "bold",
    padding: 4,
    borderBottom: "1pt solid black",
  },
  labelCell: {
    backgroundColor: "#fce4d6",
    fontWeight: "bold",
    padding: 4,
    borderRight: "1pt solid black",
    flex: 1,
  },
  valueCell: {
    padding: 4,
    flex: 1,
    borderRight: "1pt solid black",
  },
  sectionTitle: {
    color: "#ed1c24",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  listItem: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 4,
    textAlign: "justify",
  },
  bullet: { width: 15 },
  itemText: { flex: 1 },
  docTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ed1c24",
    textAlign: "center",
    marginBottom: 12,
  },
  headerCellText: {
    flex: 1,
    textAlign: "center",
    fontSize: 9,
  },
});

function formatTry(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

function resolvePrim(sale: PolicySaleRow, isDiscounted: boolean) {
  const ratePct = sale.kdvRate ?? 20;
  const factor = 1 + ratePct / 100;

  if (isDiscounted) {
    const brut = sale.totalPrice;
    if (sale.netPrice != null && sale.kdvAmount != null) {
      return { net: sale.netPrice, kdv: sale.kdvAmount, brut };
    }
    const net = brut / factor;
    return { net, kdv: brut - net, brut };
  }

  const brut =
    sale.packagePrice > 0 ? sale.packagePrice : sale.totalPrice;
  const net = brut / factor;
  return { net, kdv: brut - net, brut };
}

const HIZMET_OZETI_MADDELER = [
  "Sözleşme süresince 7/24, 0553 932 7293 numaralı hattın aranması ön koşuluyla aşağıda belirtilmiş olan hizmetlerden faydalanabilecektir.",
  "Yol Yardım Plus Paketi; Hususi Kullanım Otomobil, Hususi Kullanım Kamyonet, Hafif Ticari Araçları (Açık / Kapalı Kasa Kamyonet, Pick Up, Panelvan, 9-22 Koltuk Arası Minibüs, Motosiklet) herhangi bir yaş sınırı olmaksızın kapsamaktadır.",
  "Paket satın alındıktan 10 gün sonra aktif olur. Ancak Trafik poliçesi veya tanzim günü ile aynı gün paket satın alıp sözleşme düzenlenmesi durumunda sözleşme; aynı gün aktif olacaktır.",
  "Paket satın alım tarihinden itibaren 14 gün içerisinde iptal veya araç değişikliği yapılabilmektedir.",
  "Hizmetten yararlanacak müşterinin, ikinci defa hizmet talebi; ilk hizmet talebinin üzerinden 10 gün geçmesi şartıyla karşılanacaktır. Hizmet başlangıç tarihi gelmeden tarafımıza hizmet talebinde bulunması durumunda, talep tarihinden itibaren hizmet istenilen araç için; 10 gün boyunca sözleşme durdurulur. Bu sürenin ardından sözleşme tekrar devreye girer.",
];

const LIMITLER_MADDELER = [
  "Arıza durumunda yılda 2 defa, kaza durumunda 2 defa çekim hizmeti sağlanmaktadır. Olay başı azami 3000 ₺ limit dahilinde aracın olayın gerçekleştiği yere en yakın oto tamirhaneye kadar, çekilmesi hizmetini kapsamaktadır. Aracın en yakın tamirhane yerine başka bir yere çekilmesi hâlinde oluşacak fark ise hizmet alıcısı tarafından ödenecektir.",
  "Paket kapsamındaki aracın, kaza sonucu devrilmesi veya şarampole yuvarlanması nedeniyle hareketsiz kalması hâlinde; kurtarılmasının mümkün olması durumunda, aracın kurtarılarak yoluna devam edebilmesi için uygun bir yere alınmasına yönelik organizasyon hizmet ücreti müşteriye aittir.",
  "Paket kapsamındaki aracın herhangi bir nedenle lastiğinin patlaması, yakıt ve akü bitmesi paketteki arıza hakkından kullanılarak olay başı limit dahilinde hizmet verilecektir. Lastiğin tamiri ile ilgili malzeme ücretleri, hizmetten yararlanacak müşteri tarafından ödenmek suretiyle değiştirilecektir. Lastik değişimi veya yakıt ikmali yapılamayan durumlarda, aracın en yakın lastikçiye, servise veya benzin istasyonuna taşınması sağlanacaktır.",
  "Paket toplam limiti olan 12.000 ₺ limitin aşılması durumunda hizmet sözleşmesi bildirime gerek olmaksızın sona erecektir.",
  "Limitlerin birbirine aktarılması ve/veya kullanılması talep edilemez.",
];

const OZEL_HUSUSLAR_MADDELER = [
  "Araç kullanım türüne uygun paket satın alınmaması hâlinde hizmet sağlanamaz; bu durumdan doğan tüm sorumluluk hizmet alıcısına aittir. Paketler, 3.000 kg ve altındaki araçlar için geçerlidir.",
  "Sözleşmeye konu aracın, hizmeti alanın talebine bağlı olarak olay yerine en yakın oto tamirhaneden başka bir konuma çekilmesi durumunda oluşacak fark hizmet alan tarafından ödenecektir.",
  "Arıza veya kaza anında sözleşmeye konu aracın çekilme hizmeti nedeniyle oluşacak yol, köprü geçişleri, ücretli geçişler, otopark bedelleri ve hangi başlık altında olursa olsun benzeri tüm bedeller hizmet alıcısı tarafından ödenecektir.",
  "Hizmet alıcısı; hizmet sağlayan firmaya gerekli ve makul evrak, belge ve dokümanları (araç ruhsatı, ehliyet belgesi, sözleşme örneği, resim, video ve tüm ilgili belgeleri) sunmakla mükelleftir.",
  "Hizmet alıcısı, başvuru esnasında beyan ettiği tüm bilgilerin eksiksiz, doğru ve güncel olduğunu kabul ve taahhüt eder. Yanlış, eksik veya gerçeğe aykırı bilgi verilmesinden doğacak her türlü sorumluluk hizmet alıcısına aittir.",
  "Hizmet alıcısı; çağrı merkezini aramadan aracını kendi imkanıyla çektirmesi durumunda hizmetten faydalanamayacaktır. Hizmet sağlayıcısından ücret talep edemeyecektir.",
  "Hizmet alıcısının talebi üzerine servis sağlayıcı yönlendirilmesine rağmen; yönlendirilen servis sağlayıcısını beklememesi veya gelen servis sağlayıcısını geçerli bir sebep olmaksızın kabul etmemesi durumunda, paket haklarından biri kullanılmış sayılır.",
  "Hizmet alıcısının aracında bulunan ek modifiye nedeniyle, çekim sırasında oluşabilecek ücret farkları ile aracın çekiciye yüklenmesi için gerekli vinç ve ahtapot maliyetleri hizmet alıcısına aittir.",
  "Çekme veya kurtarma, hizmet sağlayıcılarının güvenle ve emniyetle ulaşabileceği devlet karayolları üzerinde verilmektedir. Aracın, karayolu haricinde, adalar, patika yol, tarla yolu, bahçe yolu, arazi yolu, kapalı otoparklarda, özel askerî alanlarda veya özel izinle girilen yerlerde olması hâlinde hizmet yerine getirilmeyecektir.",
  "İçişleri Bakanlığı tarafından terör bölgesi ve özel güvenlik bölgesi ilan edilen il/ilçelerde ve grev, kargaşalık gibi halk hareketlerinin olması durumunda hizmet verilmeyecektir.",
  "Sözleşmeye konu aracın bagaj ve yükünden dolayı çekim yapılamaması hâlinde aracın boşaltılmasından veya araç boşaltma ücretinden hizmet veren firma (ASİSTONE) sorumlu değildir. Arızalı aracın yükü ile beraber çekimi için talep edilen ücret farkı, hizmet alıcısı tarafından karşılanacaktır.",
  "Sözleşmeye konu arızalı veya kazaya uğramış aracın çekiciye yüklenmesi, kurtarılması ve tamirhaneye çekimi sırasında oluşacak hasarlar Çekici/Kurtarıcı veya hizmet alıcısı sorumluluğundadır. Arızalı veya kazalı aracın çekiciye yüklenmesi, kurtarılması ve tamirhaneye/servise çekimi sırasında oluşacak hasarlar ve hangi başlık altında olursa olsun oluşabilecek/oluşan hasarlardan hiçbir şekilde ASİSTONE sorumlu değildir.",
  "Sözleşmeye konu araçta; farların yeterli düzeyde aydınlatmaması, cam kırılması, cam sileceklerinin çalışmaması, mazotun donması, korna arızası, anahtar kaybı, çilingir hizmeti ihtiyacı ve aracın yürümesine etki etmeyen benzeri arızalar ile karlı ve yağışlı havalarda aracın yolda ilerleyememesi, çamura batması veya kara saplanması durumları mekanik arıza olarak değerlendirilmeyecek olup, hizmet kapsamı dışında sayılacaktır.",
  "ASİSTONE tarafından, sözleşmeye konu borcun ifa edileceği bölgedeki anlaşmalı hizmet sağlayıcıların imkân ve yeterlilikleri kapsamında; fiziki, coğrafi ve iklimsel şartların (sel, çığ, toprak kayması v.b) mümkün kıldığı ölçüde, sözleşme kapsamında hizmet veya yol yardım organizasyonu gerçekleştirilecektir. Hizmet sağlayıcısının belirteceği nedenlerden dolayı organizasyonun yapılamaması ve hizmet alıcısının kendi imkânları ile yapacağı çekim maliyetleri sözleşme limitleri dâhilinde hizmet vermekle yükümlü firmanın (ASİSTONE) onay vermesi durumunda hizmet alıcısına ödenecektir.",
  "Hizmet vermekle yükümlü firma olan ASİSTONE, hizmet alıcısının dürüstlük kurallarına aykırı biçimde yanlış veya gerçeğe aykırı beyanda bulunduğunun, kötü niyetli davrandığının ya da riski gerçekleşmiş veya gerçekleşmesi muhtemel bir araca paket satışı yapıldığının tespit edilmesi hâlinde, sözleşme ASİSTONE tarafından tek taraflı olarak feshedilebilir.",
];

function TableHeader({ title }: { title: string }) {
  return (
    <View style={[styles.row, styles.headerRow]} wrap={false}>
      <Text style={styles.headerCellText}>{title}</Text>
    </View>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row} wrap={false}>
      <View style={styles.labelCell}>
        <Text>{label}</Text>
      </View>
      <View style={styles.valueCell}>
        <Text>{value}</Text>
      </View>
    </View>
  );
}

function NumberedItems({
  items,
  startIndex,
}: {
  items: readonly string[];
  startIndex: number;
}) {
  return (
    <>
      {items.map((text, i) => (
        <View key={i} style={styles.listItem} wrap={false}>
          <Text style={styles.bullet}>{startIndex + i}.</Text>
          <Text style={styles.itemText}>{text}</Text>
        </View>
      ))}
    </>
  );
}

export type ContractTemplateProps = {
  sale: PolicySaleRow;
  isDiscounted: boolean;
};

export default function ContractTemplate({
  sale,
  isDiscounted,
}: ContractTemplateProps) {
  const { net, kdv, brut } = resolvePrim(sale, isDiscounted);
  const rateLabel = Math.round(sale.kdvRate ?? 20);
  const duration = sale.durationDays > 0 ? String(sale.durationDays) : "365";

  const fallbackBm = (() => {
    const raw = sale.carBrandModel?.trim();
    if (!raw) return { m: "—", d: "—" };
    const p = raw.split(/\s+/).filter(Boolean);
    if (p.length === 0) return { m: "—", d: "—" };
    if (p.length === 1) return { m: p[0]!, d: "—" };
    return { m: p[0]!, d: p.slice(1).join(" ") };
  })();

  const marka = sale.marka?.trim() || fallbackBm.m;
  const model = sale.model?.trim() || fallbackBm.d;
  const yil =
    sale.modelYili != null && !Number.isNaN(sale.modelYili)
      ? String(sale.modelYili)
      : "—";
  const tur = sale.kullanimTarzi?.trim() || "—";
  const adres = sale.acikAdres?.trim() || "—";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.docTitle}>
          ASİSTONE YOL YARDIM — HİZMET SÖZLEŞMESİ
        </Text>

        <View style={styles.table}>
          <TableHeader title="ASİSTONE YOL YARDIM HİZMETLERİ SÖZLEŞMESİ BİLGİLERİ" />
          <DataRow
            label="KOD"
            value={sale.bayiKodu?.trim() ? sale.bayiKodu.trim() : "—"}
          />
          <DataRow label="BAYİ ADI" value={resolvePolicyBayiAdi(sale)} />
          <DataRow label="SÖZLEŞME NO" value={sale.sozlesmeNo} />
          <DataRow
            label="TANZİM TARİHİ"
            value={formatContractDateDMY(sale.createdAt)}
          />
          <DataRow
            label="BAŞLANGIÇ TARİHİ"
            value={formatContractDateDMY(sale.startDate)}
          />
          <DataRow
            label="BİTİŞ TARİHİ"
            value={formatContractDateDMY(sale.endDate)}
          />
          <DataRow label="SÜRESİ" value={`${duration} gün`} />
        </View>

        <View style={styles.table}>
          <TableHeader title="HİZMET ALAN BİLGİLERİ" />
          <DataRow label="ADI SOYADI / ÜNVANI" value={sale.customer} />
          <DataRow label="ADRESİ" value={adres} />
        </View>

        <View style={styles.table}>
          <TableHeader title="ARAÇ BİLGİLERİ" />
          <DataRow label="PLAKA" value={sale.plate} />
          <DataRow label="MARKA" value={marka} />
          <DataRow label="MODEL" value={model} />
          <DataRow label="MODEL YIL" value={yil} />
          <DataRow label="TÜR" value={tur} />
        </View>

        <View style={styles.table}>
          <TableHeader title="PRİM BİLGİLERİ" />
          <DataRow label="NET PRİM" value={formatTry(net)} />
          <DataRow label={`KDV (%${rateLabel})`} value={formatTry(kdv)} />
          <DataRow label="BRÜT PRİM" value={formatTry(brut)} />
        </View>

        <Text style={styles.sectionTitle}>HİZMET ÖZETİ</Text>
        <NumberedItems items={HIZMET_OZETI_MADDELER} startIndex={1} />

        <Text style={styles.sectionTitle}>HİZMET LİMİTLERİ VE ŞARTLARI</Text>
        <NumberedItems items={LIMITLER_MADDELER} startIndex={6} />

        <Text style={styles.sectionTitle}>
          HİZMET SÖZLEŞMESİNE İLİŞKİN ÖZEL HUSUSLAR
        </Text>
        <NumberedItems items={OZEL_HUSUSLAR_MADDELER} startIndex={11} />
      </Page>
    </Document>
  );
}
