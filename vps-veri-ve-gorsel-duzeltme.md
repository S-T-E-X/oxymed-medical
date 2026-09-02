# Oxymed Medikal — VPS Veri ve Görsel Düzeltme Rehberi

Bu rehber, Oxymed Medikal sitesini VPS üzerinde çalıştırırken veritabanı
verilerinin, ürün/haber görsellerinin veya yeni kodun doğru şekilde
güncellenmesi için hazırlanmıştır.

Bu rehberde kullanılan çalışma şekli şöyledir:

1. FileZilla ile VPS'ye **ubuntu kullanıcısı** olarak bağlanılır.
2. Dosyalar FileZilla ile VPS'deki `/tmp` klasörüne yüklenir.
3. SSH terminalinde `sudo -i` ile root yetkisine geçilir.
4. Dosyalar `/tmp` klasöründen kalıcı klasörlere çıkarılır.

> Önemli: Replit komutları yalnızca Replit Shell'de, VPS komutları yalnızca
> VPS SSH terminalinde çalıştırılmalıdır. `root@vps...` görünen terminalde
> `/home/runner/workspace` kullanmayın; bu klasör yalnızca Replit'te vardır.

---

## 1. VPS klasör yapısı

Bu rehber şu klasörleri kullanır:

```text
/var/www/oxymed/                         ← proje kodu
/var/www/oxymed/.env                     ← VPS gizli ayarları
/var/www/oxymed/artifacts/api-server/    ← API projesi
/var/www/oxymed/artifacts/oxymed-medikal/← web projesi
/var/lib/oxymed/media/                   ← kalıcı medya klasörü
/var/lib/oxymed/media/files/objects/uploads/UUID
                                            ← görsel dosyaları
/tmp/oxymed-media-export.tar.gz          ← FileZilla ile geçici yükleme
```

Site ve API adresleri:

```text
Site:     https://www.oxymedmedical.com
Health:   https://www.oxymedmedical.com/api/healthz
Görsel:   https://www.oxymedmedical.com/api/storage/public-objects/objects/uploads/UUID
```

`media_files.object_path` değeri örneğin şöyle olur:

```text
/objects/uploads/550e8400-e29b-41d4-a716-446655440000
```

Bu kaydın diskteki karşılığı şudur:

```text
/var/lib/oxymed/media/files/objects/uploads/550e8400-e29b-41d4-a716-446655440000
```

---

## 2. İşleme başlamadan önce

### 2.1 Ubuntu kullanıcısıyla bağlanın

FileZilla ve SSH bağlantısında:

```text
Kullanıcı: ubuntu
```

SSH ile bağlandıktan sonra root yetkisine geçin:

```bash
sudo -i
```

Komut satırının başında artık şuna benzer bir ifade görmelisiniz:

```text
root@vps-055aa79a:~#
```

### 2.2 Veritabanı ve mevcut medya yedeği alın

Bu adım verileri silmez; olası bir hatada geri dönüş için yedek oluşturur:

```bash
cd /var/www/oxymed

set -a
source .env
set +a

mkdir -p /root/oxymed-backup

pg_dump "$DATABASE_URL" --no-owner --no-privileges \
  > "/root/oxymed-backup/db-$(date +%F-%H%M).sql"

tar -czf "/root/oxymed-backup/media-$(date +%F-%H%M).tar.gz" \
  -C /var/lib/oxymed media

ls -lh /root/oxymed-backup
```

> `DROP DATABASE`, `push-force` veya rastgele `DELETE FROM media_files`
> komutu çalıştırmayın.

---

## 3. Replit'teki medya arşivini hazırlayın

Bu bölüm **Replit Shell'de** çalıştırılır. VPS terminalinde çalıştırmayın.

Replit dosya listesinde şu dosya hazırsa yeniden oluşturmanız gerekmez:

```text
oxymed-media-export.tar.gz
```

Replit Shell'de kontrol:

