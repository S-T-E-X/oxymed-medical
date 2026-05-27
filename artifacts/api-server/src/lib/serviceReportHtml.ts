// Server-side HTML template for service report PDF generation
// Layout mirrors the A4 ServiceReportPage taslak design

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

const ALARM_KEYS = [
  { key: "dusuk_vakum",        label: "Düşük Vakum Alarmı" },
  { key: "yuksek_sicaklik",    label: "Yüksek Sıcaklık Alarmı" },
  { key: "termik_hata",        label: "Termik Hatası" },
  { key: "sensor_hata",        label: "Sensör Hatası" },
  { key: "bakim_suresi_doldu", label: "Bakım Süresi Doldu" },
  { key: "acil_ariza",         label: "Acil Arıza" },
];

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

const TURKISH_MONTHS = [
  "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",
];

function esc(str: unknown): string {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseDateStr(dateStr: string): { day: number; month: number; year: number } | null {
  if (!dateStr) return null;
  if (dateStr.includes(".")) {
    const parts = dateStr.split(".");
    const day = parseInt(parts[0] ?? "", 10);
    const month = parseInt(parts[1] ?? "", 10) - 1;
    const year = parseInt(parts[2] ?? "", 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) return { day, month, year };
  } else if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    const year = parseInt(parts[0] ?? "", 10);
    const month = parseInt(parts[1] ?? "", 10) - 1;
    const day = parseInt(parts[2] ?? "", 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) return { day, month, year };
  }
  return null;
}

function buildCalendarHtml(dateStr: string): string {
  const parsed = parseDateStr(dateStr);
  if (!parsed) return "";
  const { day, month, year } = parsed;

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = `${TURKISH_MONTHS[month] ?? ""} ${year}`;

  const headerCells = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"]
    .map((h) => `<span style="font-weight:900;color:#08265f;font-size:1.45mm">${h}</span>`)
    .join("");
  const blankCells = Array.from({ length: startOffset })
    .map(() => `<span></span>`)
    .join("");
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const n = i + 1;
    const isActive = n === day;
    return `<span style="${isActive ? "display:inline-grid;place-items:center;width:3.05mm;height:3.05mm;margin:0 auto;background:#08265f;color:#fff;border-radius:50%;font-weight:900;" : ""}">${n}</span>`;
  }).join("");

  return `
    <div style="border:0.2mm solid #d1d9e4;border-radius:1.5mm;background:#fff;padding:0.8mm;text-align:center">
      <strong style="display:block;font-size:1.9mm;font-weight:900;color:#08265f;text-align:center;margin-bottom:0.55mm;text-transform:uppercase">${esc(monthLabel)}</strong>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:0.2mm;font-size:1.62mm;text-align:center;line-height:1.9">
        ${headerCells}${blankCells}${dayCells}
      </div>
    </div>`;
}

function panelTitle(label: string): string {
  return `<div style="background:linear-gradient(90deg,#061f53,#082e6d);color:#fff;font-size:7pt;font-weight:800;text-transform:uppercase;letter-spacing:0.03em;padding:2mm 3mm;border-radius:1.5mm 1.5mm 0 0">${esc(label)}</div>`;
}

function panel(title: string, content: string): string {
  return `<div style="border:0.25mm solid #9eabba;border-radius:1.5mm;overflow:hidden;background:#fff">
    ${panelTitle(title)}
    <div style="padding:2mm 3mm">${content}</div>
  </div>`;
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
    imageUrl?: string | null;
  };
  reportDataJson?: Record<string, unknown>;
  photos?: Array<{ url: string; caption?: string | null }>;
  signatures?: Array<{ role: string; signerName?: string | null; imageDataUrl: string }>;
  parts?: Array<{ partName: string; partCode?: string | null; quantity: string; condition?: string | null }>;
}

