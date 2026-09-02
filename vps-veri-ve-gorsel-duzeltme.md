# Oxymed Medikal — VPS Veri ve Görsel Bağlantısı Düzeltme Rehberi

Bu rehber, site VPS'e taşındıktan sonra aşağıdaki sorunlar görüldüğünde uygulanır:

- Ana sayfa, ürünler veya haberler açılıyor fakat içerikler boş geliyor.
- Admin panelindeki ziyaretçi istatistikleri görünmüyor.
- Görseller `replit.dev`, `replit.app` veya eski Replit storage adreslerinden
  yüklenmeye çalışıyor.
- Görsel adresi doğru görünüyor fakat tarayıcıda `404` dönüyor.

Bu işlem mevcut PostgreSQL verilerini ve medya dosyalarını silmez. Amaç, API'nin
doğru veritabanına bağlanmasını, görsellerin VPS'in yerel diskinden sunulmasını ve
web build'inin güncel kodla yenilenmesini sağlamaktır.

> Tam VPS kurulumu için `kurulum.md` dosyasını kullanın. Bu dosya, kurulum
> tamamlandıktan sonra uygulanacak düzeltme/güncelleme rehberidir.

---

## 1. Beklenen VPS yapısı

Bu rehber aşağıdaki kurulum varsayımlarıyla yazılmıştır:

```text
/var/www/oxymed/                       ← proje kodu
/var/www/oxymed/.env                   ← sunucu ayarları
/var/www/oxymed/artifacts/api-server/  ← API projesi
/var/www/oxymed/artifacts/oxymed-medikal/ ← web projesi
/var/lib/oxymed/media/files/           ← kalıcı görseller
oxymed-api                             ← systemd API servisi
nginx                                  ← web sunucusu
```

Kullanılan adresler:

```text
Site:       https://www.oxymedmedical.com
API health: https://www.oxymedmedical.com/api/healthz
Görsel:     /api/storage/public-objects/objects/uploads/DOSYA_UUID
```

Görseller Nginx tarafından doğrudan klasör alias'ı ile değil, API'nin güvenli
allowlist kontrolünden geçirilerek sunulur. Bu nedenle hem veritabanındaki medya
kaydı hem de yerel dosya birlikte bulunmalıdır.

---

## 2. İşleme başlamadan önce yedek alın

SSH ile root veya sudo yetkili bir kullanıcıyla bağlanın:

```bash
cd /var/www/oxymed
set -a
source .env
set +a

mkdir -p /root/oxymed-backup

# Veritabanı yedeği
pg_dump "$DATABASE_URL" --no-owner --no-privileges \
  > "/root/oxymed-backup/db-$(date +%F-%H%M).sql"

# Yerel medya yedeği
tar -czf "/root/oxymed-backup/media-$(date +%F-%H%M).tar.gz" \
  -C /var/lib/oxymed media
```

Yedeklerin oluştuğunu kontrol edin:

```bash
ls -lh /root/oxymed-backup
```

> `DROP DATABASE`, `drizzle-kit push --force` veya `pnpm ... push-force`
> kullanmayın. Bunlar mevcut verileri geri dönüşü zor şekilde bozabilir.

---

## 3. Kodun son sürümünü VPS'e alın

### GitHub ile kurulum yaptıysanız

Önce API'yi kısa süreli durdurun. Nginx bu sırada eski derlenmiş web dosyalarını
göstermeye devam edebilir:

```bash
systemctl stop oxymed-api

cd /var/www/oxymed
git pull --ff-only
pnpm install --frozen-lockfile
```

`git pull` sırasında conflict veya `not possible to fast-forward` hatası
alırsanız komutu zorlamayın. Önce mevcut değişiklikleri ve yedekleri kontrol edin.

### 3.1 Replit'ten GitHub'a güncel dosyaları gönderin

Replit Shell'de proje kökünde aşağıdaki komutları çalıştırın. Önce hangi remote'un
GitHub olduğunu kontrol edin; `origin` adının her Replit projesinde aynı olması
garanti değildir:

```bash
cd /home/runner/workspace

# GitHub remote adını bulun ve doğru branch'i kontrol edin
git remote -v
git branch --show-current
git status
```

Değişikliklerin doğru olduğunu kontrol ettikten sonra:

```bash
cd /home/runner/workspace
git add -A
git commit -m "VPS güncellemesi"
git push <GITHUB_REMOTE> main
```

Buradaki `<GITHUB_REMOTE>` yerine `git remote -v` çıktısında GitHub adresinin
karşısında görünen remote adını yazın. Örneğin remote adı `origin` ise:

```bash
git push origin main
```

Çalışma ağacında commit edilecek değişiklik yoksa `git commit` hata verebilir;
bu durumda yeni dosya değişikliği olmadığını kontrol edip sadece `git push`
çalıştırabilirsiniz. GitHub parola isterse parolayı veya erişim anahtarını bu
belgeye yazmayın; Replit'in Git bağlantısını veya SSH deploy key kurulumunu
kullanın.

### 3.2 VPS'de GitHub'dan dosyaları çekip siteyi güncelleyin

Replit'teki `git push` tamamlandıktan sonra VPS'ye SSH ile bağlanıp aşağıdaki
komutları çalıştırın. Bu akış mevcut veritabanını veya `/var/lib/oxymed/media/`
altındaki görselleri silmez:

```bash
cd /var/www/oxymed

# Sadece hızlı ileri sarmaya izin ver; VPS'teki yerel değişiklikleri ezme
git pull --ff-only

# Kilit dosyasındaki sürümleri kur
pnpm install --frozen-lockfile

# VPS ortam değişkenlerini build sırasında kullanılabilir yap
set -a
source .env
set +a

# API'yi derle
pnpm --filter @workspace/api-server run build

# Web'i, sitemap/SEO ve prerender çıktılarıyla birlikte derle
PORT=5199 BASE_PATH=/ pnpm --filter @workspace/oxymed-medikal run build

# Yeni API kodunu çalıştır, Nginx'i kesintisiz yeniden yükle
systemctl restart oxymed-api
nginx -t && systemctl reload nginx

# Son durumu kontrol et
systemctl is-active oxymed-api
systemctl is-active nginx
```

`git pull --ff-only` conflict veya `not possible to fast-forward` hatası verirse
zorlayıcı bir komut çalıştırmayın. Önce `git status` ve `git diff` ile VPS'teki
yerel değişiklikleri inceleyin. Build başarısız olursa `systemctl restart
oxymed-api` komutunu çalıştırmadan hatayı düzeltin; böylece çalışan API gereksiz
yere durdurulmaz.

Bu adımlar içerik, tasarım veya frontend kodu değişiklikleri için yeterlidir.
Veritabanı şeması gerçekten değiştiyse önce yedek alın ve yalnızca o sürüm için
ayrıca `pnpm --filter @workspace/db run push` çalıştırın; sıradan kod
güncellemelerinde bu komut gerekli değildir.

### ZIP ile kurulum yaptıysanız

Yeni ZIP'i `/var/www/oxymed-new` gibi geçici bir klasöre açın. Aşağıdaki dosyaları
eski klasörün üzerine kopyalamayın:

```text
/var/www/oxymed/.env
/var/lib/oxymed/media/
```

Kodun tamamını güncelledikten sonra proje kökünde bağımlılıkları kurun:

```bash
cd /var/www/oxymed
pnpm install --frozen-lockfile
```

> `.env` ve `/var/lib/oxymed/media` kod deposundan ayrı tutulmalıdır. Kod
> güncellemesi bu iki kalıcı kaynağı ezmemelidir.

---

## 4. `.env` bağlantı ayarlarını kontrol edin

Gizli değerleri ekrana yazdırmadan `.env` dosyasını yükleyin:

```bash
cd /var/www/oxymed
set -a
source .env
set +a

test -n "$DATABASE_URL" && echo "DATABASE_URL tanımlı"
test -n "$MEDIA_STORAGE_DIR" && echo "MEDIA_STORAGE_DIR tanımlı"
printf 'MEDIA_STORAGE_DIR=%s\n' "$MEDIA_STORAGE_DIR"
printf 'SITE_ORIGIN=%s\n' "$SITE_ORIGIN"
printf 'VITE_SITE_ORIGIN=%s\n' "$VITE_SITE_ORIGIN"
printf 'ALLOWED_ORIGINS=%s\n' "$ALLOWED_ORIGINS"
```

Beklenen değerler:

```dotenv
PORT=5000
SITE_ORIGIN=https://www.oxymedmedical.com
VITE_SITE_ORIGIN=https://www.oxymedmedical.com
ALLOWED_ORIGINS=https://www.oxymedmedical.com,https://oxymedmedical.com
MEDIA_STORAGE_DIR=/var/lib/oxymed/media
NODE_ENV=production
```

`DATABASE_URL` doğru VPS PostgreSQL veritabanını göstermelidir. Parolayı
terminal çıktısına veya ekran görüntüsüne koymayın.

API servisi `.env` dosyasını systemd üzerinden okuyabilmelidir:

```bash
grep -E '^(EnvironmentFile|ExecStart|User|WorkingDirectory)' \
  /etc/systemd/system/oxymed-api.service
```

Beklenen satırlar:

```ini
User=oxymed
WorkingDirectory=/var/www/oxymed/artifacts/api-server
EnvironmentFile=/var/www/oxymed/.env
```

---

## 5. Veritabanının doğru olduğunu kontrol edin

Önce `.env` değişkenlerinin yüklü olduğundan emin olun:

```bash
cd /var/www/oxymed
set -a
source .env
set +a
```

Tabloları ve temel kayıt sayılarını kontrol edin:

```bash
psql "$DATABASE_URL" -c "\dt"

psql "$DATABASE_URL" -c "
  select
    (select count(*) from products) as products,
    (select count(*) from product_categories) as categories,
    (select count(*) from sliders) as sliders,
    (select count(*) from "references") as references;
"

psql "$DATABASE_URL" -c "
  select count(*) as visitor_events
  from visitor_events;
"
```

Ürün, kategori ve slider sayıları beklenenden farklıysa API'yi değiştirmeden önce
doğru veritabanına bağlandığınızı doğrulayın. Siteyi boş bir veritabanına
bağlamak, uygulama hatası gibi görünen boş sayfalara neden olur.

`visitor_events` tablosu yoksa yalnızca normal şema push komutunu çalıştırın:

```bash
cd /var/www/oxymed
set -a
source .env
set +a
pnpm --filter @workspace/db run push
```

Bu komut veri silmez. `push-force` kullanmayın. Şema değişikliğinden sonra API'yi
mutlaka yeniden build edip yeniden başlatın.

---

## 6. Yerel medya klasörünü ve veritabanı allowlist'ini kontrol edin

API'nin kullandığı klasörleri oluşturun ve sahipliğini düzeltin:

```bash
install -d -o oxymed -g oxymed -m 0750 /var/lib/oxymed/media/files
install -d -o oxymed -g oxymed -m 0750 /var/lib/oxymed/media/.staging
install -d -o oxymed -g oxymed -m 0750 /var/lib/oxymed/media/.trash

chown -R oxymed:oxymed /var/lib/oxymed/media
find /var/lib/oxymed/media/files -type f -exec chmod 0640 {} \;
```

Dosya sayısını kontrol edin:

```bash
find /var/lib/oxymed/media/files -maxdepth 1 -type f | wc -l
```

Veritabanında kayıtlı medya yollarını görün:

```bash
psql "$DATABASE_URL" -c "
  select object_path, mime_type
  from media_files
  order by created_at desc
  limit 20;
"
```

`object_path` değerleri şu biçimde olmalıdır:

```text
/objects/uploads/550e8400-e29b-41d4-a716-446655440000
```

Dosya aynı UUID ile şu konumda bulunur:

```text
/var/lib/oxymed/media/files/550e8400-e29b-41d4-a716-446655440000
```

Veritabanındaki kayıtların yerel dosyalarıyla eşleşmeyenleri bulmak için:

```bash
missing=0
while IFS= read -r object_path; do
  file="/var/lib/oxymed/media/files/${object_path##*/}"
  if [ ! -f "$file" ]; then
    echo "Eksik dosya: $object_path -> $file"
    missing=$((missing + 1))
  fi
done < <(psql "$DATABASE_URL" -Atc "select object_path from media_files order by object_path")

printf 'Eksik medya dosyası: %s\n' "$missing"
```

Eksik dosyalar varsa sadece build almak sorunu çözmez. Medya yedeğinden veya
orijinal dosyalardan aynı UUID adını koruyarak `/var/lib/oxymed/media/files/`
altına geri yükleyin. Sonra sahiplik komutlarını tekrar çalıştırın.

---