```bash
cd /home/runner/workspace
ls -lh oxymed-media-export.tar.gz
tar -tzf oxymed-media-export.tar.gz | head -20
```

Bu projede arşiv yaklaşık 62 MB boyutunda ve 186 medya dosyası içermektedir.

Arşiv Replit'te yoksa, yine **Replit Shell'de** oluşturun:

```bash
cd /home/runner/workspace

MEDIA_EXPORT_API_URL=http://127.0.0.1:8080 \
  pnpm --filter @workspace/scripts run export-media-to-local-disk

tar -C oxymed-media-export \
  -czf oxymed-media-export.tar.gz files manifest.json
```

Komut başarılı olursa Replit dosya listesinde şu dosyayı görmelisiniz:

```text
/home/runner/workspace/oxymed-media-export.tar.gz
```

> `fetch failed` görürseniz komutu VPS'de çalıştırmışsınızdır veya Replit API
> çalışmıyordur. Bu komut VPS'deki mevcut dosyalardan arşiv oluşturmaz;
> Replit'teki medya kayıtlarını ve Replit API'sini kullanır.

---

## 4. FileZilla ile arşivi VPS'ye yükleyin

FileZilla ile VPS'ye **ubuntu** kullanıcısı olarak bağlanın.

1. Sol tarafta Replit'ten indirdiğiniz `oxymed-media-export.tar.gz` dosyasını bulun.
2. Sağ tarafta `/tmp` klasörünü açın.
3. Dosyayı sağ taraftaki `/tmp` klasörüne sürükleyin.

Yükleme tamamlandıktan sonra VPS SSH terminalinde root olduğunuzu kontrol edin:

```bash
sudo -i
ls -lh /tmp/oxymed-media-export.tar.gz
```

Beklenen çıktı dosya boyutunu göstermelidir. Dosya bulunamıyorsa önce
FileZilla yüklemesini tamamlayın; sonraki komutları çalıştırmayın.

---

## 5. Medya arşivini VPS'de açın

Bu bölüm VPS SSH terminalinde ve `root` yetkisiyle çalıştırılır:

```bash
set -e

install -d -o oxymed -g oxymed -m 0750 /var/lib/oxymed/media
install -d -o oxymed -g oxymed -m 0750 /var/lib/oxymed/media/files
install -d -o oxymed -g oxymed -m 0750 /var/lib/oxymed/media/.staging
install -d -o oxymed -g oxymed -m 0750 /var/lib/oxymed/media/.trash

tar -tzf /tmp/oxymed-media-export.tar.gz | head -20
tar -xzf /tmp/oxymed-media-export.tar.gz -C /var/lib/oxymed/media

chown -R oxymed:oxymed /var/lib/oxymed/media
find /var/lib/oxymed/media/files -type f -exec chmod 0640 {} \;
```

Arşiv içindeki yollar şu biçimde başlamalıdır:

```text
files/objects/uploads/...
manifest.json
```

> Arşivi `/var/lib/oxymed/media/files` içine değil,
> `/var/lib/oxymed/media` içine açın. Aksi halde `files/files/...` şeklinde
> hatalı bir klasör oluşur.

---

## 6. Medya arşivinin bütünlüğünü doğrulayın

Arşivdeki her dosyanın boyutunu ve SHA-256 değerini kontrol edin:

```bash
node <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = "/var/lib/oxymed/media/files";
const manifestPath = "/var/lib/oxymed/media/manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
let bad = 0;

for (const item of manifest.files) {
  const relative = item.objectPath.replace(/^\/+/, "");
  const filePath = path.resolve(root, relative);
  const rootPath = path.resolve(root) + path.sep;

  if (!filePath.startsWith(rootPath)) {
    console.error(`HATALI YOL: ${item.objectPath}`);
    bad++;
    continue;
  }

  let bytes;
  try {
    bytes = fs.readFileSync(filePath);
  } catch {
    console.error(`EKSİK: ${item.objectPath}`);
    bad++;
    continue;
  }

  const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
  if (bytes.length !== item.size || sha256 !== item.sha256) {
    console.error(`HATALI DOSYA: ${item.objectPath}`);
    bad++;
  }
}

if (bad > 0) {
  console.error(`Doğrulama başarısız: ${bad} dosya`);
  process.exit(1);
}

console.log(`Doğrulandı: ${manifest.count} medya dosyası`);
NODE
```

