// Server-side HTML template for service report PDF generation

const SERVICE_TYPE_LABELS: Record<string, string> = {
  periyodik_bakim: "Periyodik Bakım",
  ariza_mudahalesi: "Arıza Müdahalesi",
  yedek_parca: "Yedek Parça",
  genel_kontrol: "Genel Kontrol",
  devreye_alma: "Devreye Alma",
  garanti_servisi: "Garanti Servisi",
};

const PRIORITY_LABELS: Record<string, string> = {
  acil: "ACİL",
  yuksek: "Yüksek",
  normal: "Normal",
  dusuk: "Düşük",
};

const ALARM_LABELS: Record<string, string> = {
  dusuk_vakum: "Düşük Vakum Alarmı",
  yuksek_sicaklik: "Yüksek Sıcaklık Alarmı",
  termik_hata: "Termik Hatası",
  sensor_hata: "Sensör Hatası",
  bakim_suresi_doldu: "Bakım Süresi Doldu",
  acil_ariza: "Acil Arıza",
};

const ALARM_STATUS_LABELS: Record<string, string> = {
  yok: "Yok",
  var: "Var",
  kontrol_edildi: "Kontrol Edildi",
  mudahale_edildi: "Müdahale Edildi",
};

const SIGNATURE_ROLE_LABELS: Record<string, string> = {
  personel: "Servis Personeli",
  sorumlu: "Teknik Sorumlu",
  yetkili: "Hastane Yetkilisi",
};

const DEFAULT_OPERATIONS = [
  "Yağ seviyesi kontrol edildi",
  "Vakum filtresi kontrol edildi",
  "Yağ filtreleri değiştirildi",
  "Kaçak kontrolü yapıldı",
  "Elektrik bağlantıları kontrol edildi",
  "Vakum sensörü kalibrasyonu kontrol edildi",
  "Alarm sistemi test edildi",
  "HMI ekran kontrolü yapıldı",
  "PLC hata kayıtları incelendi",
  "Sistem genel performans testi tamamlandı",
];

