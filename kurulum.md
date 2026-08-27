# Oxymed Medikal — Kendi Sunucunuza Kurulum Rehberi

Bu rehber, siteyi Replit'ten alıp **kendi Ubuntu sunucunuza (VPS)** kurmanız için yazıldı.

Hiç Linux bilmediğinizi varsayıyoruz. Her komutu **kopyala–yapıştır** yapabilirsiniz.
Değiştirmeniz gereken yerler `BÜYÜK_HARFLE` yazıldı; sadece onları kendi bilgilerinizle
değiştirin.

---

## ⚠️ ÖNCE BUNU OKUYUN — Görseller sorunu

Bu en önemli uyarı. Atlamayın.

Sitenin ürün, slider ve haber görselleri şu anda **Replit'in kendi dosya deposunda**
(object storage) duruyor. Veritabanında görsel adresleri şöyle kayıtlı:

```
/api/storage/public-objects/objects/uploads/d3ce89b5-...
```

Bu adresler çalışırken sunucu, Replit'in içinde çalışan özel bir yardımcı servise
(`127.0.0.1:1106`) soruyor: "bu dosyayı bana ver." **Bu yardımcı servis sadece Replit'te
vardır.** Kendi sunucunuzda yoktur ve kurulamaz.

**Sonuç:** Siteyi olduğu gibi kendi sunucunuza taşırsanız:

- ❌ Ürün, slider ve haber görselleri **görünmez** (kırık resim çıkar)
- ❌ Admin panelinden **yeni görsel yükleyemezsiniz**
- ❌ Katalog ve sertifika PDF'leri **açılmaz**
- ✅ Yazılar, menüler, diller, teklif formu, admin paneli, veritabanı — hepsi çalışır

`src/assets/` klasöründeki sabit görseller (örneğin `cerrahi-pendant-hero.jpg`) etkilenmez,
onlar kodun içinde gelir ve sorunsuz çalışır.

### Üç seçeneğiniz var

| Seçenek | Ne yapmanız gerekir | Zorluk |
|---|---|---|
| **1. Replit'te kalmak** | Hiçbir şey. Site zaten çalışıyor. | Kolay |
| **2. Google Cloud Storage hesabı açmak** | Google Cloud'da bir "bucket" ve "service account" oluşturup anahtar dosyasını sunucuya koymak; bir yazılımcının `objectStorage.ts` dosyasını bu anahtarı kullanacak şekilde 1–2 saatlik düzenlemesi | Orta |
| **3. Görselleri sunucunun kendi diskinde tutmak** | Bir yazılımcının `objectStorage.ts` dosyasını "dosyaları `/var/www/oxymed/uploads` klasörüne yaz" diyecek şekilde yeniden yazması + mevcut görselleri Replit'ten indirip oraya kopyalaması | Orta |

Bu rehber, **görseller dışındaki her şeyin** kurulumunu anlatır. Kuruluma başlamadan önce
yukarıdaki seçeneklerden birine karar verin. Kararsızsanız: önce bu rehberle kurun, site
görselsiz de olsa ayağa kalksın, görselleri sonra çözün.

---

## Neye ihtiyacınız var?

Kuruluma başlamadan önce elinizde şunlar olmalı:

1. **Bir Ubuntu sunucu (VPS)**
   - Ubuntu **22.04** veya **24.04** sürümü
   - En az **2 GB RAM** (site derlenirken RAM harcar; 1 GB'ta derleme çöker)
   - En az **20 GB** disk
   - Sunucunun **IP adresi**, **kullanıcı adı** (genelde `root`) ve **parolası**
   - Türkiye'den satın alabileceğiniz yerler: Hetzner, DigitalOcean, Contabo, Natro, Turhost

2. **Alan adınız: `oxymedmedical.com`**
   - Alan adı panelinize girip DNS ayarlarında iki kayıt açacaksınız (aşağıda anlatılıyor)

3. **Bilgisayarınızda bir "terminal" programı**
   - **Windows:** Başlat > `PowerShell` yazın, açın. (Windows 10 ve üstünde SSH hazır gelir.)
   - **Mac:** Spotlight (⌘+Boşluk) > `Terminal` yazın, açın.

4. **Sabır.** Kurulum ilk seferde 45–90 dakika sürer. Acele etmeyin.

---

## Sunucuya nasıl bağlanılır?

Terminal'i açın ve şunu yazın (`SUNUCU_IP` yerine kendi IP adresinizi yazın):

```bash
ssh root@SUNUCU_IP
```

İlk bağlantıda şöyle bir soru gelir:

```
The authenticity of host '...' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

`yes` yazıp Enter'a basın. Sonra parolanızı isteyecek.

> **Not:** Parolayı yazarken ekranda **hiçbir şey görünmez** — yıldız bile çıkmaz. Bu
> normaldir. Parolayı yazıp Enter'a basın.

Bağlandığınızda ekranda şuna benzer bir satır görürsünüz:

```
root@sunucum:~#
```

Artık komutları buraya yazacaksınız. **Bu rehberde "sunucuda çalıştırın" dediğim her komut
buraya yazılacak.**

---

# BÖLÜM 1 — Sunucuyu hazırlama

> Bu bölüm her iki kurulum yolu (GitHub veya FileZilla) için **ortaktır**. Mutlaka yapın.

## 1.1 Sistemi güncelle

```bash
apt update && apt upgrade -y
```

Bu birkaç dakika sürer. Ekranda mor bir pencere çıkıp "hangi servisler yeniden başlatılsın"
diye sorarsa, Tab tuşuyla `<Ok>` seçeneğine gelip Enter'a basın.

## 1.2 Temel araçları kur

```bash
apt install -y curl git unzip nginx ufw
```

## 1.3 Node.js 24 kur

Site Node.js sürüm 24 ile yazıldı. Ubuntu'nun kendi deposunda eski sürüm var, bu yüzden
resmi kaynaktan kuracağız:

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs
```

Kurulumu doğrulayın:

```bash
node -v
```

Ekranda `v24.` ile başlayan bir şey görmelisiniz (örn. `v24.13.0`). Görmüyorsanız devam
etmeyin, yukarıdaki iki komutu tekrar çalıştırın.

## 1.4 pnpm kur

Bu proje `npm` değil **`pnpm`** kullanır. Başka bir şey kullanırsanız kurulum hata verir.

```bash
npm install -g pnpm@10
pnpm -v
```

`10.` ile başlayan bir sürüm görmelisiniz.

## 1.5 PostgreSQL 16 veritabanını kur

Replit'te **PostgreSQL 16** kullanılıyor. Sunucunuza da aynı sürümü kurmalısınız — daha eski
bir sürüme (Ubuntu 22.04 varsayılan olarak 14 getirir) Replit'ten aldığınız yedeği geri
yükleyemezsiniz.

Bu yüzden PostgreSQL'in kendi resmi deposunu ekliyoruz:

```bash
apt install -y ca-certificates gnupg lsb-release
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
  -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-16 postgresql-client-16
systemctl enable --now postgresql
```

Sürümü doğrulayın:

```bash
psql --version
```

`psql (PostgreSQL) 16.` ile başlayan bir satır görmelisiniz.

Şimdi site için bir veritabanı ve kullanıcı oluşturalım. Önce PostgreSQL'e girin:

```bash
sudo -u postgres psql
```

Komut satırı `postgres=#` şekline dönüşecek. Şimdi aşağıdaki üç satırı **tek tek** yapıştırın.
`GUCLU_BIR_PAROLA_YAZIN` yerine kendi belirlediğiniz parolayı yazın ve **bir yere not edin**
— birazdan lazım olacak:

```sql
CREATE DATABASE oxymed;
CREATE USER oxymed WITH ENCRYPTED PASSWORD 'GUCLU_BIR_PAROLA_YAZIN';
GRANT ALL PRIVILEGES ON DATABASE oxymed TO oxymed;
ALTER DATABASE oxymed OWNER TO oxymed;
\q
```

> **Parola seçerken:** İçinde `@ : / ? # [ ] %` karakterleri **olmasın**. Bu karakterler
> bağlantı adresini bozar. Sadece harf, rakam ve `-` `_` kullanın. En az 16 karakter olsun.

`\q` yazınca normal komut satırına dönersiniz.

## 1.6 PDF üretimi için tarayıcı kur

Site, teklif ve servis raporlarını PDF'e çevirirken arka planda görünmeyen bir Chrome
tarayıcısı çalıştırır. Onu kuralım:

```bash
curl -fsSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o /tmp/chrome.deb
apt install -y /tmp/chrome.deb
rm /tmp/chrome.deb
google-chrome-stable --version
```

Sürüm numarası görüyorsanız tamam. Kurulan yol: `/usr/bin/google-chrome-stable` — bunu
birazdan ayar dosyasına yazacağız.

> **Neden Google Chrome, neden `chromium` değil?** Ubuntu'da `chromium` paketi "snap"
> denilen bir kutunun içinde gelir ve arka planda PDF üretmeye çalışınca çalışmaz. Google
> Chrome normal bir program olarak kurulur ve sorunsuz çalışır.

## 1.7 Güvenlik duvarını aç

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status
```

Listede `OpenSSH` ve `Nginx Full` satırlarını görmelisiniz.

## 1.8 Alan adını sunucuya yönlendirin

Şimdi bilgisayarınızda alan adı panelinize (`oxymedmedical.com`'u aldığınız firma) girin ve
DNS ayarlarına şu iki kaydı ekleyin:

| Tip | Ad / Host | Değer | TTL |
|---|---|---|---|
| A | `@` | `SUNUCU_IP` | 3600 |
| A | `www` | `SUNUCU_IP` | 3600 |

Zaten varsa, değerlerini yeni sunucu IP'sine güncelleyin.

DNS değişikliğinin yayılması **15 dakika ile 24 saat** arası sürebilir. Yayılıp yayılmadığını
sunucuda şu komutla kontrol edebilirsiniz:

```bash
apt install -y dnsutils
dig +short www.oxymedmedical.com
```

Kendi sunucu IP'nizi görüyorsanız yayılmış demektir. **Bölüm 8'e (HTTPS) geçmeden önce bunun
tamamlanmış olması gerekir.** O zamana kadar diğer bölümlerle devam edebilirsiniz.

---

# BÖLÜM 2 — Proje dosyalarını sunucuya taşıma

Burada **iki yol** var. İkisinden **sadece birini** seçin.

| | **YOL A — GitHub** | **YOL B — ZIP + FileZilla** |
|---|---|---|
| Kurulum zorluğu | Biraz daha fazla adım | Daha az adım |
| İleride güncelleme | Çok kolay (`git pull`) | Zahmetli (her seferinde ZIP indir + yükle) |
| GitHub hesabı gerekir mi | Evet (ücretsiz) | Hayır |
| **Tavsiyem** | ✅ **Bunu seçin** | Sadece GitHub istemiyorsanız |

---

## YOL A — GitHub üzerinden (tavsiye edilen)

### A.1 Replit'te projeyi GitHub'a bağlayın

1. Replit'te projenizi açın.
2. Sol taraftaki araç çubuğunda **Git** simgesine tıklayın (dallanan yol gibi görünen ikon).
   Bulamazsanız: sol altta **Tools** > **Git**.
3. **Create a Git repository** düğmesine tıklayın.
4. **Connect to GitHub** deyin. GitHub hesabınız yoksa açılan sayfadan ücretsiz açın.
5. Replit'in GitHub hesabınıza erişmesine izin verin.
6. Depo (repository) adı olarak `oxymed-medikal` yazın.
7. **Private** (özel) seçeneğini işaretleyin — kodunuz herkese açık olmasın.
8. **Create repository** deyin.
9. Ardından **Commit & Push** düğmesiyle tüm dosyaları GitHub'a gönderin.

Artık kodunuz `https://github.com/KULLANICI_ADINIZ/oxymed-medikal` adresinde.

### A.2 Sunucunun GitHub'a erişmesini sağlayın

Depo "private" olduğu için sunucunun kimliğini kanıtlaması gerekir. Bunun en kolay yolu bir
**deploy key** (dağıtım anahtarı) oluşturmaktır.

Sunucuda çalıştırın:

```bash
ssh-keygen -t ed25519 -C "oxymed-vps" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Son komut `ssh-ed25519 AAAA...` diye başlayan **tek satırlık** bir metin yazdırır. Bu satırın
**tamamını** kopyalayın.

Şimdi tarayıcınızda:

1. `https://github.com/KULLANICI_ADINIZ/oxymed-medikal` adresine gidin
2. Üstteki **Settings** sekmesine tıklayın
3. Sol menüden **Deploy keys** > **Add deploy key**
4. **Title:** `VPS Sunucu`
5. **Key:** kopyaladığınız satırı yapıştırın
6. **Allow write access** kutusunu **işaretlemeyin** (sunucunun sadece okuması yeterli)
7. **Add key** deyin

### A.3 Projeyi sunucuya indirin

```bash
mkdir -p /var/www
cd /var/www
git clone git@github.com:KULLANICI_ADINIZ/oxymed-medikal.git oxymed
```

İlk bağlantıda `Are you sure you want to continue connecting?` sorusuna `yes` deyin.

İndirme bitince kontrol edin:

```bash
cd /var/www/oxymed
ls
```

`artifacts`, `lib`, `scripts`, `package.json` gibi isimleri görmelisiniz. Görüyorsanız
**Bölüm 3'e geçin.**

---

## YOL B — ZIP indirip FileZilla ile yükleme

### B.1 Replit'ten ZIP indirin

1. Replit'te projenizi açın.
2. Sol üstteki **üç nokta (⋮)** menüsüne tıklayın.
3. **Download as zip** seçeneğine tıklayın.
4. Dosya bilgisayarınıza inecek (genelde `İndirilenler` klasörüne), adı
   `workspace.zip` veya benzeri olacak. **Boyutu birkaç yüz MB olabilir**, sabredin.

> **Not:** İndirilen ZIP'in içinde `node_modules` klasörü **yoktur** — olmaması da doğrudur.
> O klasörü sunucuda ayrıca kuracağız (Bölüm 4).

### B.2 FileZilla'yı kurun

1. `https://filezilla-project.org/download.php?type=client` adresine gidin
2. **Download FileZilla Client** deyin, kurun
3. Kurulum sırasında ek program teklif ederse (`WinZip`, tarayıcı eklentisi vb.) hepsini
   **reddedin**

### B.3 FileZilla ile sunucuya bağlanın

FileZilla'yı açın. Üstteki hızlı bağlantı çubuğuna şunları yazın:

| Alan | Ne yazacaksınız |
|---|---|
| **Sunucu (Host)** | `sftp://SUNUCU_IP` |
| **Kullanıcı adı** | `root` |
| **Parola** | sunucu parolanız |
| **Port** | `22` |

**Hızlı Bağlan (Quickconnect)** düğmesine basın.

> `sftp://` önekini yazmayı unutmayın. Yazmazsanız FileZilla şifrelenmemiş FTP ile bağlanmaya
> çalışır ve bağlanamaz.

Bağlantı kurulunca ekran ikiye bölünür:
- **Sol taraf** = sizin bilgisayarınız
- **Sağ taraf** = sunucu

Bilinmeyen sunucu anahtarı uyarısı çıkarsa **Tamam / OK** deyin.

### B.4 Sunucuda klasörü hazırlayın

Terminal'e (SSH penceresi) dönün ve:

```bash
mkdir -p /var/www/oxymed
```

### B.5 ZIP'i yükleyin

1. FileZilla'nın **sağ** panelinde adres kutusuna `/var/www/oxymed` yazıp Enter'a basın
2. FileZilla'nın **sol** panelinde ZIP dosyanızın olduğu klasöre gidin (`İndirilenler`)
3. ZIP dosyasının üzerine **sağ tıklayın** > **Karşıya Yükle (Upload)**
4. Alt taraftaki listeden yüklemenin ilerlemesini izleyin

> Yükleme internet hızınıza göre **5–60 dakika** sürebilir. FileZilla penceresini kapatmayın.
> Bağlantı koparsa FileZilla genelde kaldığı yerden devam eder; etmezse baştan yükleyin.

### B.6 ZIP'i sunucuda açın

Terminal'e dönün:

```bash
cd /var/www/oxymed
ls
```

ZIP dosyanızın adını göreceksiniz (örn. `workspace.zip`). Şimdi açın — **DOSYA_ADI** yerine
gördüğünüz gerçek adı yazın:

```bash
unzip DOSYA_ADI.zip
ls
```

Şimdi iki ihtimal var:

**İhtimal 1:** `artifacts`, `lib`, `scripts`, `package.json` gibi isimleri **doğrudan**
görüyorsunuz. Harika, bir şey yapmanıza gerek yok.

**İhtimal 2:** Tek bir klasör görüyorsunuz (örn. `workspace`). O zaman içindekileri bir üst
seviyeye taşıyın:

```bash
mv workspace/* workspace/.[!.]* . 2>/dev/null
rmdir workspace
ls
```

Şimdi `artifacts`, `lib`, `scripts`, `package.json` görmelisiniz.

Son olarak ZIP dosyasını silin, yer kaplamasın:

```bash
rm -f /var/www/oxymed/*.zip
```

---

# BÖLÜM 3 — Ayar dosyasını (.env) oluşturma

Site, parola ve adres gibi bilgileri koddan ayrı bir dosyada tutar. Bu dosyayı biz
oluşturacağız.

Sunucuda çalıştırın:

```bash
nano /var/www/oxymed/.env
```

Boş bir yazı editörü açılır. Aşağıdaki metnin **tamamını** kopyalayıp yapıştırın:

> **Yapıştırma nasıl yapılır?** Windows PowerShell'de **sağ tık** yeterlidir.
> Mac Terminal'de **⌘+V**. `Ctrl+V` çalışmaz.

```
# ─── ZORUNLU ──────────────────────────────────────────────────────────────

# API sunucusunun dinleyeceği port. Değiştirmeyin.
PORT=5000

# Veritabanı bağlantısı. Parolayı Bölüm 1.5'te belirlediğinizle değiştirin.
DATABASE_URL=postgresql://oxymed:GUCLU_BIR_PAROLA_YAZIN@localhost:5432/oxymed

# Admin girişlerini imzalayan gizli anahtar.
# AŞAĞIDAKİ SATIRI OLDUĞU GİBİ BIRAKMAYIN — Bölüm 3.1'de üreteceğiz.
JWT_SECRET=BURAYI_DEGISTIRECEGIZ

# Sitenin adresi. Sonunda / olmayacak.
SITE_ORIGIN=https://www.oxymedmedical.com
VITE_SITE_ORIGIN=https://www.oxymedmedical.com

# Tarayıcıdan API'ye hangi adreslerin erişebileceği.
ALLOWED_ORIGINS=https://www.oxymedmedical.com,https://oxymedmedical.com

# PDF üretmek için kullanılacak tarayıcı.
CHROMIUM_PATH=/usr/bin/google-chrome-stable

# Üretim modu.
NODE_ENV=production

# ─── GÖRSEL DEPOLAMA (Replit dışında çalışmaz — en üstteki uyarıya bakın) ──
PUBLIC_OBJECT_SEARCH_PATHS=/oxymed/public
PRIVATE_OBJECT_DIR=/oxymed/private

# ─── E-POSTA (teklif ve iletişim formları için) ───────────────────────────
# Bu bilgileri hosting/e-posta sağlayıcınızdan alın.
SMTP_HOST=mail.oxymedmedical.com
SMTP_PORT=465
SMTP_USER=noreply@oxymedmedical.com
SMTP_PASS=EPOSTA_PAROLANIZ
SMTP_FROM=noreply@oxymedmedical.com

# ─── YAPAY ZEKA ÇEVİRİ (admin panelindeki "AI ile çevir" düğmeleri) ───────
# Replit'in AI servisi sadece Replit içinde çalışır. Kendi sunucunuzda bu
# özelliği kullanmak için OpenAI'dan kendi API anahtarınızı almanız gerekir.
# Anahtarınız yoksa bu iki satırı silin — site çalışır, sadece "AI ile çevir"
# düğmeleri hata verir.
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=

# ─── İSTEĞE BAĞLI ─────────────────────────────────────────────────────────
LOG_LEVEL=info
VISITOR_EVENTS_RETENTION_DAYS=90
```

Kaydetmek için: **`Ctrl+O`** > **Enter** > **`Ctrl+X`**

## 3.1 JWT_SECRET'i üretin

Bu, admin oturumlarını koruyan gizli anahtardır. Rastgele bir tane üretelim:

```bash
openssl rand -base64 48
```

Ekranda uzun, karışık bir metin çıkar (örn. `xK9m2Pq...==`). Bunu kopyalayın.

Sonra dosyayı tekrar açın:

```bash
nano /var/www/oxymed/.env
```

`JWT_SECRET=BURAYI_DEGISTIRECEGIZ` satırını bulun, `BURAYI_DEGISTIRECEGIZ` kısmını silip
kopyaladığınız metni yapıştırın. Sonuç şöyle görünmeli:

```
JWT_SECRET=xK9m2Pq7vN3wR8tY5uI1oP4aS6dF9gH2jK5lZ0xC3vB7nM1qW4eR8tY==
```

**`Ctrl+O`** > **Enter** > **`Ctrl+X`** ile kaydedin.

> ⚠️ Bu anahtarı **kimseyle paylaşmayın**. Bir yere not alın; değiştirirseniz tüm admin
> kullanıcıları oturumdan düşer (yeniden giriş yaparlar, veri kaybı olmaz).

## 3.2 Dosyayı koruyun

```bash
chmod 600 /var/www/oxymed/.env
```

Bu, `.env` dosyasını sadece `root` kullanıcısının okuyabilmesini sağlar.

---

# BÖLÜM 4 — Programları kurma ve veritabanını hazırlama

## 4.1 Proje bağımlılıklarını kurun

```bash
cd /var/www/oxymed
pnpm install
```

Bu adım **5–15 dakika** sürer ve ekranda çok satır akar. Sonunda şöyle bir özet görürsünüz:

```
Done in 8m 32s
```

> **`ERR_PNPM_...` hatası alırsanız:** `rm -rf node_modules` yazıp komutu tekrar deneyin.
>
> **Sunucu donarsa / komut "Killed" diyip kesilirse:** RAM yetmemiştir. Bölüm 11'deki
> "Takas alanı (swap) ekleme" adımını uygulayıp tekrar deneyin.

## 4.2 Veritabanını doldurun

Şu anda veritabanı **bomboş** — tek bir tablo bile yok. Doldurmanın iki yolu var. Sitenizde
zaten ürünler, haberler ve çeviriler olduğu için neredeyse kesinlikle **Yol 1**'i
istiyorsunuz.

> **Aşağıdaki komutlarda geçen `set -a; source .env; set +a` satırı ne yapıyor?**
> `.env` dosyasındaki ayarları o anki komut satırına yüklüyor. Her yeni SSH oturumunda bir
> kez çalıştırmanız gerekir. Bağlantınız koparsa tekrar çalıştırın.

---

### Yol 1 — Replit'teki mevcut verilerinizi taşıyın (tavsiye edilen)

**Adım 1 — Replit'te yedek alın.**

Replit'te projenizi açın, alttaki **Shell** sekmesine tıklayın ve şunu yazın:

```bash
pg_dump "$DATABASE_URL" --no-owner --no-privileges -f /home/runner/workspace/oxymed-yedek.sql
```

Birkaç saniye sürer. Hiçbir çıktı vermezse başarılı demektir.

**Adım 2 — Yedeği bilgisayarınıza indirin.**

Replit'in sol tarafındaki dosya listesinde `oxymed-yedek.sql` dosyasını bulun, üzerine sağ
tıklayın > **Download**.

**Adım 3 — Sunucuya yükleyin.**

FileZilla ile bağlanın, sol panelden `oxymed-yedek.sql` dosyasını bulun, sağ paneli
`/var/www/oxymed` yapın ve dosyayı yükleyin.

> GitHub yolunu (Yol A) kullandıysanız ve FileZilla kurmadıysanız, **bilgisayarınızın**
> terminalinde şu komutla da yükleyebilirsiniz:
> ```bash
> scp oxymed-yedek.sql root@SUNUCU_IP:/var/www/oxymed/
> ```

**Adım 4 — Sunucuda geri yükleyin.**

```bash
cd /var/www/oxymed
set -a; source .env; set +a
psql "$DATABASE_URL" -v ON_ERROR_STOP=0 -f oxymed-yedek.sql
```

Yedek dosyası hem tabloları hem de içindeki verileri oluşturur. Ekranda `CREATE TABLE`,
`COPY 15`, `ALTER TABLE` gibi satırlar akar.

**Adım 5 — Şemayı kodla eşitleyin.**

Yedeği aldığınızdan beri kodda yeni bir alan eklenmiş olabilir. Bunu garantiye alalım:

```bash
pnpm --filter @workspace/db run push
```

Komut ne yapacağını gösterip onay isteyebilir — ok tuşlarıyla
`Yes, I want to execute all statements` seçeneğini seçip Enter'a basın.
`No changes detected` veya `Changes applied` görürseniz tamamdır.

**Adım 6 — Kontrol edin ve yedeği silin.**

```bash
psql "$DATABASE_URL" -c "select count(*) from products;"
psql "$DATABASE_URL" -c "select count(*) from news;"
rm oxymed-yedek.sql
```

Gerçek sayılarınızı görüyorsanız veriler taşınmıştır.

---

### Yol 2 — Sıfırdan örnek verilerle başlayın

Mevcut verilerinizi taşımak istemiyorsanız, önce tabloları oluşturun:

```bash
cd /var/www/oxymed
set -a; source .env; set +a
pnpm --filter @workspace/db run push
```

Onay isterse `Yes, I want to execute all statements` seçin. `Changes applied` görmelisiniz.

Sonra örnek verileri yükleyin:

```bash
pnpm --filter @workspace/scripts run seed
```

Bu, örnek ürünler ve **varsayılan bir admin kullanıcısı** oluşturur. Kullanıcı adı ve parola
komutun çıktısında yazar.

> 🔴 **Bu yolu seçtiyseniz, siteyi açar açmaz admin parolasını değiştirin.** Varsayılan
> parola bu rehberi okuyan herkesin görebileceği bir paroladır.

---

# BÖLÜM 5 — Siteyi derleme (build)

Şimdi kodu tarayıcının anlayacağı hale getireceğiz. İki parça var: **API sunucusu** ve
**web sitesi**.

```bash
cd /var/www/oxymed
set -a; source .env; set +a

# 1) API sunucusunu derle
pnpm --filter @workspace/api-server run build

# 2) Web sitesini derle
PORT=5199 BASE_PATH=/ pnpm --filter @workspace/oxymed-medikal run build
```

> **`PORT=5199 BASE_PATH=/` neden var?** Derleme aracı (Vite) bu iki ayar olmadan çalışmayı
> reddediyor. `5199` sadece derleme sırasında kullanılan bir sayı, gerçek sunucu portuyla
> ilgisi yok. `BASE_PATH=/` ise sitenin alan adının kökünde (`/`) yayınlanacağını söylüyor.

İkinci komut **3–10 dakika** sürer. Sırayla şunları yapar:

1. Veritabanından ürün ve haberleri okuyup `sitemap.xml` üretir
2. Tüm React kodunu tarayıcı dosyalarına çevirir
3. **172 sayfayı** hazır HTML olarak üretir (Google'ın siteyi okuyabilmesi için — SEO'nun
   temeli budur)
4. Üretilen sayfaların SEO etiketlerini doğrular

Sonunda şuna benzer bir satır görmelisiniz:

```
✓ verified 172 pages
```

Kontrol edin:

```bash
ls /var/www/oxymed/artifacts/oxymed-medikal/dist/public
```

`index.html`, `assets`, `en`, `de`, `sitemap.xml`, `robots.txt` gibi isimler görmelisiniz.

> **Derleme "Killed" diyip kesilirse:** RAM yetmedi. Bölüm 11'deki "Takas alanı (swap)
> ekleme" adımını uygulayın ve tekrar deneyin.
>
> **`DATABASE_URL is not set` hatası:** `set -a; source .env; set +a` satırını çalıştırmayı
> unuttunuz. Çalıştırıp tekrar deneyin.

---

# BÖLÜM 6 — API sunucusunu sürekli çalışır hale getirme

API sunucusu sürekli açık kalmalı — siz SSH'tan çıksanız bile, sunucu yeniden başlasa bile.
Bunu Ubuntu'nun `systemd` sistemiyle yapacağız.

## 6.1 Servis dosyasını oluşturun

```bash
nano /etc/systemd/system/oxymed-api.service
```

Şunu yapıştırın (**hiçbir yerini değiştirmenize gerek yok**):

```ini
[Unit]
Description=Oxymed API Server
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/oxymed/artifacts/api-server
EnvironmentFile=/var/www/oxymed/.env
ExecStart=/usr/bin/node --enable-source-maps /var/www/oxymed/artifacts/api-server/dist/index.mjs
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**`Ctrl+O`** > **Enter** > **`Ctrl+X`** ile kaydedin.

## 6.2 Servisi başlatın

```bash
systemctl daemon-reload
systemctl enable --now oxymed-api
systemctl status oxymed-api
```

Yeşil renkte **`active (running)`** yazısını görmelisiniz. `q` tuşuyla çıkın.

## 6.3 Gerçekten çalışıyor mu?

```bash
curl http://localhost:5000/api/healthz
```

Şu cevabı görmelisiniz:

```json
{"status":"ok"}
```

Hiçbir şey görmüyorsanız veya `Connection refused` diyorsa:

```bash
journalctl -u oxymed-api -n 50 --no-pager
```

Son 50 satır kaydı gösterir. Hata mesajını orada bulursunuz — en sık sebepler Bölüm 11'de.

---

# BÖLÜM 7 — nginx yapılandırması (siteyi dünyaya açma)

nginx, dışarıdan gelen ziyaretçileri karşılayan kapı görevlisidir. İki iş yapacak:

- `/api/...` ile başlayan istekleri → API sunucusuna (port 5000) iletecek
- Diğer her şeyi → derlenmiş HTML dosyalarından servis edecek

## 7.1 Ayar dosyasını oluşturun

```bash
nano /etc/nginx/sites-available/oxymed
```

Şunu yapıştırın:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name oxymedmedical.com www.oxymedmedical.com;

    root /var/www/oxymed/artifacts/oxymed-medikal/dist/public;
    index index.html;

    # Yüklenen dosyalar için sınır (görsel/PDF yükleme)
    client_max_body_size 25M;

    # Sıkıştırma — sayfalar daha hızlı açılır
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml application/json application/javascript
               application/xml+rss image/svg+xml;

    # API isteklerini API sunucusuna ilet
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # Kod ve görsel dosyaları uzun süre önbellekte tut
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # sitemap ve robots her zaman taze olsun
    location = /sitemap.xml { add_header Cache-Control "no-cache"; }
    location = /robots.txt  { add_header Cache-Control "no-cache"; }

    # Sayfa isteklerini karşıla:
    # önce hazır HTML dosyasını ara, yoksa klasörün index.html'ini,
    # o da yoksa ana index.html'e düş (React yönlendirmesi devralır)
    location / {
        try_files $uri $uri/index.html $uri.html /index.html;
    }
}
```

**`Ctrl+O`** > **Enter** > **`Ctrl+X`** ile kaydedin.

## 7.2 Ayarı devreye alın

```bash
ln -sf /etc/nginx/sites-available/oxymed /etc/nginx/sites-enabled/oxymed
rm -f /etc/nginx/sites-enabled/default
nginx -t
```

`syntax is ok` ve `test is successful` görmelisiniz. Görüyorsanız:

```bash
systemctl reload nginx
```

## 7.3 Test edin

Tarayıcınızda `http://oxymedmedical.com` adresine gidin. Site açılmalı.

> **Henüz DNS yayılmadıysa** IP adresiyle de deneyebilirsiniz: `http://SUNUCU_IP`
> (Bu durumda `server_name` eşleşmediği için nginx yine de bu siteyi gösterir, çünkü tek
> site var.)

> ⚠️ Site açıldı ama **admin paneline giriş yapamıyorsanız** bu normaldir. Giriş çerezi
> güvenlik gereği sadece **HTTPS** üzerinden çalışır. Bölüm 8'i tamamlayınca düzelecek.

---

# BÖLÜM 8 — HTTPS (yeşil kilit) ve www yönlendirmesi

Bu bölüm **zorunludur**, isteğe bağlı değil:

- Admin girişi HTTPS olmadan **çalışmaz** (oturum çerezi `secure` işaretli)
- Google, HTTPS olmayan siteleri sıralamada geriye atar
- Tarayıcılar "Güvenli değil" uyarısı gösterir

> **Devam etmeden önce:** DNS kayıtlarınızın yayılmış olması gerekir. Bölüm 1.8'deki
> `dig +short www.oxymedmedical.com` komutuyla kontrol edin. Sunucu IP'nizi görmüyorsanız
> bekleyin — bu adım DNS olmadan başarısız olur.

## 8.1 Certbot'u kurun ve sertifika alın

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d oxymedmedical.com -d www.oxymedmedical.com
```

Certbot size sırayla soracak:

1. **E-posta adresi** — sertifikanın süresi dolmak üzereyken uyarı gönderir. Gerçek
   adresinizi yazın.
2. **Şartları kabul (A/C)** — `A` yazın
3. **E-posta listesine katılmak ister misiniz (Y/N)** — `N` yazabilirsiniz
4. **HTTP'yi HTTPS'e yönlendirelim mi** — **`2`** seçin (yönlendir)

Sonunda `Congratulations!` görürseniz sertifika hazır.

Sertifika **90 günde bir otomatik yenilenir**. Kontrol etmek isterseniz:

```bash
systemctl status certbot.timer
```

## 8.2 www / www-suz karışıklığını çözün

Bu, **SEO için kritik** bir adımdır.

Şu anda hem `oxymedmedical.com` hem `www.oxymedmedical.com` aynı sayfaları gösteriyor.
Google bunu "aynı içerik iki farklı adreste" (duplicate content) olarak görür ve sıralama
gücünüzü ikiye böler.

Sitenin canonical (asıl) adresi **`https://www.oxymedmedical.com`** olarak ayarlı. O halde
`www` olmayan adresi `www`'ye yönlendirmeliyiz.

```bash
nano /etc/nginx/sites-available/oxymed
```

Dosyanın **en başına** (mevcut `server {` bloğunun üstüne) şu bloğu ekleyin:

```nginx
# www olmayan adresi www'ye kalıcı olarak yönlendir (SEO için gerekli)
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name oxymedmedical.com;

    ssl_certificate     /etc/letsencrypt/live/oxymedmedical.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/oxymedmedical.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://www.oxymedmedical.com$request_uri;
}
```

Sonra dosyada aşağı inin. Certbot'un eklediği `listen 443 ssl;` satırlarını içeren asıl
bloğu bulun ve onun `server_name` satırını şöyle değiştirin — sadece `www` kalsın:

```nginx
    server_name www.oxymedmedical.com;
```

**`Ctrl+O`** > **Enter** > **`Ctrl+X`** ile kaydedin, sonra:

```bash
nginx -t && systemctl reload nginx
```

## 8.3 Yönlendirmeyi doğrulayın

```bash
curl -sI https://oxymedmedical.com | head -3
```

Şunu görmelisiniz:

```
HTTP/1.1 301 Moved Permanently
location: https://www.oxymedmedical.com/
```

`301` ve `www`'li adres görüyorsanız doğru yapılandırdınız.

---

# BÖLÜM 9 — Kurulum kontrol listesi

Sırayla test edin. Her maddeyi işaretleyin:

| # | Test | Beklenen sonuç |
|---|---|---|
| 1 | `https://www.oxymedmedical.com` açılıyor mu? | Ana sayfa, yeşil kilit ile |
| 2 | `https://oxymedmedical.com` yazınca | Otomatik `www`'ye gidiyor |
| 3 | `https://www.oxymedmedical.com/en` | İngilizce sayfa açılıyor |
| 4 | `https://www.oxymedmedical.com/de/produkte` | Almanca ürünler sayfası |
| 5 | `https://www.oxymedmedical.com/sitemap.xml` | XML listesi görünüyor |
| 6 | `https://www.oxymedmedical.com/robots.txt` | Metin görünüyor |
| 7 | `https://www.oxymedmedical.com/admin/login` | Giriş ekranı açılıyor |
| 8 | Admin'e giriş yapabiliyor musunuz? | Panel açılıyor |
| 9 | Teklif formunu doldurup gönderin | E-posta geliyor |
| 10 | Görseller görünüyor mu? | ⚠️ En üstteki uyarıya bakın — muhtemelen **hayır** |

Sunucu tarafı kontroller:

```bash
systemctl status oxymed-api    # active (running) olmalı
systemctl status nginx         # active (running) olmalı
systemctl status postgresql    # active (running) olmalı
```

Sunucuyu yeniden başlatıp her şeyin kendiliğinden ayağa kalktığını doğrulayın:

```bash
reboot
```

2–3 dakika bekleyip tekrar SSH ile bağlanın ve siteyi açın. Çalışıyorsa kurulum tamamdır.

---

# BÖLÜM 10 — İleride nasıl güncelleme yaparsınız?

Replit'te bir değişiklik yaptığınızda, o değişikliği sunucuya taşımanız gerekir.

## GitHub yolunu kullandıysanız (Yol A)

**Replit'te:** Git panelinden **Commit & Push** yapın.

**Sunucuda:**

```bash
cd /var/www/oxymed
git pull
set -a; source .env; set +a
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run build
PORT=5199 BASE_PATH=/ pnpm --filter @workspace/oxymed-medikal run build
systemctl restart oxymed-api
```

Bu altı komutu bir dosyaya koyup tek komutla çalıştırabilirsiniz:

```bash
cat > /root/guncelle.sh <<'EOF'
#!/bin/bash
set -e
cd /var/www/oxymed
echo "→ Kod indiriliyor..."
git pull
set -a; source .env; set +a
echo "→ Paketler kuruluyor..."
pnpm install
echo "→ Veritabanı güncelleniyor..."
pnpm --filter @workspace/db run push
echo "→ API derleniyor..."
pnpm --filter @workspace/api-server run build
echo "→ Site derleniyor..."
PORT=5199 BASE_PATH=/ pnpm --filter @workspace/oxymed-medikal run build
echo "→ Servis yeniden başlatılıyor..."
systemctl restart oxymed-api
echo "✅ Güncelleme tamamlandı."
EOF
chmod +x /root/guncelle.sh
```

Bundan sonra güncelleme için tek komut yeter:

```bash
/root/guncelle.sh
```

## ZIP yolunu kullandıysanız (Yol B)

Her güncellemede Bölüm B.1–B.6'yı tekrarlamanız gerekir: yeni ZIP indir, FileZilla ile yükle,
aç. Sonra sırasıyla:

```bash
cd /var/www/oxymed
set -a; source .env; set +a
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run build
PORT=5199 BASE_PATH=/ pnpm --filter @workspace/oxymed-medikal run build
systemctl restart oxymed-api
```

> **Veritabanını tekrar geri yüklemeyin.** Veritabanı sunucuda duruyor, ZIP'in içinde
> gelmiyor. Bölüm 4.2'yi sadece **ilk kurulumda** yaparsınız.

**Önemli:** Yeni ZIP'i açmadan önce `.env` dosyanızı yedekleyin, yoksa ayarlarınızı
kaybedebilirsiniz:

```bash
cp /var/www/oxymed/.env /root/env-yedek
# ... ZIP'i açtıktan sonra ...
cp /root/env-yedek /var/www/oxymed/.env
chmod 600 /var/www/oxymed/.env
```

> Bu zahmeti birkaç kez yaşadıktan sonra muhtemelen GitHub yoluna geçmek isteyeceksiniz.
> Geçmek için Bölüm A.1–A.3'ü uygulamanız yeterli (mevcut klasörü silip yeniden
> `git clone` yapın, `.env` dosyasını geri koyun).

