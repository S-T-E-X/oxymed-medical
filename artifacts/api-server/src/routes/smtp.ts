import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";
import nodemailer from "nodemailer";

const router: IRouter = Router();

router.get("/settings/smtp/status", requireAuth, (req, res): void => {
  const host = process.env["SMTP_HOST"];
  const port = parseInt(process.env["SMTP_PORT"] ?? "587", 10);
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  const from = process.env["SMTP_FROM"];

  const configured = Boolean(host && user && pass);

  res.json({
    configured,
    host: Boolean(host),
    port,
    user: Boolean(user),
    from: Boolean(from),
  });
});

router.post("/settings/smtp/test", requireAuth, async (req, res): Promise<void> => {
  const parsed = z.object({ to: z.email() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Geçerli bir e-posta adresi giriniz." });
    return;
  }

  const host = process.env["SMTP_HOST"];
  const port = parseInt(process.env["SMTP_PORT"] ?? "587", 10);
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  const from = process.env["SMTP_FROM"] ?? user ?? "noreply@oxymed.com.tr";

  if (!host || !user || !pass) {
    res.status(400).json({
      success: false,
      message: "SMTP yapılandırması eksik. Lütfen SMTP_HOST, SMTP_USER ve SMTP_PASS ortam değişkenlerini tanımlayın.",
    });
    return;
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transport.sendMail({
      from: `"Oxymed Medikal" <${from}>`,
      to: parsed.data.to,
      subject: "Oxymed Medikal – SMTP Test E-postası",
      html: `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1e293b">
  <div style="border-bottom:3px solid #08265f;padding-bottom:16px;margin-bottom:24px">
    <h1 style="margin:0;color:#08265f;font-size:20px">OXYMED MEDİKAL</h1>
    <p style="margin:4px 0 0;color:#64748b;font-size:13px">E-posta Yapılandırma Testi</p>
  </div>
  <p style="margin:0 0 16px;font-size:14px;color:#475569">
    Bu e-posta SMTP yapılandırmanızın doğru çalıştığını doğrulamak amacıyla otomatik olarak gönderilmiştir.
  </p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px">
    <p style="margin:0;font-size:14px;color:#166534;font-weight:600">✓ SMTP bağlantısı başarıyla kuruldu</p>
    <p style="margin:4px 0 0;font-size:13px;color:#15803d">Sunucu: ${host}:${port}</p>
  </div>
  <p style="margin:0;font-size:12px;color:#94a3b8">
    Bu e-posta Oxymed Medikal admin panelinden gönderilmiştir.<br>
    <a href="https://www.oxymedmedical.com" style="color:#64748b;text-decoration:none">www.oxymedmedical.com</a>
  </p>
</body>
</html>`,
    });

    res.json({ success: true, message: `Test e-postası başarıyla ${parsed.data.to} adresine gönderildi.` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "SMTP test failed");
    res.status(400).json({ success: false, message: `E-posta gönderilemedi: ${message}` });
  }
});

export default router;