## 7. API ve web'i yeniden derleyin

Proje kökünde:

```bash
cd /var/www/oxymed
set -a
source .env
set +a

# API
pnpm --filter @workspace/api-server run build

# Web
PORT=5199 BASE_PATH=/ pnpm --filter @workspace/oxymed-medikal run build
```

Web build'i veritabanından sitemap ve SEO bilgilerini okuyabilir. Build sırasında
`DATABASE_URL is not set` görürseniz önce `.env` yükleme adımını tekrarlayın.

Build sonrasında şu dosyalar bulunmalıdır:

```bash
test -f /var/www/oxymed/artifacts/api-server/dist/index.mjs
test -f /var/www/oxymed/artifacts/oxymed-medikal/dist/public/index.html
echo "API ve web build dosyaları hazır"
```

Eski Replit medya adreslerinin derlenmiş çıktıya taşınmadığını kontrol edin:

```bash
if grep -RniE 'replit\.(dev|app)|public-objects//' \
  /var/www/oxymed/artifacts/oxymed-medikal/src \
  /var/www/oxymed/artifacts/oxymed-medikal/dist/public \
  --exclude='*.map'; then
  echo "HATA: Eski veya bozuk medya adresi bulundu"
  exit 1
else
  echo "Eski Replit medya adresi bulunamadı"
fi
```

Uygulama, eski veritabanı kayıtlarında Replit storage adresi kalsa bile bunları
tarayıcıda mevcut API'nin göreli `/api/storage/public-objects/...` yoluna
normalize eder. Yine de yeni kayıtların bundan sonra yerel API yolu ile
oluşturulması gerekir.

---

## 8. Servisleri yeniden başlatın

```bash
systemctl daemon-reload
systemctl restart oxymed-api
systemctl reload nginx

systemctl is-active oxymed-api
systemctl is-active nginx
```

`active` çıktısını görmelisiniz. API loglarını kontrol edin:

```bash
journalctl -u oxymed-api -n 100 --no-pager
```

Başlangıçta `Local media storage reconciled` ve `Server listening` mesajlarını
görmelisiniz. API tekrar başlamıyorsa:

```bash
systemctl status oxymed-api --no-pager
journalctl -u oxymed-api -n 100 --no-pager
```

---

## 9. Veri yüklenmesini doğrulayın

### 9.1 API health

```bash
curl -sS -i http://127.0.0.1:5000/api/healthz
curl -sS -i https://www.oxymedmedical.com/api/healthz
```

İki istekte de `200` ve aşağıdaki cevap beklenir:

```json
{"status":"ok"}
```

### 9.2 API içerik cevapları

```bash
for endpoint in product-categories products sliders references settings; do
  printf '%-22s' "$endpoint"
  curl -sS -o /dev/null -w '%{http_code}\n' \
    "https://www.oxymedmedical.com/api/$endpoint"
done
```

Bu endpoint'lerde beklenen cevap genellikle `200` veya cache nedeniyle `304`'tür.
`502` API'nin ayakta olmadığını, `503` ise servis/bağımlılık sorunu olduğunu
gösterir.

### 9.3 Admin paneli

1. `https://www.oxymedmedical.com/admin/login` adresini açın.
2. Admin hesabıyla giriş yapın.
3. **Kontrol Paneli** sayfasına gidin.
4. Sayfa kaynağında veya Network sekmesinde `/api/analytics/summary`
   isteğini kontrol edin.
5. Ziyaretçi kartlarında veri görünmelidir. API hata verirse kartın `0` göstermesi
   yerine “Veri alınamadı” uyarısı görünür.

`/api/analytics/summary` isteğini oturum cookie'si olmadan curl ile çağırırsanız
`401` dönmesi normaldir; endpoint admin oturumuyla korunur.

---

## 10. Analytics verisini doğrulayın

İstatistik toplama, ziyaretçi çerez bildiriminde **Kabul Et** seçildikten sonra
başlar. Gizli bir tarayıcı penceresinde:

1. Ana sayfayı açın.
2. Çerez bildiriminde **Kabul Et** seçin.
3. Geliştirici araçları > **Network / Ağ** sekmesini açın.
4. `POST /api/analytics/track` isteğini bulun.
5. Cevap kodunun `204` olduğunu doğrulayın.
6. Başka bir sayfaya geçip yeni bir `pageview` isteği oluştuğunu kontrol edin.