Beklenen sonuç:

```text
Doğrulandı: 186 medya dosyası
```

Bu mesajı görmeden arşivi silmeyin.

---

## 7. Veritabanı kayıtları ile dosyaları karşılaştırın

Önce VPS ortam değişkenlerini yükleyin:

```bash
cd /var/www/oxymed

set -a
source .env
set +a
```

Sonra doğru yolu kullanan kontrolü çalıştırın:

```bash
missing=0
while IFS= read -r object_path; do
  file="/var/lib/oxymed/media/files${object_path}"
  if [ ! -f "$file" ]; then
    echo "Eksik dosya: $object_path -> $file"
    missing=$((missing + 1))
  fi
done < <(psql "$DATABASE_URL" -Atc \
  "select object_path from media_files order by object_path")

printf 'Eksik medya dosyası: %s\n' "$missing"
```

Beklenen sonuç:

```text
Eksik medya dosyası: 0
```

> `object_path` `/objects/uploads/UUID` ile başladığı için kontrol yolu
> `/var/lib/oxymed/media/files/objects/uploads/UUID` olmalıdır. UUID'yi
> doğrudan `files/UUID` altında aramayın.

### Sonuç hâlâ 0 değilse

Önce arşivde ve diskte aynı dosya var mı kontrol edin:

```bash
tar -tzf /tmp/oxymed-media-export.tar.gz | grep 'files/objects/uploads/' | head
find /var/lib/oxymed/media/files/objects/uploads -type f | wc -l
```

Arşivde dosya var ama diskte yoksa 5. bölümü tekrar çalıştırın.

Arşivde de dosya yoksa Replit'teki export tamamlanmamıştır. Replit Shell'de
export komutunu yeniden çalıştırın ve hata mesajındaki `object_path` değerini
inceleyin.

`media_files` kayıtlarını silmeyin ve dosya adlarını değiştirmeyin. API,
veritabanındaki aynı UUID yolunu arar.

---

## 8. Medya endpoint'ini test edin

Veritabanından bir medya yolu alıp sitenin API'sini test edin:

```bash
MEDIA_PATH=$(psql "$DATABASE_URL" -Atc \
  "select object_path from media_files order by created_at desc limit 1")

if [ -z "$MEDIA_PATH" ]; then
  echo "Test edilecek medya kaydı bulunamadı"
else
  echo "Test yolu: /api/storage/public-objects${MEDIA_PATH}"
  curl -sS -o /dev/null \
    -w 'HTTP=%{http_code} Content-Type=%{content_type}\n' \
    "https://www.oxymedmedical.com/api/storage/public-objects${MEDIA_PATH}"
fi
```

Beklenen sonuç:

```text
HTTP=200 Content-Type=image/...
```

Sonuçların anlamı:

| Sonuç | Anlamı |
|---|---|
| `200` | Görsel başarıyla sunuluyor |
| `404` | Dosya yolu veya `media_files` kaydı eksik |
| `400` | URL biçimi hatalı veya çift slash var |
| `502` | Nginx API'ye ulaşamıyor |
| `503` | API hazır değil |

---

## 9. Admin panelindeki veriler 0 veya boş görünüyorsa

Admin panelindeki üst kartlar ve ziyaretçi grafikleri farklı endpoint'lerden
gelir:

| Panel bölümü | API endpoint'i | Veritabanı kaynağı |
|---|---|---|
| Ürünler, haberler, referanslar, teklifler | `/api/dashboard/stats` | `products`, `news`, `references`, `quote_requests` |
| Ziyaretçi ve görüntüleme kartları | `/api/analytics/summary` | `visitor_events` |

