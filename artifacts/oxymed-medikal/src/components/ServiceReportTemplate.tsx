import "./ServiceReportTemplate.css";

export interface ServiceReportTemplateData {
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

const SIGNATURE_ROLE_LABELS: Record<string, string> = {
  personel: "Servis Personeli",
  sorumlu: "Teknik Sorumlu",
  yetkili: "Hastane Yetkilisi",
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

export default function ServiceReportTemplate({ data }: { data: ServiceReportTemplateData }) {
  const rd = (data.reportDataJson ?? {}) as Record<string, unknown>;
  const alarms = (rd["alarms"] ?? {}) as Record<string, string>;
  const operations = (rd["operations"] ?? []) as string[];
  const customOperations = (rd["customOperations"] ?? []) as string[];
  const allOperations = [...DEFAULT_OPERATIONS, ...customOperations];

  return (
    <div className="srt-page">
      {/* ── HEADER ── */}
      <header className="srt-header">
        <div className="srt-header__logo-block">
          <img src="/assets/oxymedlogobeyaz.webp" alt="Oxymed Medikal" className="srt-logo" />
          <div>
            <p className="srt-company-name">OXYMED MEDİKAL GAZ SİSTEMLERİ</p>
            <p className="srt-company-sub">Teknik Servis Birimi</p>
          </div>
        </div>
        <div className="srt-header__meta">
          <div className="srt-meta-row">
            <span className="srt-meta-label">Rapor No</span>
            <span className="srt-meta-value srt-report-no">{data.reportNo}</span>
          </div>
          <div className="srt-meta-row">
            <span className="srt-meta-label">Tarih</span>
            <span className="srt-meta-value">{data.serviceDate}{data.serviceTime ? ` · ${data.serviceTime}` : ""}</span>
          </div>
          <div className="srt-meta-row">
            <span className="srt-meta-label">Servis Türü</span>
            <span className="srt-meta-value">{SERVICE_TYPE_LABELS[data.serviceType] ?? data.serviceType}</span>
          </div>
          {data.priority && (
            <div className="srt-meta-row">
              <span className="srt-meta-label">Öncelik</span>
              <span className={`srt-priority srt-priority--${data.priority}`}>{PRIORITY_LABELS[data.priority] ?? data.priority}</span>
            </div>
          )}
          {data.serviceCode && (
            <div className="srt-meta-row">
              <span className="srt-meta-label">Servis Kodu</span>
              <span className="srt-meta-value">{data.serviceCode}</span>
            </div>
          )}
        </div>
      </header>

      <div className="srt-body">
        {/* ── ROW 1: Hospital + Device ── */}
        <div className="srt-row">
          <section className="srt-section srt-section--half">
            <h3 className="srt-section-title">Hastane / Proje Bilgileri</h3>
            <table className="srt-info-table">
              <tbody>
                {[
                  ["Hastane Adı", (rd["hospitalName"] as string) ?? data.device.customerFirm],
                  ["Bölüm", rd["department"] as string],
                  ["Lokasyon", rd["location"] as string],
                  ["Sorumlu Kişi", rd["contactPerson"] as string],
                  ["İletişim", rd["contact"] as string],
                  ["E-posta", rd["email"] as string],
                ].map(([label, value]) => value ? (
                  <tr key={label}>
                    <th>{label}</th>
                    <td>{value}</td>
                  </tr>
                ) : null)}
              </tbody>
            </table>
          </section>

          <section className="srt-section srt-section--half">
            <h3 className="srt-section-title">Cihaz Bilgileri</h3>
            <table className="srt-info-table">
              <tbody>
                {[
                  ["Cihaz Türü", (rd["deviceType"] as string) ?? data.device.productName],
                  ["Model", (rd["deviceModel"] as string) ?? data.device.model],
                  ["Seri Numarası", data.device.serialNumber],
                  ["PLC Sistemi", rd["plcSystem"] as string],
                  ["HMI Modeli", rd["hmiModel"] as string],
                  ["Üretim Tarihi", rd["productionDate"] as string],
                  ["Devreye Alma", rd["commissionDate"] as string ?? data.device.installDate],
                  ["Garanti Durumu", rd["warrantyStatus"] as string ?? (data.device.warrantyEndDate ? `Bitiş: ${data.device.warrantyEndDate}` : "—")],
                ].map(([label, value]) => value ? (
                  <tr key={label}>
                    <th>{label}</th>
                    <td>{value}</td>
                  </tr>
                ) : null)}
              </tbody>
            </table>
          </section>
        </div>

        {/* ── ROW 2: Alarms + Work Hours ── */}
        <div className="srt-row">
          <section className="srt-section srt-section--half">
            <h3 className="srt-section-title">Alarm &amp; Arıza Bilgileri</h3>
            <table className="srt-alarm-table">
              <thead>
                <tr>
                  <th>Alarm / Arıza</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ALARM_LABELS).map(([key, label]) => (
                  <tr key={key}>
                    <td>{label}</td>
                    <td>
                      <span className={`srt-alarm-status srt-alarm-status--${alarms[key] ?? "yok"}`}>
                        {ALARM_STATUS_LABELS[alarms[key] ?? "yok"] ?? alarms[key] ?? "Yok"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="srt-section srt-section--half">
            <h3 className="srt-section-title">Çalışma Saatleri &amp; Vakum Testi</h3>
            <table className="srt-info-table">
              <tbody>
                {[
                  ["Pompa 1 Çalışma", rd["pump1Hours"] as string],
                  ["Pompa 2 Çalışma", rd["pump2Hours"] as string],
                  ["Pompa 3 Çalışma", rd["pump3Hours"] as string],
                  ["Toplam Çalışma", rd["totalWorkHours"] as string],
                  ["Son Bakım", rd["lastMaintenanceDate"] as string ?? data.device.lastMaintenanceDate],
                  ["Sonraki Bakım", rd["nextMaintenanceDate"] as string ?? data.device.nextMaintenanceDate],
                  ["Bakım Periyodu", rd["maintenancePeriod"] as string],
                ].map(([label, value]) => value ? (
                  <tr key={label}>
                    <th>{label}</th>
                    <td>{value}</td>
                  </tr>
                ) : null)}
              </tbody>
            </table>
            {(rd["workingPressure"] || rd["minVacuum"] || rd["testResult"]) ? (
              <>
                <h4 className="srt-subsection-title">Vakum Performans Testi</h4>
                <table className="srt-info-table">
                  <tbody>
                    {[
                      ["Çalışma Basıncı", rd["workingPressure"] as string],
                      ["Min Vakum", rd["minVacuum"] as string],
                      ["Test Süresi", rd["testDuration"] as string],
                      ["Test Sonucu", rd["testResult"] as string],
                      ["Açıklama", rd["testDescription"] as string],
                    ].map(([label, value]) => value ? (
                      <tr key={label}><th>{label}</th><td>{value}</td></tr>
                    ) : null)}
                  </tbody>
                </table>
              </>
            ) : null}
          </section>
        </div>

        {/* ── ROW 3: Operations + Parts ── */}
        <div className="srt-row">
          <section className="srt-section srt-section--half">
            <h3 className="srt-section-title">Yapılan İşlemler</h3>
            <ul className="srt-checklist">
              {allOperations.map((op) => (
                <li key={op} className={operations.includes(op) ? "srt-checklist__item--checked" : "srt-checklist__item--unchecked"}>
                  <span className="srt-checkbox">{operations.includes(op) ? "✓" : "○"}</span>
                  {op}
                </li>
              ))}
            </ul>
          </section>

          <section className="srt-section srt-section--half">
            <h3 className="srt-section-title">Değiştirilen Parçalar</h3>
            {(data.parts ?? []).length === 0 ? (
              <p className="srt-empty-note">Parça değişimi yapılmadı.</p>
            ) : (
              <table className="srt-parts-table">
                <thead>
                  <tr>
                    <th>Parça Adı</th>
                    <th>Kod / Model</th>
                    <th>Adet</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.parts ?? []).map((p, i) => (
                    <tr key={i}>
                      <td>{p.partName}</td>
                      <td>{p.partCode ?? "—"}</td>
                      <td>{p.quantity}</td>
                      <td>{p.condition ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {rd["notes"] ? (
              <>
                <h4 className="srt-subsection-title">Açıklama / Notlar</h4>
                <p className="srt-notes-text">{String(rd["notes"])}</p>
              </>
            ) : null}

            {(rd["recommendedMaintenanceDate"] || rd["recommendedMaintenanceType"]) ? (
              <>
                <h4 className="srt-subsection-title">Sonraki Bakım Planlaması</h4>
                <table className="srt-info-table">
                  <tbody>
                    {[
                      ["Önerilen Tarih", rd["recommendedMaintenanceDate"] as string],
                      ["Bakım Türü", rd["recommendedMaintenanceType"] as string],
                      ["Tahmini Süre", rd["estimatedDuration"] as string],
                      ["Not", rd["maintenanceNote"] as string],
                    ].map(([label, value]) => value ? (
                      <tr key={label}><th>{label}</th><td>{value}</td></tr>
                    ) : null)}
                  </tbody>
                </table>
              </>
            ) : null}
          </section>
        </div>

        {/* ── Photos ── */}
        {(data.photos ?? []).length > 0 && (
          <section className="srt-section">
            <h3 className="srt-section-title">Servis Fotoğrafları</h3>
            <div className="srt-photos">
              {(data.photos ?? []).slice(0, 4).map((photo, i) => (
                <div key={i} className="srt-photo">
                  <img src={photo.url} alt={photo.caption ?? `Fotoğraf ${i + 1}`} />
                  {photo.caption && <p className="srt-photo__caption">{photo.caption}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Signatures ── */}
        <section className="srt-section srt-signatures">
          <h3 className="srt-section-title">İmza &amp; Onay</h3>
          <div className="srt-sig-row">
            {(["personel", "sorumlu", "yetkili"] as const).map((role) => {
              const sig = (data.signatures ?? []).find((s) => s.role === role);
              return (
                <div key={role} className="srt-sig-box">
                  <div className="srt-sig-image">
                    {sig ? (
                      <img src={sig.imageDataUrl} alt={`${SIGNATURE_ROLE_LABELS[role]} imzası`} />
                    ) : (
                      <div className="srt-sig-placeholder" />
                    )}
                  </div>
                  <p className="srt-sig-name">{sig?.signerName ?? "—"}</p>
                  <p className="srt-sig-role">{SIGNATURE_ROLE_LABELS[role]}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── FOOTER ── */}
      <footer className="srt-footer">
        <p>Bu rapor Oxymed Medikal Gaz Sistemleri tarafından düzenlenmiştir. · www.oxymed.com.tr</p>
        <p>Doğrulama Kodu: {data.reportNo}</p>
      </footer>
    </div>
  );
}
