import nodemailer from "nodemailer";

export interface SendQuoteFormEmailOptions {
  to: string;
  quoteNo: string;
  firmaAdi: string | null;
  logoBase64?: string;
  pdfBuffer?: Buffer;
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

  const dateStr = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

  const logoHtml = opts.logoBase64
    ? `<img src="${opts.logoBase64}" alt="Oxymed Medikal" width="160" style="display:block;height:auto;max-height:52px;object-fit:contain;margin-bottom:10px">`
    : `<div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.5px">OXYMED MEDİKAL</div>`;

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
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#08265f 0%,#0e3a8a 100%);padding:28px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  ${logoHtml}
                  <div style="font-size:12px;color:#93c5fd;margin-top:2px">Medikal Gaz Sistemleri &amp; Hastane Ekipmanları</div>
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

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 28px">
            <p style="margin:0 0 10px;font-size:14px;color:#475569">Sayın${opts.firmaAdi ? ` <strong style="color:#1e293b">${opts.firmaAdi}</strong>` : " İlgili"},</p>
            <p style="margin:0;font-size:14px;color:#475569;line-height:1.7">
              Tarafınıza sunmakta olduğumuz teklif aşağıda yer almaktadır. Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz.
            </p>
            ${opts.pdfBuffer ? `<p style="margin:16px 0 0;font-size:13px;color:#64748b">Teklifinizin detaylı PDF'i bu e-postaya eklenmiştir.</p>` : ""}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center">
            <p style="margin:0;font-size:11px;color:#94a3b8">
              Bu e-posta Oxymed Medikal Gaz Sistemleri tarafından otomatik olarak gönderilmiştir.<br>
              Teklif No: ${opts.quoteNo} | Tarih: ${dateStr}<br>
              <a href="https://www.oxymedmedical.com" style="color:#64748b;text-decoration:none">www.oxymedmedical.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    attachments: opts.pdfBuffer
      ? [{ filename: `Teklif-${opts.quoteNo}.pdf`, content: opts.pdfBuffer, contentType: "application/pdf" }]
      : [],
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
