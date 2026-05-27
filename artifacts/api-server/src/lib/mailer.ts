import nodemailer from "nodemailer";

export interface SendQuoteFormEmailOptions {
  to: string;
  quoteNo: string;
  firmaAdi: string | null;
  paraBirimi: string;
  hazirlayan: string | null;
  hazirlayanTelefon: string | null;
  hazirlayanEmail: string | null;
  notlar: string | null;
  teslimatSuresi: string | null;
  odemeSekli: string | null;
  iskonto: string | null;
  iskontoTipi: string;
  kdv: string | null;
  items: Array<{
    title: string;
    modelCode: string | null;
    quantity: number;
    unit: string;
    unitPrice: string | null;
  }>;
}

export interface SendReportEmailOptions {
  to: string;
  reportNo: string;
  hospitalName: string;
  serviceDate: string;
  pdfBuffer: Buffer;
}

function createTransport() {
  const host = process.env["SMTP_HOST"];
  const port = parseInt(process.env["SMTP_PORT"] ?? "587", 10);
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];

  if (!host || !user || !pass) {
    throw new Error("E-posta yapılandırması eksik (SMTP_HOST, SMTP_USER, SMTP_PASS gereklidir)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendQuoteFormEmail(opts: SendQuoteFormEmailOptions): Promise<void> {
  const transport = createTransport();
  const from = process.env["SMTP_FROM"] ?? process.env["SMTP_USER"] ?? "noreply@oxymed.com.tr";

  const currency = opts.paraBirimi ?? "EUR";
  const fmt = (v: string | null | undefined) =>
    v ? parseFloat(v).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

  let subtotal = 0;
  for (const item of opts.items) {
    const price = parseFloat(item.unitPrice ?? "0") || 0;
    subtotal += price * (item.quantity ?? 1);
  }

  const iskontoVal = parseFloat(opts.iskonto ?? "0") || 0;
  const iskontoAmount = opts.iskontoTipi === "yuzde"
    ? subtotal * (iskontoVal / 100)
    : iskontoVal;
  const afterDiscount = subtotal - iskontoAmount;
  const kdvRate = parseFloat(opts.kdv ?? "0") || 0;
  const kdvAmount = afterDiscount * (kdvRate / 100);
  const total = afterDiscount + kdvAmount;

  const itemRows = opts.items
    .map(
      (item, i) => `
      <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8fafc"}">
        <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b">${item.title}${item.modelCode ? `<br><span style="font-size:11px;color:#94a3b8">${item.modelCode}</span>` : ""}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:center;color:#475569">${item.quantity} ${item.unit}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;color:#475569">${fmt(item.unitPrice)} ${currency}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;font-weight:600;color:#1e293b">${fmt(String((parseFloat(item.unitPrice ?? "0") || 0) * (item.quantity ?? 1)))} ${currency}</td>
      </tr>`
    )
    .join("");

  const dateStr = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

  await transport.sendMail({
    from: `"Oxymed Medikal" <${from}>`,
    to: opts.to,
    subject: `Teklif - ${opts.quoteNo}${opts.firmaAdi ? ` | ${opts.firmaAdi}` : ""}`,
    html: `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#08265f 0%,#0e3a8a 100%);padding:28px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:0.5px">OXYMED MEDİKAL</div>
                  <div style="font-size:12px;color:#93c5fd;margin-top:4px">Medikal Gaz Sistemleri &amp; Hastane Ekipmanları</div>
                </td>
                <td align="right">
                  <div style="background:rgba(255,255,255,0.12);border-radius:8px;padding:8px 14px;display:inline-block;text-align:right">
                    <div style="font-size:10px;color:#93c5fd;text-transform:uppercase;letter-spacing:1px">Teklif No</div>
                    <div style="font-size:16px;font-weight:700;color:#ffffff;margin-top:2px">${opts.quoteNo}</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:28px 32px 0">
            <p style="margin:0 0 8px;font-size:14px;color:#475569">Sayın${opts.firmaAdi ? ` <strong style="color:#1e293b">${opts.firmaAdi}</strong>` : " İlgili"},</p>
            <p style="margin:0;font-size:14px;color:#475569;line-height:1.6">
              Tarafınıza sunmakta olduğumuz teklif aşağıda yer almaktadır. Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz.
            </p>
          </td>
        </tr>

        <!-- Info boxes -->
        <tr>
          <td style="padding:20px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${opts.teslimatSuresi ? `<td width="50%" style="padding-right:8px"><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px"><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px">Teslimat Süresi</div><div style="font-size:13px;font-weight:600;color:#1e293b">${opts.teslimatSuresi}</div></div></td>` : ""}
                ${opts.odemeSekli ? `<td width="50%" style="padding-left:8px"><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px"><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px">Ödeme Şekli</div><div style="font-size:13px;font-weight:600;color:#1e293b">${opts.odemeSekli}</div></div></td>` : ""}
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items table -->
        <tr>
          <td style="padding:0 32px">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
              <thead>
                <tr style="background:#f8fafc">
                  <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0">Ürün / Hizmet</th>
                  <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0">Miktar</th>
                  <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0">Birim Fiyat</th>
                  <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0">Toplam</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style="padding:20px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="60%"></td>
                <td width="40%">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
                    <tr style="background:#f8fafc">
                      <td style="padding:8px 12px;font-size:12px;color:#64748b">Ara Toplam</td>
                      <td style="padding:8px 12px;font-size:12px;text-align:right;color:#1e293b;font-weight:600">${fmt(String(subtotal))} ${currency}</td>
                    </tr>
                    ${iskontoVal > 0 ? `<tr><td style="padding:8px 12px;font-size:12px;color:#64748b">İskonto (${opts.iskontoTipi === "yuzde" ? `%${iskontoVal}` : `${fmt(String(iskontoVal))} ${currency}`})</td><td style="padding:8px 12px;font-size:12px;text-align:right;color:#dc2626;font-weight:600">-${fmt(String(iskontoAmount))} ${currency}</td></tr>` : ""}
                    ${kdvRate > 0 ? `<tr><td style="padding:8px 12px;font-size:12px;color:#64748b">KDV (%${kdvRate})</td><td style="padding:8px 12px;font-size:12px;text-align:right;color:#1e293b;font-weight:600">${fmt(String(kdvAmount))} ${currency}</td></tr>` : ""}
                    <tr style="background:#08265f">
                      <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#ffffff">Genel Toplam</td>
                      <td style="padding:10px 12px;font-size:14px;font-weight:800;text-align:right;color:#ffffff">${fmt(String(total))} ${currency}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${opts.notlar ? `
        <!-- Notes -->
        <tr>
          <td style="padding:0 32px 20px">
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 16px">
              <div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Notlar</div>
              <div style="font-size:13px;color:#78350f;white-space:pre-line">${opts.notlar}</div>
            </div>
          </td>
        </tr>` : ""}

        <!-- Preparer -->
        ${opts.hazirlayan ? `
        <tr>
          <td style="padding:0 32px 24px">
            <div style="border-top:1px solid #e2e8f0;padding-top:16px">
              <div style="font-size:12px;font-weight:700;color:#1e293b">${opts.hazirlayan}</div>
              ${opts.hazirlayanTelefon ? `<div style="font-size:12px;color:#64748b;margin-top:2px">${opts.hazirlayanTelefon}</div>` : ""}
              ${opts.hazirlayanEmail ? `<div style="font-size:12px;color:#3b82f6;margin-top:2px">${opts.hazirlayanEmail}</div>` : ""}
            </div>
          </td>
        </tr>` : ""}

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center">
            <p style="margin:0;font-size:11px;color:#94a3b8">
              Bu teklif ${dateStr} tarihinde Oxymed Medikal tarafından hazırlanmıştır.<br>
              Ankara · <a href="https://www.oxymedmedical.com" style="color:#3b82f6;text-decoration:none">www.oxymedmedical.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendServiceReportEmail(opts: SendReportEmailOptions): Promise<void> {
  const transport = createTransport();
  const from = process.env["SMTP_FROM"] ?? process.env["SMTP_USER"] ?? "noreply@oxymed.com.tr";

  await transport.sendMail({
    from: `"Oxymed Medikal Teknik Servis" <${from}>`,
    to: opts.to,
    subject: `Servis Raporu - ${opts.reportNo} | ${opts.hospitalName}`,
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b">
  <div style="border-bottom:3px solid #08265f;padding-bottom:16px;margin-bottom:24px">
    <h1 style="margin:0;color:#08265f;font-size:20px">OXYMED MEDİKAL</h1>
    <p style="margin:4px 0 0;color:#64748b;font-size:13px">Medikal Gaz Sistemleri · Teknik Servis Birimi</p>
  </div>
  <h2 style="color:#1e293b;font-size:16px;margin:0 0 8px">Servis & Bakım Raporu</h2>
  <p style="margin:0 0 16px;color:#475569;font-size:14px">
    Sayın ilgili,<br><br>
    <strong>${opts.hospitalName}</strong> için düzenlenen servis raporunuz ekte PDF olarak gönderilmiştir.
  </p>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
    <tr style="background:#f8fafc">
      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;width:40%">Rapor No</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0">${opts.reportNo}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700">Hastane / Kurum</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0">${opts.hospitalName}</td>
    </tr>
    <tr style="background:#f8fafc">
      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700">Servis Tarihi</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0">${opts.serviceDate}</td>
    </tr>
  </table>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="font-size:12px;color:#94a3b8;margin:0">
    Bu e-posta Oxymed Medikal Gaz Sistemleri tarafından otomatik olarak gönderilmiştir.<br>
    Ankara · www.oxymedmedical.com
  </p>
</body>
</html>`,
    attachments: [
      {
        filename: `${opts.reportNo}.pdf`,
        content: opts.pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