### 9.1 VPS'nin doğru veritabanına bağlı olduğunu kontrol edin

Bu komutlar VPS SSH terminalinde ve root yetkisiyle çalıştırılır. Parola
ekrana yazdırılmaz:

```bash
cd /var/www/oxymed

set -a
source .env
set +a

psql "$DATABASE_URL" -c "
  select
    (select count(*) from admin_users) as admin_users,
    (select count(*) from products) as products,
    (select count(*) from news) as news,
    (select count(*) from \"references\") as references_count,
    (select count(*) from quote_requests) as quote_requests,
    (select count(*) from media_files) as media_files,
    (select count(*) from visitor_events) as visitor_events;
"
```

`products`, `news`, `references` veya `quote_requests` sayıları beklenenden
farklıysa sorun frontend'de değildir; VPS `.env` dosyası yanlış PostgreSQL
veritabanını gösteriyor olabilir. `DATABASE_URL` değerini ekrana basmadan
kontrol edin:

```bash
grep -E '^(DATABASE_URL|PORT|NODE_ENV|EnvironmentFile)' /var/www/oxymed/.env \
  | sed 's#^\(DATABASE_URL=[^:]*://[^:]*\):[^@]*@#\1:***@#'
```

Systemd servisinin doğru `.env` dosyasını kullandığını kontrol edin:

```bash
grep -E '^(User|WorkingDirectory|EnvironmentFile|ExecStart)' \
  /etc/systemd/system/oxymed-api.service
```

Beklenen satır:

```text
EnvironmentFile=/var/www/oxymed/.env
```

### 9.2 Ziyaretçi grafikleri 0 görünüyorsa

`visitor_events` sayısı `0` ise bu tek başına hata değildir. Site analytics
verisini yalnızca ziyaretçi çerez bildiriminde **Kabul Et** seçildikten sonra
toplar. Test için:

1. Gizli tarayıcı penceresinde siteyi açın.
2. Çerez bildiriminde **Kabul Et** seçin.
3. Tarayıcı geliştirici araçlarında Network/Ağ sekmesini açın.
4. `POST /api/analytics/track` isteğinin `204` döndüğünü kontrol edin.
5. Birkaç saniye sonra `visitor_events` sayısını tekrar kontrol edin:

```bash
cd /var/www/oxymed
set -a
source .env
set +a
psql "$DATABASE_URL" -c "select count(*) as visitor_events from visitor_events;"
```

`visitor_events` sayısı artıyor fakat panelde veri görünmüyorsa panelden
çıkış yapıp tekrar giriş yapın ve API loglarını kontrol edin:

```bash
journalctl -u oxymed-api --since "15 minutes ago" --no-pager \
  | grep -E 'dashboard/stats|analytics/summary|500|error|Error'
```

`/api/auth/me` için giriş yapılmadan `401` dönmesi normaldir; bu endpoint admin
oturumu gerektirir. Tarayıcıda admin girişi yapıldıktan sonra Network/Ağ
sekmesinde şu iki isteğin başarılı olduğunu kontrol edin:

```text
GET /api/dashboard/stats       → 200
GET /api/analytics/summary     → 200
```

`500`, `502` veya `503` görürseniz önce API servisini yeniden başlatın:

```bash
systemctl restart oxymed-api
systemctl is-active oxymed-api
journalctl -u oxymed-api -n 100 --no-pager
```

### 9.3 Admin panelini ve çalışan siteyi yenileme

Sadece tarayıcıdaki eski ekranı yenilemek için:

```text
Ctrl+F5
```

VPS'de çalışan API ve web dosyalarını güncel kodla yenilemek için aşağıdaki
komut bloğunu kullanın. Bu işlem mevcut PostgreSQL verilerini veya kalıcı
görselleri silmez:

```bash
cd /var/www/oxymed

git pull --ff-only
pnpm install --frozen-lockfile

set -a
source .env
set +a

pnpm --filter @workspace/api-server run build
PORT=5199 BASE_PATH=/ \
  pnpm --filter @workspace/oxymed-medikal run build

systemctl restart oxymed-api
nginx -t && systemctl reload nginx

systemctl is-active oxymed-api
systemctl is-active nginx
```

Build sırasında hata oluşursa servis yeniden başlatma komutuna geçmeyin.
`git pull --ff-only` conflict verirse `git reset --hard` veya `push-force`
kullanmayın; önce `git status` ve `git diff` çıktısını inceleyin.

---

## 10. Replit'teki kodu GitHub'a gönderme

Bu bölüm yalnızca Replit Shell'de çalıştırılır:

```bash
cd /home/runner/workspace

git remote -v
git branch --show-current
git status

git add -A
git commit -m "VPS güncellemesi"
git push <GITHUB_REMOTE> main
```

`<GITHUB_REMOTE>` yerine `git remote -v` çıktısında GitHub adresinin
karşısındaki remote adını yazın. Örnek:

```bash
git push origin main
```

Çalışma ağacında değişiklik yoksa `git commit` hata verebilir. Bu durumda
`git status` ile kontrol edip gerekiyorsa yalnızca `git push` çalıştırın.

---

## 11. VPS'de GitHub'dan yeni kodu çekme ve build alma

Bu bölüm VPS SSH terminalinde root olarak çalıştırılır:

```bash
cd /var/www/oxymed

git pull --ff-only
pnpm install --frozen-lockfile

set -a
source .env
set +a

pnpm --filter @workspace/api-server run build
PORT=5199 BASE_PATH=/ \
  pnpm --filter @workspace/oxymed-medikal run build

systemctl restart oxymed-api
nginx -t && systemctl reload nginx

systemctl is-active oxymed-api
systemctl is-active nginx
```

Web build'i sitemap, SEO ve prerender dosyalarını da yeniler. Build sırasında
hata olursa `systemctl restart oxymed-api` çalıştırmadan önce hatayı düzeltin.

`git pull --ff-only` conflict veya `not possible to fast-forward` hatası
verirse zorlayıcı pull/reset komutları kullanmayın:

```bash
git status
git diff
```

Bu medya düzeltmesi için veritabanı şeması değişmediğinden
`pnpm --filter @workspace/db run push` çalıştırmanız gerekmez. Şema gerçekten
değişmişse önce veritabanı yedeği alın ve ayrıca normal `push` komutunu kullanın;
`push-force` kullanmayın.

---

## 12. Son kontrol

```bash
systemctl is-active oxymed-api
systemctl is-active nginx

curl -sS -i https://www.oxymedmedical.com/api/healthz

find /var/lib/oxymed/media/files/objects/uploads -type f | wc -l
```

Beklenenler:

```text
active
active
HTTP/2 200
186
```

Tarayıcıda ayrıca şunları kontrol edin:

1. Ana sayfadaki görseller açılıyor mu?
2. Ürün sayfasındaki görseller açılıyor mu?
3. Haber görselleri açılıyor mu?
4. Görsel URL'si `replit.dev` veya `replit.app` içermiyor mu?
5. Görsel URL'si `/api/storage/public-objects/objects/uploads/UUID` biçiminde mi?

---

## 13. İşlem tamamlandıktan sonra

Her şey doğrulandıktan sonra geçici arşivi silebilirsiniz:

```bash
rm -f /tmp/oxymed-media-export.tar.gz
```

Arşivin bir kopyasını bilgisayarınızda veya ayrı bir yedek diskte saklayın.

Gizli bilgileri hiçbir komut çıktısında paylaşmayın:

```text
DATABASE_URL
JWT_SECRET
SMTP_PASS
AI_INTEGRATIONS_OPENAI_API_KEY
SESSION_SECRET
```