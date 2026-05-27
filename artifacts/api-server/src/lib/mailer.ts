import nodemailer from "nodemailer";

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
    İzmir · www.oxymed.com.tr
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