function esc(str: unknown): string {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function infoRow(label: string, value: unknown): string {
  if (!value) return "";
  return `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`;
}

export interface ServiceReportPdfData {
  reportNo: string;
  serviceDate: string;
  serviceTime?: string | null;
  serviceType: string;
  priority?: string | null;
  status: string;
  serviceCode?: string | null;
  createdBy?: string | null;
  device: {
    productName: string;
    model: string;
    serialNumber: string;
    customerFirm: string;
    installDate?: string | null;
    warrantyEndDate?: string | null;
    lastMaintenanceDate?: string | null;
    nextMaintenanceDate?: string | null;
  };
  reportDataJson?: Record<string, unknown>;
  photos?: Array<{ url: string; caption?: string | null }>;
  signatures?: Array<{ role: string; signerName?: string | null; imageDataUrl: string }>;
  parts?: Array<{ partName: string; partCode?: string | null; quantity: string; condition?: string | null }>;
}

export function buildReportHtml(data: ServiceReportPdfData): string {
  const rd = (data.reportDataJson ?? {}) as Record<string, unknown>;
  const alarms = ((rd["alarms"] ?? {}) as Record<string, string>);
  const operations = ((rd["operations"] ?? []) as string[]);
  const customOperations = ((rd["customOperations"] ?? []) as string[]);
  const allOperations = [...DEFAULT_OPERATIONS, ...customOperations];
  const photos = data.photos ?? [];
  const signatures = data.signatures ?? [];
  const parts = data.parts ?? [];

  const priorityColors: Record<string, string> = {
    acil: "#ff3b30",
    yuksek: "#ff9500",
    normal: "#34c759",
    dusuk: "#8e8e93",
  };
  const priorityColor = data.priority ? (priorityColors[data.priority] ?? "#8e8e93") : "#8e8e93";

  const alarmRowsHtml = Object.entries(ALARM_LABELS).map(([key, label]) => {
    const status = alarms[key] ?? "yok";
    const statusLabel = ALARM_STATUS_LABELS[status] ?? status;
    const bgColors: Record<string, string> = {
      yok: "#f1f5f9",
      var: "#fee2e2",
      kontrol_edildi: "#fef3c7",
      mudahale_edildi: "#d1fae5",
    };
    const textColors: Record<string, string> = {
      yok: "#64748b",
      var: "#dc2626",
      kontrol_edildi: "#d97706",
      mudahale_edildi: "#059669",
    };
    return `<tr><td>${esc(label)}</td><td><span style="font-size:7pt;font-weight:700;padding:1px 6px;border-radius:3px;background:${bgColors[status] ?? "#f1f5f9"};color:${textColors[status] ?? "#64748b"}">${esc(statusLabel)}</span></td></tr>`;
  }).join("");

  const operationsHtml = allOperations.map((op) => {
    const checked = operations.includes(op);
    return `<li style="display:flex;align-items:center;gap:5px;font-size:7.5pt;padding:1.5px 0;border-bottom:1px solid #f1f5f9;color:${checked ? "#071b38" : "#94a3b8"};font-weight:${checked ? 600 : 400}">
      <span style="width:13px;text-align:center;font-weight:900;color:${checked ? "#059669" : "#94a3b8"}">${checked ? "✓" : "○"}</span>${esc(op)}
    </li>`;
  }).join("");

  const partsRowsHtml = parts.map((p) =>
    `<tr><td>${esc(p.partName)}</td><td>${esc(p.partCode ?? "—")}</td><td>${esc(p.quantity)}</td><td>${esc(p.condition ?? "—")}</td></tr>`
  ).join("");

  const photosHtml = photos.slice(0, 4).map((ph) =>
    `<div style="break-inside:avoid">
      <img src="${esc(ph.url)}" alt="${esc(ph.caption ?? "")}" style="width:100%;height:38mm;object-fit:cover;border-radius:3px;border:1px solid #e2e8f0" />
      ${ph.caption ? `<p style="font-size:7pt;color:#64748b;text-align:center;margin:2px 0 0">${esc(ph.caption)}</p>` : ""}
    </div>`
  ).join("");

  const sigBoxes = (["personel", "sorumlu", "yetkili"] as const).map((role) => {
    const sig = signatures.find((s) => s.role === role);
    return `<div style="display:flex;flex-direction:column;align-items:center;border:1px solid #e2e8f0;border-radius:4px;padding:3mm">
      <div style="width:100%;height:22mm;display:flex;align-items:center;justify-content:center">
        ${sig ? `<img src="${esc(sig.imageDataUrl)}" style="max-width:100%;max-height:22mm;object-fit:contain" />` : `<div style="width:100%;height:100%;border-bottom:1.5px solid #94a3b8"></div>`}
      </div>
      <p style="font-size:8pt;font-weight:700;color:#071b38;margin:4px 0 1px;text-align:center">${esc(sig?.signerName ?? "—")}</p>
      <p style="font-size:7pt;color:#64748b;margin:0;text-align:center">${esc(SIGNATURE_ROLE_LABELS[role])}</p>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 9pt; color: #071b38; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  table { width: 100%; border-collapse: collapse; }
  th, td { font-size: 8pt; padding: 2px 6px; border-bottom: 1px solid #e8edf4; vertical-align: top; text-align: left; }
  th { font-weight: 700; color: #425169; width: 38%; }
</style>
</head>
<body>
<div style="width:297mm;min-height:210mm;background:#fff">

  <!-- HEADER -->
  <div style="display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#061b39,#082f5e);color:#fff;padding:8mm 10mm;gap:8mm">
    <div style="display:flex;align-items:center;gap:10px">
      <div>
        <p style="font-size:11pt;font-weight:900;letter-spacing:0.03em">OXYMED MEDİKAL GAZ SİSTEMLERİ</p>
        <p style="font-size:8pt;opacity:0.75;margin-top:2px">Teknik Servis Birimi</p>
      </div>
    </div>
    <div style="text-align:right">
      <p style="font-size:11pt;font-weight:900;letter-spacing:0.04em">${esc(data.reportNo)}</p>
      <p style="font-size:8pt;font-weight:700;margin-top:2px">${esc(data.serviceDate)}${data.serviceTime ? ` · ${esc(data.serviceTime)}` : ""}</p>
      <p style="font-size:8pt;margin-top:2px">${esc(SERVICE_TYPE_LABELS[data.serviceType] ?? data.serviceType)}</p>
      ${data.priority ? `<span style="font-size:7.5pt;font-weight:800;padding:1px 7px;border-radius:999px;background:${priorityColor};color:#fff">${esc(PRIORITY_LABELS[data.priority] ?? data.priority)}</span>` : ""}
    </div>
  </div>

  <!-- BODY -->
  <div style="padding:6mm 10mm 4mm;display:flex;flex-direction:column;gap:5mm">

    <!-- ROW 1: Hospital + Device -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6mm">
      <div>
        <h3 style="font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:0.07em;color:#061b39;border-bottom:2px solid #061b39;padding-bottom:3px;margin-bottom:4px">Hastane / Proje Bilgileri</h3>
        <table><tbody>
          ${infoRow("Hastane Adı", (rd["hospitalName"] as string) || data.device.customerFirm)}
          ${infoRow("Bölüm", rd["department"])}
          ${infoRow("Lokasyon", rd["location"])}
          ${infoRow("Sorumlu Kişi", rd["contactPerson"])}
          ${infoRow("İletişim", rd["contact"])}
          ${infoRow("E-posta", rd["email"])}
        </tbody></table>
      </div>
      <div>
        <h3 style="font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:0.07em;color:#061b39;border-bottom:2px solid #061b39;padding-bottom:3px;margin-bottom:4px">Cihaz Bilgileri</h3>
        <table><tbody>
          ${infoRow("Cihaz Türü", (rd["deviceType"] as string) || data.device.productName)}
          ${infoRow("Model", (rd["deviceModel"] as string) || data.device.model)}
          ${infoRow("Seri Numarası", data.device.serialNumber)}
          ${infoRow("PLC Sistemi", rd["plcSystem"])}
          ${infoRow("HMI Modeli", rd["hmiModel"])}
          ${infoRow("Üretim Tarihi", rd["productionDate"])}
          ${infoRow("Devreye Alma", (rd["commissionDate"] as string) || data.device.installDate)}
          ${infoRow("Garanti", (rd["warrantyStatus"] as string) || (data.device.warrantyEndDate ? `Bitiş: ${data.device.warrantyEndDate}` : "—"))}
        </tbody></table>
      </div>
    </div>

    <!-- ROW 2: Alarms + Hours -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6mm">
      <div>
        <h3 style="font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:0.07em;color:#061b39;border-bottom:2px solid #061b39;padding-bottom:3px;margin-bottom:4px">Alarm &amp; Arıza Bilgileri</h3>
        <table>
          <thead><tr style="background:#f5f7fa"><th style="font-size:7pt;font-weight:800;text-transform:uppercase">Alarm</th><th style="font-size:7pt;font-weight:800;text-transform:uppercase">Durum</th></tr></thead>
          <tbody>${alarmRowsHtml}</tbody>
        </table>
      </div>
      <div>
        <h3 style="font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:0.07em;color:#061b39;border-bottom:2px solid #061b39;padding-bottom:3px;margin-bottom:4px">Çalışma Saatleri</h3>
        <table><tbody>
          ${infoRow("Pompa 1", rd["pump1Hours"])}
          ${infoRow("Pompa 2", rd["pump2Hours"])}
          ${infoRow("Pompa 3", rd["pump3Hours"])}
          ${infoRow("Toplam", rd["totalWorkHours"])}
          ${infoRow("Son Bakım", (rd["lastMaintenanceDate"] as string) || data.device.lastMaintenanceDate)}
          ${infoRow("Sonraki Bakım", (rd["nextMaintenanceDate"] as string) || data.device.nextMaintenanceDate)}
          ${infoRow("Bakım Periyodu", rd["maintenancePeriod"])}
        </tbody></table>
        ${(rd["workingPressure"] || rd["minVacuum"] || rd["testResult"]) ? `
        <h4 style="font-size:7.5pt;font-weight:800;color:#344563;margin:6px 0 3px;text-transform:uppercase">Vakum Performans Testi</h4>
        <table><tbody>
          ${infoRow("Çalışma Basıncı", rd["workingPressure"])}
          ${infoRow("Min Vakum", rd["minVacuum"])}
          ${infoRow("Test Süresi", rd["testDuration"])}
          ${infoRow("Test Sonucu", rd["testResult"])}
          ${infoRow("Açıklama", rd["testDescription"])}
        </tbody></table>` : ""}
      </div>
    </div>

    <!-- ROW 3: Operations + Parts -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6mm">
      <div>
        <h3 style="font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:0.07em;color:#061b39;border-bottom:2px solid #061b39;padding-bottom:3px;margin-bottom:4px">Yapılan İşlemler</h3>
        <ul style="list-style:none;padding:0;margin:0">${operationsHtml}</ul>
      </div>
      <div>
        <h3 style="font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:0.07em;color:#061b39;border-bottom:2px solid #061b39;padding-bottom:3px;margin-bottom:4px">Değiştirilen Parçalar</h3>
        ${parts.length === 0 ? `<p style="font-size:7.5pt;color:#94a3b8;font-style:italic;margin:4px 0 0">Parça değişimi yapılmadı.</p>` : `
        <table>
          <thead><tr style="background:#f5f7fa"><th style="font-size:7pt;font-weight:800;text-transform:uppercase">Parça Adı</th><th style="font-size:7pt;font-weight:800;text-transform:uppercase">Kod</th><th style="font-size:7pt;font-weight:800;text-transform:uppercase">Adet</th><th style="font-size:7pt;font-weight:800;text-transform:uppercase">Durum</th></tr></thead>
          <tbody>${partsRowsHtml}</tbody>
        </table>`}
        ${rd["notes"] ? `<h4 style="font-size:7.5pt;font-weight:800;color:#344563;margin:6px 0 3px;text-transform:uppercase">Notlar</h4><p style="font-size:8pt;color:#344563;padding:4px;background:#f8fafc;border-left:2px solid #cbd5e1;line-height:1.4">${esc(rd["notes"])}</p>` : ""}
        ${(rd["recommendedMaintenanceDate"] || rd["recommendedMaintenanceType"]) ? `
        <h4 style="font-size:7.5pt;font-weight:800;color:#344563;margin:6px 0 3px;text-transform:uppercase">Sonraki Bakım Planlaması</h4>
        <table><tbody>
          ${infoRow("Önerilen Tarih", rd["recommendedMaintenanceDate"])}
          ${infoRow("Bakım Türü", rd["recommendedMaintenanceType"])}
          ${infoRow("Tahmini Süre", rd["estimatedDuration"])}
          ${infoRow("Not", rd["maintenanceNote"])}
        </tbody></table>` : ""}
      </div>
    </div>

    <!-- Photos -->
    ${photos.length > 0 ? `
    <div>
      <h3 style="font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:0.07em;color:#061b39;border-bottom:2px solid #061b39;padding-bottom:3px;margin-bottom:4px">Servis Fotoğrafları</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin-top:4px">${photosHtml}</div>
    </div>` : ""}

    <!-- Signatures -->
    <div style="break-inside:avoid">
      <h3 style="font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:0.07em;color:#061b39;border-bottom:2px solid #061b39;padding-bottom:3px;margin-bottom:4px">İmza &amp; Onay</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6mm;margin-top:4px">${sigBoxes}</div>
    </div>

  </div>

  <!-- FOOTER -->
  <div style="display:flex;justify-content:space-between;align-items:center;background:#f1f5f9;padding:3mm 10mm;margin-top:2mm;border-top:1px solid #e2e8f0">
    <p style="font-size:6.5pt;color:#64748b">Bu rapor Oxymed Medikal Gaz Sistemleri tarafından düzenlenmiştir. · www.oxymed.com.tr</p>
    <p style="font-size:6.5pt;color:#64748b">Doğrulama Kodu: ${esc(data.reportNo)}</p>
  </div>

</div>
</body>
</html>`;
}