Sunucu loglarında:

```bash
journalctl -u oxymed-api -n 100 --no-pager | grep -E \
  'analytics/track|analytics/summary|statusCode|error'
```

PostgreSQL'de:

```bash
cd /var/www/oxymed
set -a
source .env
set +a

psql "$DATABASE_URL" -c "
  select event_type, count(*)
  from visitor_events
  group by event_type
  order by event_type;
"
```

`pageview` sayısı artıyorsa API ve veritabanı bağlantısı çalışıyordur. Admin paneli
hala boşsa giriş cookie'sini, tarayıcı Network sekmesindeki summary isteğini ve
API loglarını birlikte kontrol edin.

Çerez kabul edilmemiş ziyaretçiler için event yazılmaması beklenen davranıştır.
IP adresi veya kişisel bilgi analytics tablosunda saklanmaz.

---

## 11. Görsel URL'sini doğrulayın

Tarayıcı geliştirici araçlarında ana sayfadaki, ürün sayfasındaki ve haber
sayfasındaki bir görsel isteğini açın. Doğru format:

```text
https://www.oxymedmedical.com/api/storage/public-objects/objects/uploads/DOSYA_UUID
```

`replit.dev`, `replit.app` veya `public-objects//` görürseniz:

1. Web build'inin güncel kodla alındığını kontrol edin.
2. Tarayıcı cache'ini temizleyin veya gizli pencere açın.
3. `systemctl reload nginx` çalıştırın.
4. İsteği tekrar kontrol edin.

Veritabanında kayıtlı bir örnek medya URL'sini test etmek için:

```bash
MEDIA_PATH=$(psql "$DATABASE_URL" -Atc \
  "select object_path from media_files order by created_at desc limit 1")

if [ -z "$MEDIA_PATH" ]; then
  echo "Test edilecek medya kaydı bulunamadı"
else
  echo "Test yolu: /api/storage/public-objects$MEDIA_PATH"
  curl -sS -o /dev/null -w 'HTTP=%{http_code} Content-Type=%{content_type}\n' \
    "https://www.oxymedmedical.com/api/storage/public-objects${MEDIA_PATH}"
fi
```

Beklenen cevap `HTTP=200` ve gerçek bir görsel `Content-Type` değeridir.

Sonuçlar:

| Durum | Anlamı | Kontrol |
|---|---|---|
| `200` | Görsel başarıyla sunuluyor | Sorun yok |
| `404` | DB kaydı veya yerel dosya eksik | Bölüm 6'yı uygulayın |
| `400` | URL biçimi hatalı | UUID ve çift slash kontrolü |
| `502` | Nginx API'ye ulaşamıyor | API servisi ve port |
| `503` | API veya bağımlılık hazır değil | systemd logları |

---

## 12. Son kontrol listesi

| Kontrol | Beklenen sonuç |
|---|---|
| `systemctl is-active oxymed-api` | `active` |
| `curl .../api/healthz` | `200` ve `{"status":"ok"}` |
| `/api/products` | `200` veya `304`, dolu cevap |
| `/api/analytics/track` | Çerez onayından sonra `204` |
| `/api/analytics/summary` | Admin oturumuyla başarılı cevap |
| Medya URL'si | `/api/storage/public-objects/objects/uploads/UUID` |
| Medya endpoint'i | `200`, gerçek görsel Content-Type |
| Kaynak/dist taraması | Replit medya adresi yok |
| `systemctl is-active nginx` | `active` |

Bütün kontroller tamamlandıktan sonra eski API process'inin kalmadığını görmek
için:

```bash
systemctl restart oxymed-api
systemctl status oxymed-api --no-pager
```

Siteyi yeniden açın ve bir ürüne, habere ve admin dashboard'una ayrı ayrı gidin.

---

## Sorun devam ederse alınacak kayıtlar

Şu komutların çıktısını parola ve gizli değerleri silerek saklayın:

```bash
systemctl status oxymed-api --no-pager
systemctl status nginx --no-pager
journalctl -u oxymed-api -n 100 --no-pager
nginx -t
curl -sS -i http://127.0.0.1:5000/api/healthz
```

`DATABASE_URL`, `JWT_SECRET`, SMTP parolası, AI anahtarı veya session secret
çıktıya kesinlikle koymayın.