## İçerik değişikliği yaptığınızda

Admin panelinden bir ürün, haber veya slider eklediğinizde **sitenin yeniden derlenmesi
gerekir** — çünkü sayfalar önceden HTML olarak üretiliyor (SEO için). Sadece derleme
komutunu çalıştırmanız yeterli:

```bash
cd /var/www/oxymed
set -a; source .env; set +a
PORT=5199 BASE_PATH=/ pnpm --filter @workspace/oxymed-medikal run build
```

> Bunu her gece otomatik yaptırmak isterseniz:
> ```bash
> crontab -e
> ```
> Açılan dosyanın sonuna ekleyin (her gece 03:00'te derler):
> ```
> 0 3 * * * cd /var/www/oxymed && set -a && . ./.env && set +a && PORT=5199 BASE_PATH=/ /usr/bin/pnpm --filter @workspace/oxymed-medikal run build >> /var/log/oxymed-build.log 2>&1
> ```

---

# BÖLÜM 11 — Sık karşılaşılan sorunlar

## "502 Bad Gateway" hatası

nginx çalışıyor ama API sunucusuna ulaşamıyor.

```bash
systemctl status oxymed-api
journalctl -u oxymed-api -n 50 --no-pager
```

En sık sebepler:
- `JWT_SECRET` boş veya eksik → `.env` dosyasını kontrol edin
- `DATABASE_URL` yanlış → parolada `@ : / ?` gibi karakter olmadığından emin olun
- Derleme yapılmamış → `pnpm --filter @workspace/api-server run build` çalıştırın

Düzelttikten sonra: `systemctl restart oxymed-api`

## Site açılıyor ama sayfalar boş / beyaz

Web derlemesi yapılmamış veya nginx yanlış klasöre bakıyor.

```bash
ls /var/www/oxymed/artifacts/oxymed-medikal/dist/public/index.html
```

Dosya yoksa Bölüm 5'i tekrar çalıştırın.

## Admin'e giriş yapamıyorum ("giriş başarılı" diyor ama geri atıyor)

Oturum çerezi sadece HTTPS'te çalışır. Bölüm 8'i tamamladığınızdan ve siteye **`https://`**
ile girdiğinizden emin olun.

## Derleme "Killed" diyip kesiliyor / sunucu donuyor

RAM yetmiyor. Takas alanı (swap) ekleyin:

```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h
```

`Swap` satırında `4.0Gi` görmelisiniz. Sonra derlemeyi tekrar deneyin.

## Görseller görünmüyor

Beklenen durum. Rehberin **en üstündeki uyarıya** bakın.

## Teklif/iletişim e-postaları gitmiyor

`.env` dosyasındaki `SMTP_*` ayarlarını kontrol edin. Admin panelinde **Ayarlar > SMTP**
bölümünden test e-postası gönderebilirsiniz. Sağlayıcınız 465 yerine 587 portu kullanıyorsa
`SMTP_PORT=587` yapın.

## PDF (teklif/servis raporu) üretilmiyor

```bash
google-chrome-stable --version
```

Sürüm görünmüyorsa Bölüm 1.6'yı tekrar yapın. Görünüyorsa `.env` dosyasında
`CHROMIUM_PATH=/usr/bin/google-chrome-stable` satırının doğru olduğunu kontrol edin ve
`systemctl restart oxymed-api` deyin.

## Admin panelindeki "AI ile çevir" düğmeleri hata veriyor

Bu özellik Replit'in yapay zeka servisini kullanıyor ve o servis sadece Replit içinde
çalışıyor. Kendi sunucunuzda kullanmak için `platform.openai.com` adresinden kendi API
anahtarınızı alıp `.env` dosyasındaki `AI_INTEGRATIONS_OPENAI_API_KEY` satırına yazın ve
`systemctl restart oxymed-api` deyin. (Bu servis kullandıkça ücretlidir.)

## Bir şeyi bozdum, kayıtlara nasıl bakarım?

```bash
journalctl -u oxymed-api -f          # API kayıtları (canlı) — Ctrl+C ile çıkın
tail -f /var/log/nginx/error.log     # nginx hataları (canlı)
tail -f /var/log/nginx/access.log    # ziyaretçi istekleri (canlı)
```

---

# BÖLÜM 12 — Yedekleme (bunu ihmal etmeyin)

Veritabanınız en değerli varlığınız. Her gece otomatik yedek alalım:

```bash
mkdir -p /root/yedekler

cat > /root/yedek-al.sh <<'EOF'
#!/bin/bash
set -a; . /var/www/oxymed/.env; set +a
TARIH=$(date +%Y-%m-%d)
pg_dump "$DATABASE_URL" --no-owner --no-privileges \
  | gzip > "/root/yedekler/oxymed-$TARIH.sql.gz"
# 30 günden eski yedekleri sil
find /root/yedekler -name "oxymed-*.sql.gz" -mtime +30 -delete
EOF

chmod +x /root/yedek-al.sh
/root/yedek-al.sh
ls -lh /root/yedekler
```

Bir dosya oluştuğunu gördüyseniz, her gece 02:00'de otomatik çalışacak şekilde ayarlayın:

```bash
crontab -e
```

İlk kez çalıştırıyorsanız hangi editörü kullanmak istediğinizi sorar — **`1`** (nano) seçin.
Dosyanın sonuna şunu ekleyin:

```
0 2 * * * /root/yedek-al.sh
```

**`Ctrl+O`** > **Enter** > **`Ctrl+X`** ile kaydedin.

> ⚠️ **Yedekler sunucunun kendi diskinde duruyor.** Sunucu tamamen çökerse yedekler de gider.
> Ayda bir, FileZilla ile `/root/yedekler` klasöründeki en son dosyayı kendi bilgisayarınıza
> indirin.

---

# Ek — Bu sitenin yapısı (bilgi amaçlı)

Merak edenler için, kurduğunuz şeyin nelerden oluştuğu:

```
/var/www/oxymed/
├── artifacts/
│   ├── oxymed-medikal/      ← Web sitesi (React). Derlenince dist/public'e çıkar.
│   │   └── dist/public/     ← nginx'in servis ettiği hazır HTML/CSS/JS dosyaları
│   └── api-server/          ← API sunucusu (Express). Derlenince dist/index.mjs olur.
│       └── dist/index.mjs   ← systemd'nin çalıştırdığı tek dosya
├── lib/                     ← İki tarafın da kullandığı ortak kod (veritabanı şeması vb.)
├── scripts/                 ← Yardımcı araçlar (sitemap üretimi, örnek veri, çeviri)
└── .env                     ← Sizin ayarlarınız (parolalar burada — kimseyle paylaşmayın)
```

**Nasıl çalışıyor?**

1. Ziyaretçi `https://www.oxymedmedical.com/en/products` adresine gelir
2. **nginx** karşılar
3. Adres `/api/` ile başlamıyor → `dist/public/en/products/index.html` dosyasını bulur ve
   gönderir (**bu dosya derleme sırasında hazırlandığı için Google onu anında okuyabilir**)
4. Tarayıcıda React devralır ve sayfayı canlı hale getirir
5. React'in veriye ihtiyacı olduğunda `/api/products` adresine istek atar
6. nginx bu isteği `127.0.0.1:5000`'deki **API sunucusuna** iletir
7. API, **PostgreSQL** veritabanından veriyi okur ve JSON olarak geri döner

**Neden 172 sayfa önceden HTML olarak üretiliyor?** Çünkü Google ve yapay zeka arama
motorları JavaScript çalıştırmadan okuyabilsin diye. Sitenin SEO altyapısının temeli budur —
bu yüzden içerik değiştirdiğinizde siteyi yeniden derlemeniz gerekir.

---

# Son söz

Bir yerde takılırsanız:

1. Hata mesajını **olduğu gibi** kopyalayın
2. Hangi bölümde olduğunuzu not edin
3. `journalctl -u oxymed-api -n 50 --no-pager` çıktısını alın

Bu üçüyle birlikte bir yazılımcı sorunu birkaç dakikada çözebilir.

Kolay gelsin.