export function buildReportHtml(data: ServiceReportPdfData, options?: { baseHref?: string }): string {
  const rd = (data.reportDataJson ?? {}) as Record<string, unknown>;
  const alarms = ((rd["alarms"] ?? {}) as Record<string, string>);
  const operations = ((rd["operations"] ?? []) as string[]);
  const customOperations = ((rd["customOperations"] ?? []) as string[]);
  const allOperations = [...DEFAULT_OPERATIONS, ...customOperations];
  const photos = data.photos ?? [];
  const signatures = data.signatures ?? [];
  const parts = data.parts ?? [];

  const str = (k: string): string => ((rd[k] as string | undefined) ?? "");

  const hospitalName   = str("hospitalName") || data.device.customerFirm;
  const department     = str("department");
  const location       = str("location");
  const contactPerson  = str("contactPerson");
  const contact        = str("contact");
  const email          = str("email");

  const deviceType     = str("deviceType") || data.device.productName;
  const deviceModel    = str("deviceModel") || data.device.model;
  const plcSystem      = str("plcSystem");
  const hmiModel       = str("hmiModel");
  const productionDate = str("productionDate");
  const commissionDate = str("commissionDate") || (data.device.installDate ?? "");
  const warrantyStatus = str("warrantyStatus") || (data.device.warrantyEndDate ? `Bitiş: ${data.device.warrantyEndDate}` : "");

  const pump1Hours        = str("pump1Hours");
  const pump2Hours        = str("pump2Hours");
  const pump3Hours        = str("pump3Hours");
  const totalWorkHours    = str("totalWorkHours");
  const lastMaintDate     = str("lastMaintenanceDate") || (data.device.lastMaintenanceDate ?? "");
  const nextMaintDate     = str("nextMaintenanceDate") || (data.device.nextMaintenanceDate ?? "");
  const maintenancePeriod = str("maintenancePeriod");

  const workingPressure = str("workingPressure") || str("vacuumTestPressure");
  const minVacuum       = str("minVacuum") || str("vacuumMinPressure");
  const testDuration    = str("testDuration") || str("vacuumTestDuration");
  const testResult      = str("testResult") || str("vacuumTestResult");

  const notes                = str("notes");
  const recommendedMaintDate = str("recommendedMaintenanceDate");
  const recommendedMaintType = str("recommendedMaintenanceType") || str("nextMaintenanceType");
  const estimatedDuration    = str("estimatedDuration") || str("nextMaintenanceDuration");
  const maintenanceNote      = str("maintenanceNote") || str("nextMaintenanceNote");

  // ── Hospital info rows ───────────────────────────────────────────────────
  const hospitalRows: [string, string][] = ([
    ["Hastane Adı",  hospitalName],
    ["Bölüm",        department],
    ["Lokasyon",     location],
    ["Sorumlu Kişi", contactPerson],
    ["İletişim",     contact],
    ["E-posta",      email],
  ] as [string, string][]).filter(([, v]) => v);

  const hospitalHtml = hospitalRows.map(([l, v]) =>
    `<div style="display:grid;grid-template-columns:22mm 2mm 1fr;min-height:5.5mm;border-bottom:0.2mm solid #e2e8f0;font-size:2.6mm;align-items:center">
      <strong style="font-weight:800">${esc(l)}</strong><span>:</span><p style="margin:0">${esc(v)}</p>
    </div>`
  ).join("");

  // ── Device info rows ─────────────────────────────────────────────────────
  const deviceRows: [string, string][] = ([
    ["Cihaz Türü",          deviceType],
    ["Model",               deviceModel],
    ["Seri Numarası",       data.device.serialNumber],
    ["PLC Sistemi",         plcSystem],
    ["HMI Modeli",          hmiModel],
    ["Üretim Tarihi",       productionDate],
    ["Devreye Alma",        commissionDate],
    ["Garanti Durumu",      warrantyStatus],
  ] as [string, string][]).filter(([, v]) => v);

  const deviceRowsHtml = deviceRows.map(([l, v]) =>
    `<div style="display:grid;grid-template-columns:25.5mm 2mm minmax(0,1fr);min-height:4.25mm;border-bottom:0.2mm solid #e2e8f0;font-size:2.18mm;align-items:center">
      <strong style="font-weight:800">${esc(l)}</strong><span style="color:#64748b;font-weight:800;text-align:center">:</span><p style="margin:0;line-height:1.13;overflow-wrap:anywhere">${esc(v)}</p>
    </div>`
  ).join("");

  const deviceImageUrl = data.device.imageUrl && /^(https?:|data:)/i.test(data.device.imageUrl)
    ? data.device.imageUrl
    : "";
  const deviceHtml = deviceImageUrl
    ? `<div style="display:grid;grid-template-columns:minmax(0,1fr) 38%;gap:2mm;align-items:center">
        <div>${deviceRowsHtml}</div>
        <img src="${esc(deviceImageUrl)}" alt="${esc(deviceType)}" style="width:100%;height:34.5mm;object-fit:contain"/>
      </div>`
    : deviceRowsHtml;

  // ── Alarms table ──────────────────────────────────────────────────────────
  const alarmRowsHtml = ALARM_KEYS.map(({ key, label }) => {
    const status = alarms[key] ?? "yok";
    const statusLabel = ALARM_STATUS_LABELS[status] ?? status;
    const isDanger = status === "var";
    const color = isDanger ? "#c81922" : "#0a8f3d";
    const dot = isDanger
      ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:2.8mm;height:2.8mm;border-radius:50%;background:#d71920;color:#fff;font-size:2.3mm;font-weight:900;margin-right:1mm">!</span>`
      : `<span style="display:inline-flex;align-items:center;justify-content:center;width:2.8mm;height:2.8mm;border-radius:50%;background:#18a354;color:#fff;font-size:2.2mm;font-weight:900;margin-right:1mm">✓</span>`;
    return `<tr>
      <td style="font-size:2.5mm;border:0.2mm solid #d0d8e3;padding:1.3mm 2mm">${esc(label)}</td>
      <td style="font-size:2.5mm;border:0.2mm solid #d0d8e3;padding:1.3mm 2mm;font-weight:800;color:${color}">${dot}${esc(statusLabel)}</td>
    </tr>`;
  }).join("");

  // ── Work hours rows ───────────────────────────────────────────────────────
  const hoursRows: string[] = [];
  const td = (a: string, b: string) =>
    `<tr><td style="font-size:2.4mm;border:0.2mm solid #d0d8e3;padding:1mm 1.8mm">${esc(a)}</td><td style="font-size:2.4mm;border:0.2mm solid #d0d8e3;padding:1mm 1.8mm">${esc(b)}</td></tr>`;
  if (pump1Hours) hoursRows.push(td("Pompa 1", pump1Hours));
  if (pump2Hours) hoursRows.push(td("Pompa 2", pump2Hours));
  if (pump3Hours) hoursRows.push(td("Pompa 3", pump3Hours));
  if (totalWorkHours) hoursRows.push(`<tr style="font-weight:900"><td style="font-size:2.4mm;border:0.2mm solid #d0d8e3;padding:1mm 1.8mm">Toplam Çalışma</td><td style="font-size:2.4mm;border:0.2mm solid #d0d8e3;padding:1mm 1.8mm">${esc(totalWorkHours)}</td></tr>`);
  if (lastMaintDate) hoursRows.push(td("Son Bakım", lastMaintDate));
  if (nextMaintDate) hoursRows.push(td("Sonraki Bakım", nextMaintDate));
  if (maintenancePeriod) hoursRows.push(td("Bakım Periyodu", maintenancePeriod));

  // ── Vacuum test ───────────────────────────────────────────────────────────
  const vacuumRows: string[] = [];
  if (testResult) {
    const c = testResult === "Başarılı" ? "#0a8f3d" : testResult === "Başarısız" ? "#c81922" : "#344563";
    vacuumRows.push(`<tr><td style="font-size:2.4mm;border:0.2mm solid #d0d8e3;padding:1mm 1.8mm">Test Sonucu</td><td style="font-size:2.4mm;border:0.2mm solid #d0d8e3;padding:1mm 1.8mm;font-weight:800;color:${c}">${esc(testResult)}</td></tr>`);
  }
  if (workingPressure) vacuumRows.push(td("Çalışma Basıncı", workingPressure));
  if (minVacuum) vacuumRows.push(td("Minimum Vakum", minVacuum));
  if (testDuration) vacuumRows.push(td("Test Süresi", testDuration));

  const vacuumHtml = vacuumRows.length > 0
    ? `<table style="width:100%;border-collapse:collapse"><tbody>${vacuumRows.join("")}</tbody></table>`
    : `<p style="font-size:2.3mm;color:#94a3b8;font-style:italic">Vakum testi verisi girilmemiş.</p>`;

  // ── Operations list ───────────────────────────────────────────────────────
  const operationsHtml = allOperations.map((op) => {
    const checked = operations.includes(op);
    const dot = checked
      ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:2.8mm;height:2.8mm;border-radius:50%;background:#18a354;color:#fff;font-size:2.2mm;font-weight:900;flex-shrink:0;margin-right:1.3mm">✓</span>`
      : `<span style="display:inline-flex;align-items:center;justify-content:center;width:2.8mm;height:2.8mm;border-radius:50%;background:#cbd5e1;color:#fff;font-size:2.2mm;flex-shrink:0;margin-right:1.3mm">○</span>`;
    return `<div style="display:flex;align-items:center;font-size:2.3mm;padding:0.9mm 0;border-bottom:0.2mm solid #f1f5f9;color:${checked ? "#071b38" : "#94a3b8"};font-weight:${checked ? 600 : 400}">${dot}${esc(op)}</div>`;
  }).join("");

  // ── Parts table ───────────────────────────────────────────────────────────
  const partsHtml = parts.length === 0
    ? `<p style="font-size:2.3mm;color:#94a3b8;font-style:italic">Parça değişimi yapılmadı.</p>`
    : `<table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f7f9fc">
          <th style="font-size:2.2mm;font-weight:800;text-transform:uppercase;border:0.2mm solid #d0d8e3;padding:1.2mm 1.8mm;text-align:left">Parça Adı</th>
          <th style="font-size:2.2mm;font-weight:800;text-transform:uppercase;border:0.2mm solid #d0d8e3;padding:1.2mm 1.8mm;text-align:left">Kod</th>
          <th style="font-size:2.2mm;font-weight:800;text-transform:uppercase;border:0.2mm solid #d0d8e3;padding:1.2mm 1.8mm;text-align:center">Adet</th>
          <th style="font-size:2.2mm;font-weight:800;text-transform:uppercase;border:0.2mm solid #d0d8e3;padding:1.2mm 1.8mm;text-align:left">Durum</th>
        </tr></thead>
        <tbody>${parts.map((p) =>
          `<tr>
            <td style="font-size:2.4mm;border:0.2mm solid #d0d8e3;padding:1mm 1.8mm">${esc(p.partName)}</td>
            <td style="font-size:2.4mm;border:0.2mm solid #d0d8e3;padding:1mm 1.8mm">${esc(p.partCode ?? "—")}</td>
            <td style="font-size:2.4mm;border:0.2mm solid #d0d8e3;padding:1mm 1.8mm;text-align:center">${esc(p.quantity)}</td>
            <td style="font-size:2.4mm;border:0.2mm solid #d0d8e3;padding:1mm 1.8mm">${esc(p.condition ?? "—")}</td>
          </tr>`
        ).join("")}</tbody>
      </table>`;

  // ── Photos ────────────────────────────────────────────────────────────────
  const photosHtml = photos.length === 0
    ? `<p style="font-size:2.3mm;color:#94a3b8;font-style:italic">Fotoğraf eklenmemiş.</p>`
    : `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:2mm">${photos.slice(0, 4).map((ph) =>
        `<div>
          <img src="${esc(ph.url)}" alt="${esc(ph.caption ?? "")}" style="width:100%;height:18mm;object-fit:cover;border-radius:1mm;border:0.2mm solid #e2e8f0"/>
          ${ph.caption ? `<p style="font-size:2mm;color:#64748b;text-align:center;margin:1mm 0 0">${esc(ph.caption)}</p>` : ""}
        </div>`
      ).join("")}</div>`;

  // ── Signatures ────────────────────────────────────────────────────────────
  const sigBoxes = (["personel", "sorumlu", "yetkili"] as const).map((role) => {
    const sig = signatures.find((s) => s.role === role);
    return `<div style="display:flex;flex-direction:column;align-items:center;border:0.25mm solid #d0d8e3;border-radius:1.5mm;padding:2mm;gap:1mm">
      <div style="width:100%;height:15mm;display:flex;align-items:center;justify-content:center;border-bottom:0.4mm solid #cbd5e1">
        ${sig?.imageDataUrl
          ? `<img src="${esc(sig.imageDataUrl)}" style="max-width:100%;max-height:14mm;object-fit:contain"/>`
          : `<div style="width:90%;height:0.4mm;background:#e2e8f0;margin-top:14mm"></div>`}
      </div>
      <p style="font-size:2.5mm;font-weight:800;color:#071b38;margin:0;text-align:center">${esc(sig?.signerName ?? "—")}</p>
      <p style="font-size:2mm;color:#64748b;margin:0;text-align:center">${esc(SIGNATURE_ROLE_LABELS[role] ?? role)}</p>
    </div>`;
  }).join("");

  // ── Next maintenance ──────────────────────────────────────────────────────
  const calDate = recommendedMaintDate || nextMaintDate;
  const nextMaintRows: string[] = [];
  const maintRow = (label: string, value: string, highlight = false) =>
    `<div style="display:grid;grid-template-columns:22mm minmax(0,1fr);align-items:start;gap:1.1mm;padding:0.75mm 1.1mm;border:0.2mm solid ${highlight ? "#18a354" : "#e2e7ef"};border-radius:1.2mm;background:${highlight ? "#ecfdf3" : "#f8fafc"}">
      <span style="font-size:1.65mm;font-weight:900;color:${highlight ? "#0a7a3e" : "#475569"};text-transform:uppercase;letter-spacing:0.04mm">${esc(label)}</span>
      <strong style="font-size:2.05mm;font-weight:900;color:${highlight ? "#08265f" : "#0f172a"};line-height:1.12;overflow-wrap:anywhere">${esc(value)}</strong>
    </div>`;
  if (calDate) nextMaintRows.push(maintRow("Önerilen Tarih", calDate, true));
  if (recommendedMaintType) nextMaintRows.push(maintRow("Bakım Türü", recommendedMaintType));
  if (estimatedDuration) nextMaintRows.push(maintRow("Tahmini Süre", estimatedDuration));
  if (maintenanceNote) nextMaintRows.push(maintRow("Not", maintenanceNote));

  const nextMaintHtml = nextMaintRows.length > 0
    ? `<div style="display:grid;grid-template-columns:minmax(0,1fr) 36mm;gap:2mm;align-items:start">
        <div style="display:flex;flex-direction:column;gap:1mm">${nextMaintRows.join("")}</div>
        ${calDate ? buildCalendarHtml(calDate) : ""}
      </div>`
    : `<p style="font-size:2.3mm;color:#94a3b8;font-style:italic">Planlama girilmemiş.</p>`;

  // ── Summary bar ───────────────────────────────────────────────────────────
  const priorityColorMap: Record<string, string> = {
    acil: "#ff3b30", yuksek: "#ff9500", normal: "#34c759", dusuk: "#8e8e93",
  };
  const pColor = data.priority ? (priorityColorMap[data.priority] ?? "#8e8e93") : "#8e8e93";

  const summaryData = [
    { label: "Servis Tarihi", value: data.serviceTime ? `${data.serviceDate} ${data.serviceTime}` : data.serviceDate },
    { label: "Servis Türü", value: SERVICE_TYPE_LABELS[data.serviceType] ?? data.serviceType },
    data.priority ? { label: "Müdahale Önceliği", value: PRIORITY_LABELS[data.priority] ?? data.priority, color: pColor } : null,
    { label: "İşlem Durumu", value: data.status === "taslak" ? "Taslak" : data.status === "iptal" ? "İptal" : "Tamamlandı", color: data.status === "tamamlandi" ? "#15a154" : "#0f172a" },
  ].filter(Boolean) as Array<{ label: string; value: string; color?: string }>;

  const SUMMARY_ICONS: Record<string, string> = {
    "Servis Tarihi": `<svg xmlns="http://www.w3.org/2000/svg" style="width:4mm;height:4mm;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="#08265f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="14" r="0.7" fill="#08265f" stroke="none"/><circle cx="12" cy="14" r="0.7" fill="#08265f" stroke="none"/><circle cx="16" cy="14" r="0.7" fill="#08265f" stroke="none"/><circle cx="8" cy="18" r="0.7" fill="#08265f" stroke="none"/><circle cx="12" cy="18" r="0.7" fill="#08265f" stroke="none"/></svg>`,
    "Servis Türü": `<svg xmlns="http://www.w3.org/2000/svg" style="width:4mm;height:4mm;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="#08265f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>`,
    "Müdahale Önceliği": `<svg xmlns="http://www.w3.org/2000/svg" style="width:4mm;height:4mm;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="#08265f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>`,
    "İşlem Durumu": `<svg xmlns="http://www.w3.org/2000/svg" style="width:4mm;height:4mm;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="#08265f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  };

  const summaryItems = summaryData.map((item, i) =>
    `<div style="display:flex;align-items:center;min-width:0;gap:1.35mm;padding:0 1.75mm;border-right:${i === summaryData.length - 1 ? "0" : "0.25mm solid #b7c0cf"};overflow:hidden">
      ${SUMMARY_ICONS[item.label] ?? ""}
      <div style="min-width:0;overflow:hidden">
        <small style="display:block;font-size:1.78mm;font-weight:900;color:#08265f;text-transform:uppercase;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(item.label)}</small>
        <strong style="display:block;margin-top:1.2mm;font-size:2.55mm;font-weight:800;color:${item.color ?? "#0f172a"};line-height:1.05;white-space:normal;overflow-wrap:anywhere">${esc(item.value)}</strong>
      </div>
    </div>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Inter", Arial, Helvetica, sans-serif;
    font-size: 2.72mm;
    color: #0f172a;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    background: #fff;
    margin: 0;
    padding: 0;
  }
  @page { size: A4 portrait; margin: 0; }
</style>
<base href="${options?.baseHref ?? "http://localhost:80/"}">
</head>
<body>
<div style="
  position:relative;
  width:210mm;
  height:297mm;
  padding:3.6mm 4mm 2.4mm;
  border:0.45mm solid #0b2a5f;
  box-sizing:border-box;
  background:
    radial-gradient(circle at 22% 41%, rgba(7,39,96,0.055), transparent 21%),
    radial-gradient(circle at 80% 37%, rgba(7,39,96,0.04), transparent 19%),
    #ffffff;
  overflow:hidden
">

  <!-- HEADER -->
  <div style="display:grid;grid-template-columns:55mm minmax(0,1fr) 39mm;align-items:center;gap:3mm;height:22mm">
    <div style="display:flex;align-items:center;height:22mm">
      <img src="assets/brand/oxymed-service-logo.webp" alt="Oxymed Medikal" style="max-height:20mm;max-width:52mm;width:auto;object-fit:contain" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"/>
      <div style="display:none">
        <p style="font-size:5mm;font-weight:900;color:#08265f;line-height:1">OXYMED MEDİKAL</p>
        <p style="font-size:3.2mm;font-weight:700;color:#5c667a;margin-top:1.5mm">Medikal Gaz Sistemleri</p>
        <p style="font-size:2.6mm;color:#5c667a;margin-top:0.8mm">Teknik Servis Birimi</p>
      </div>
    </div>
    <div style="text-align:center;color:#08265f;transform:translateX(-4mm)">
      <p style="font-size:5.9mm;font-weight:850;line-height:1;white-space:nowrap">SERVİS &amp; BAKIM RAPORU</p>
      <p style="font-size:3.5mm;font-weight:760;color:#5c667a;margin-top:2mm">${esc(deviceType || data.device.productName).toUpperCase()}</p>
    </div>
    <div style="border:0.25mm solid #9aa7bd;border-radius:2mm;text-align:center;overflow:hidden;align-self:stretch">
      <div style="background:#08265f;color:#fff;font-size:3.1mm;font-weight:900;padding:1.8mm 0">RAPOR NO</div>
      <strong style="display:block;font-size:2.5mm;font-weight:900;margin-top:0.9mm">${esc(data.reportNo)}</strong>
      <div style="width:26mm;height:5mm;margin:0.8mm auto 0;background:repeating-linear-gradient(90deg,#111827 0 0.35mm,transparent 0.35mm 0.7mm,#111827 0.7mm 1.25mm,transparent 1.25mm 1.85mm)"></div>
      <span style="display:block;font-size:2.6mm;font-weight:800;margin-top:0.5mm">${esc(data.serviceDate)}${data.serviceTime ? ` · ${esc(data.serviceTime)}` : ""}</span>
    </div>
  </div>

  <!-- SUMMARY BAR -->
  <div style="display:grid;grid-template-columns:repeat(${summaryData.length},minmax(0,1fr));height:13mm;margin-top:2.4mm;border:0.25mm solid #a8b3c5;border-radius:1.5mm;overflow:hidden;background:rgba(255,255,255,0.92)">
    ${summaryItems}
  </div>

  <!-- TOP GRID: Hospital + Device -->
  <div style="display:grid;grid-template-columns:41.2% 1fr;gap:2.3mm;margin-top:2.3mm">
    ${panel("Hastane / Proje Bilgileri", hospitalHtml)}
    ${panel("Cihaz Bilgileri", deviceHtml)}
  </div>

  <!-- THREE GRID: Alarms + Hours + Vacuum -->
  <div style="display:grid;grid-template-columns:31% 35.3% 1fr;gap:2.3mm;margin-top:2.3mm">
    ${panel("Alarm &amp; Arıza Bilgileri",
      `<table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f7f9fc">
          <th style="font-size:2.3mm;font-weight:800;text-transform:uppercase;border:0.2mm solid #d0d8e3;padding:1.3mm 2mm;text-align:left">Alarm / Arıza Türü</th>
          <th style="font-size:2.3mm;font-weight:800;text-transform:uppercase;border:0.2mm solid #d0d8e3;padding:1.3mm 2mm;text-align:left">Durum</th>
        </tr></thead>
        <tbody>${alarmRowsHtml}</tbody>
      </table>`
    )}
    ${panel("Çalışma Saatleri",
      hoursRows.length > 0
        ? `<table style="width:100%;border-collapse:collapse"><tbody>${hoursRows.join("")}</tbody></table>`
        : `<p style="font-size:2.3mm;color:#94a3b8;font-style:italic">Çalışma saati girilmemiş.</p>`
    )}
    ${panel("Vakum Performans Testi", vacuumHtml)}
  </div>

  <!-- MID GRID: Operations + Notes -->
  <div style="display:grid;grid-template-columns:53% 1fr;gap:2.3mm;margin-top:2.3mm">
    ${panel("Yapılan İşlemler",
      `<div style="display:grid;grid-template-columns:1fr 1.1fr;column-gap:4mm">${operationsHtml}</div>`
    )}
    ${panel("Açıklama / Notlar",
      notes
        ? `<div style="font-size:2.6mm;line-height:1.5;color:#344563">${notes.split("\n").map((l) => `<p>${esc(l)}</p>`).join("")}</div>`
        : `<p style="font-size:2.3mm;color:#94a3b8;font-style:italic">Not girilmemiş.</p>`
    )}
  </div>

  <!-- LOWER GRID: Parts + Photos -->
  <div style="display:grid;grid-template-columns:40.5% 1fr;gap:2.3mm;margin-top:2.3mm">
    ${panel("Değiştirilen Parçalar", partsHtml)}
    ${panel("Servis Fotoğrafları", photosHtml)}
  </div>

  <!-- BOTTOM GRID: Signatures + Next Maintenance -->
  <div style="display:grid;grid-template-columns:53% 1fr;gap:2.3mm;margin-top:2.3mm">
    ${panel("İmza &amp; Onay",
      `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2mm">${sigBoxes}</div>`
    )}
    ${panel("Sonraki Bakım Planlaması", nextMaintHtml)}
  </div>

  <!-- FOOTER -->
  <div style="margin-top:2.5mm;border-top:0.2mm solid #e2e8f0;padding-top:1.5mm">
    <img src="assets/brand/oxymed-service-footer.webp" alt="" style="width:100%;height:auto;display:block"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
    <div style="display:none;justify-content:space-between;align-items:center">
      <p style="font-size:2mm;color:#64748b">Bu rapor Oxymed Medikal Gaz Sistemleri tarafından düzenlenmiştir. · www.oxymed.com.tr</p>
      <p style="font-size:2mm;color:#64748b">Doğrulama Kodu: ${esc(data.reportNo)}</p>
    </div>
  </div>

</div>
</body>
</html>`;
}
