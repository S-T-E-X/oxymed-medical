# Oxymed Medical — Google'da Daha Hızlı Keşfedilme ve SEO Uygulama Rehberi

Bu rehber, `https://www.oxymedmedical.com` sitesinin Google tarafından
keşfedilmesi, taranması ve doğru sayfaların arama sonuçlarına alınması için
uygulanacak adımları içerir.

> **Önemli:** Google'a kayıt olmak indekslenmeyi başlatır ancak belirli bir
> sırada veya belirli bir sürede çıkmayı garanti etmez. Teknik hataları
> kaldırmak, sitemap göndermek, önemli URL'leri denetlemek ve düzenli olarak
> özgün içerik yayınlamak süreci hızlandırır.

---

## 1. Önce canlı sitenin doğru çalıştığını doğrulayın

Google Search Console'a göndermeden önce aşağıdaki kontroller VPS'den
çalıştırılmalıdır:

```bash
for url in \
  https://www.oxymedmedical.com/ \
  https://www.oxymedmedical.com/robots.txt \
  https://www.oxymedmedical.com/sitemap.xml \
  https://www.oxymedmedical.com/urunler \
  https://www.oxymedmedical.com/urunler/yatak-basi-unitesi
do
  echo "--- $url"
  curl -fsSI --max-time 20 "$url" | grep -Ei '^(HTTP/|content-type:|location:|cache-control:)'
done
```

Beklenenler:

- Ana sayfa ve public sayfalar: `200`
- `robots.txt`: `200`
- `sitemap.xml`: `200`, `Content-Type: text/xml`
- Ürün sayfası: `200`
- Admin ve teklif/servis çıktısı gibi özel sayfalar sitemap'te olmamalı

### 1.1 Şu anki canlı kontrol sonucu

2 Eylül 2026 tarihinde yapılan kontrolde:

- `https://www.oxymedmedical.com/robots.txt` erişilebilir durumda.
- `https://www.oxymedmedical.com/sitemap.xml` HTTP `200` dönüyor.
- Sitemap'te 172 URL bulunuyor; sayı içerik eklendikçe değişebilir.
- `https://www.oxymedmedical.com/urunler/yatak-basi-unitesi` sitemap'te yer alıyor.
- Ana sayfa ve Yatak Başı Ünitesi sayfasında `index, follow` mevcut.
- Canonical adresler `https://www.oxymedmedical.com` alan adına işaret ediyor.
- HTTP, www olmayan HTTPS ve www olmayan HTTP adresleri www HTTPS adresine
  kalıcı yönlendirme yapıyor.

Bu nedenle sonraki kritik adım, sitenin Search Console'a eklenmesidir.

---

## 2. Google Search Console'a siteyi ekleyin

### 2.1 Domain property oluşturma — önerilen yöntem

1. Şu adresi açın:
   `https://search.google.com/search-console/welcome`
2. Google hesabınızla giriş yapın.
3. **Mülk ekle / Add property** seçeneğini açın.
4. **Domain / Alan adı** seçeneğini seçin.
5. Şunu girin:

   ```text
   oxymedmedical.com
   ```

6. Google'ın verdiği DNS TXT kaydını kopyalayın.
7. Alan adının DNS yönetim panelinde kök alan adına TXT kaydı olarak ekleyin.
   - Host/Name alanı çoğu panelde `@` olur.
   - Değer, Google'ın verdiği `google-site-verification=...` metnidir.
   - TXT değerini değiştirmeyin ve tırnak eklemeyin; panel otomatik ekliyorsa
     ikinci kez tırnak yazmayın.
8. DNS yayıldıktan sonra Search Console'da **Doğrula / Verify** seçin.

Domain property seçildiğinde `http`, `https`, `www` ve www olmayan alan adları
tek mülk altında izlenir. Bu yüzden Domain property için `https://` veya `www`
yazılmaz.

### 2.2 DNS'e erişiminiz yoksa alternatif doğrulama

Alan adı DNS'ini değiştiremiyorsanız URL-prefix mülkü ekleyin:

```text
https://www.oxymedmedical.com/
```

Google'ın sunduğu HTML meta etiketi veya HTML dosyası yöntemlerinden birini
kullanın. DNS erişimi mümkünse Domain property daha kapsamlı ve daha doğru
seçenektir.

> Search Console doğrulama etiketini kod içine kendiniz uydurmayın. Google
> tarafından verilen gerçek değeri kullanın. Doğrulama tamamlandıktan sonra
> etiketi kaldırmayın; Google mülk sahipliğini tekrar kontrol edebilir.

---

## 3. Sitemap'i Google'a gönderin

Search Console içinde:

1. Sol menüden doğru mülkü seçin.
2. **Sitemaps / Site Haritaları** bölümünü açın.
3. Sitemap alanına şunu yazın:

   ```text
   https://www.oxymedmedical.com/sitemap.xml
   ```

4. **Gönder / Submit** seçin.
5. Durumun **Success / Başarılı** olmasını bekleyin.
6. Google'ın keşfettiği URL sayısını kontrol edin.

`robots.txt` dosyası da sitemap'i zaten bildiriyor:

```text
Sitemap: https://www.oxymedmedical.com/sitemap.xml
```

Sitemap'i her gün yeniden göndermeyin. İçerik veya URL yapısı değiştiğinde
yeniden göndermek yeterlidir.

### 3.1 Sitemap'te bulunması gerekenler

Sitemap'te şu tür sayfalar bulunmalıdır:

- Ana sayfa
- Ürün listeleme sayfası
- Yayındaki ürün detay sayfaları
- Kurumsal, referanslar, sertifikalar ve iletişim/teklif sayfaları
- Yayında olan haberlerin, gerçekten mevcut çeviri sürümleri

Sitemap'te şu tür sayfalar bulunmamalıdır:

- `/admin/...`
- Teklif görüntüleme veya teklif şablonu sayfaları
- Servis raporu ve taslak sayfaları
- Giriş gerektiren sayfalar
- Yayından kaldırılmış ürün veya haberler
- Aynı içeriğin sorgu parametreli kopyaları

Türkçe ana dil URL'si bu projede kök adrestir. Örneğin `/tr` adresini
ayrıca sitemap'e eklemek yerine şu adresi kullanın:

```text
https://www.oxymedmedical.com/
```

Başka diller yalnızca o sayfada yayınlanmış içerik varsa eklenmelidir.
Türkçe içerik kopyalanarak boş veya yanlış çevirili yabancı URL'ler
oluşturmayın.

---

## 4. Önemli sayfalar için URL Denetimi ve indeksleme isteği

Sitemap Google'a tüm URL'leri bildirir. Önemli sayfalar için ayrıca URL
Denetimi yapılabilir:

1. Search Console üst kısmındaki URL denetim alanını açın.
2. Tam URL'yi girin.
3. **Canlı URL'yi test et / Test live URL** seçin.
4. Sayfa erişilebiliyorsa **İndeksleme iste / Request indexing** seçin.
5. Test sonucunda canonical ve robots kararını kontrol edin.

İlk turda şu URL'leri önceliklendirin:

```text
https://www.oxymedmedical.com/
https://www.oxymedmedical.com/urunler
https://www.oxymedmedical.com/urunler/yatak-basi-unitesi
https://www.oxymedmedical.com/urunler/kat-kontrol-panosu
https://www.oxymedmedical.com/urunler/medikal-vakum-santrali
https://www.oxymedmedical.com/urunler/dental-vakum-sistemi
https://www.oxymedmedical.com/kurumsal
https://www.oxymedmedical.com/referanslar
https://www.oxymedmedical.com/haberler
https://www.oxymedmedical.com/teklif-al
```

Ürün slug'ları veya yayın durumu değiştiyse URL'leri sitemap'ten kopyalayın.
Yukarıdaki listede bulunmayan bir URL için ısrarla indeksleme istemek yerine
önce o URL'nin gerçekten yayında olup olmadığını kontrol edin.

### İstek gönderirken bilinmesi gerekenler

- İndeksleme isteği Google'ın sayfayı tekrar taramasını ister; garanti vermez.
- Aynı URL için peş peşe tekrar tekrar istek göndermeyin.
- Büyük bir değişiklikten sonra bir kez istek göndermek yeterlidir.
- Google Search Console'da günlük istek sınırı görülebilir.
- `Crawled - currently not indexed` sayfanın tarandığı fakat henüz arama
  sonuçlarına alınmadığı anlamına gelir; bu doğrudan teknik hata değildir.
- `Discovered - currently not indexed` URL'nin keşfedildiği fakat henüz
  taranmadığı anlamına gelir; sitemap, iç linkler ve zaman burada önemlidir.

---

## 5. Google'ın sayfayı doğru okuyabildiğini kontrol edin

### 5.1 Sayfa başlığı, açıklama ve canonical

VPS'den:

```bash
curl -fsSL https://www.oxymedmedical.com/urunler/yatak-basi-unitesi \
  | grep -Eio '<title>[^<]*|<meta[^>]+(description|robots)[^>]*|<link[^>]+canonical[^>]*' \
  | head -20
```

Beklenen yapı:

```text
<title>Yatak Başı Ünitesi | Oxymed Medikal</title>
<meta name="description" ...>
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.oxymedmedical.com/urunler/yatak-basi-unitesi">
```

### 5.2 Hreflang

Çok dilli sayfalarda her dil, gerçekten yayınlanmış diğer dil sürümlerini
karşılıklı olarak göstermelidir. Bir ürünün yalnızca Türkçe içeriği varsa
yalnızca Türkçe ve `x-default` bağlantılarının bulunması doğrudur; eksik
çeviriyi varmış gibi göstermeyin.

Search Console'da alternatif dil hataları görülürse ilk olarak:

1. İlgili yabancı dil satırının gerçekten yayında olup olmadığını,
2. Sitemap'te URL'nin bulunup bulunmadığını,
3. URL'nin `200` döndürüp döndürmediğini,
4. Canonical'ın başka bir dile zorla yönelip yönelmediğini

kontrol edin.

### 5.3 Yapılandırılmış veri

Google'ın zengin sonuç testini kullanın:

```text
https://search.google.com/test/rich-results
```

Öncelikle ana sayfa ve Yatak Başı Ünitesi ürün URL'sini test edin. Hata varsa
özellikle şu alanları kontrol edin:

- Organization/LocalBusiness bilgileri
- Product adı ve açıklaması
- Ürün görselinin herkese açık HTTPS URL'si
- Breadcrumb bilgisi
- Haber sayfalarında NewsArticle alanları

Uyarılar her zaman indekslemeyi durdurmaz; kırmızı hatalar düzeltilmelidir.

### 5.4 Mobil ve hız

Şu araçlarla kontrol edin:

```text
https://pagespeed.web.dev/
https://search.google.com/test/mobile-friendly
```

Öncelikler:

- Mobilde yatay kayma olmaması
- Ana içerik ve başlıkların hızlı görünmesi
- Büyük görsellerin gereksiz boyutta olmaması
- Görsellerde anlamlı `alt` metinleri
- Butonların mobilde rahat tıklanabilmesi
- HTTPS dışı görsel veya script kalmaması

---

## 6. VPS'de içerik veya kod değişikliğinden sonra SEO çıktısını yenileyin

Bu proje sitemap ve SEO için veritabanını build sırasında okur. Yeni ürün,
haber, slug veya SEO metni VPS veritabanına aktarıldıktan sonra yalnızca API'yi
yeniden başlatmak yeterli değildir; web build'i de alınmalıdır.

VPS'de root olarak:

```bash
cd /var/www/oxymed

git pull --ff-only
pnpm install --frozen-lockfile

set -a
source .env
set +a

pnpm --filter @workspace/api-server run build

SITE_ORIGIN=https://www.oxymedmedical.com \
PORT=5199 BASE_PATH=/ \
  pnpm --filter @workspace/oxymed-medikal run build

systemctl restart oxymed-api
nginx -t && systemctl reload nginx
```

Build tamamlandıktan sonra kontrol edin:

```bash
curl -fsSI https://www.oxymedmedical.com/sitemap.xml | head
curl -fsSL https://www.oxymedmedical.com/sitemap.xml | grep -c '<loc>'
curl -fsSL https://www.oxymedmedical.com/sitemap.xml \
  | grep -F 'urunler/yatak-basi-unitesi'
curl -fsSI https://www.oxymedmedical.com/urunler/yatak-basi-unitesi | head
```

`git pull --ff-only` conflict verirse `git reset --hard` veya `push-force`
kullanmayın. Önce `git status` ve `git diff` ile VPS'de yerel değişiklik olup
olmadığını inceleyin.

### 6.1 Sadece içerik değiştiyse

İçerik değişikliği GitHub kodunda değil, VPS PostgreSQL'de yapıldıysa:

1. Veritabanı yedeğini alın.
2. İçerik aktarım SQL'ini çalıştırın.
3. Yukarıdaki frontend web build'ini çalıştırın.
4. API'yi yeniden başlatın.
5. Sitemap ve değişen URL için Search Console'da tekrar URL denetimi yapın.

Sitemap'i elle düzenlemeyin. Build script'i sitemap, robots ve prerender
HTML'lerini aynı veritabanı görünümünden üretir.

---

## 7. Google Business Profile oluşturun veya güncelleyin

Oxymed'in fiziksel bir şirket/ofis ve hizmet bölgesi olduğu için uygunsa
Google Business Profile da oluşturulmalıdır:

```text
https://www.google.com/business/
```

Profilde aşağıdaki bilgileri web sitesiyle birebir tutarlı kullanın:

- İşletme adı: resmi kullanılan ad
- Telefon numarası
- Web sitesi: `https://www.oxymedmedical.com`
- İzmir adresi veya hizmet bölgesi
- Çalışma saatleri
- İşletme kategorisi
- Ürün ve hizmet açıklamaları
- Gerçek ofis, ekip, üretim ve ürün fotoğrafları

Google'ın doğrulama yöntemini tamamlayın. Müşterilerden gerçek deneyimlerini
anlatan yorumlar isteyin ve yorumlara düzenli cevap verin. Sahte yorum,
anahtar kelime doldurulmuş işletme adı veya aynı işletme için mükerrer profil
kullanmayın.

Business Profile yerel aramalarda görünürlüğü artırır; organik web sıralaması
için Search Console'un yerine geçmez.

---

## 8. Bing Webmaster Tools'a da gönderin

Google dışında Bing ve Microsoft aramalarında görünmek için:

1. `https://www.bing.com/webmasters` adresini açın.
2. Google Search Console ile içe aktarma seçeneği varsa kullanın.
3. Aksi halde `https://www.oxymedmedical.com` sitesini ekleyip doğrulayın.
4. Sitemap olarak şunu gönderin:

   ```text
   https://www.oxymedmedical.com/sitemap.xml
   ```

5. Bing URL Inspection ile ana sayfa ve önemli ürün sayfalarını kontrol edin.

Google ve Bing'e aynı sitemap'i göndermek normaldir.

---

## 9. Google'da daha hızlı ve daha doğru görünmek için içerik planı

Teknik SEO tamamlandıktan sonra sıralamayı asıl geliştiren şey özgün ve
yararlı içeriktir.

### Ürün sayfalarında

- Her ürün için benzersiz başlık ve meta açıklaması yazın.
- Ürünün hangi hastane/klinik ihtiyacını çözdüğünü açıkça anlatın.
- Teknik özellikleri ölçülebilir ve anlaşılır biçimde verin.
- Kullanım alanlarını belirtin: yoğun bakım, servis odası, ameliyathane vb.
- Ürün sayfaları arasında anlamlı iç bağlantılar kurun.
- Gerçek ürün görselleri kullanın ve dosya adlarını açıklayıcı seçin.
- Görsel `alt` metinlerinde görseli doğal biçimde tarif edin.
- Sertifika, kalite ve üretim iddialarını gerçek belgelerle destekleyin.

### Haberlerde

- Kısa, kopya veya sadece anahtar kelimeden oluşan haberler yayınlamayın.
- Her haber için özgün başlık, özet, ana görsel ve yayın tarihi kullanın.
- Gerçekten yayında olmayan dil sürümlerini oluşturmayın.
- Eski ve değersiz haberleri silmek yerine gerekiyorsa güncelleyip açıklayın;
  kaldırılan içeriklerin sitemap'ten çıktığını doğrulayın.

### Anahtar kelime yaklaşımı

Doğal olarak şu konu kümelerini kullanabilirsiniz:

- yatak başı ünitesi
- medikal gaz sistemleri
- hastane medikal gaz çözümleri
- medikal vakum santrali
- dental vakum sistemi
- gaz kontrol paneli
- hastane proje ve kurulum hizmetleri

Her sayfada aynı kelimeyi tekrar tekrar kullanmayın. Google için okunabilirlik
ve gerçek kullanıcıya fayda, anahtar kelime yoğunluğundan daha önemlidir.

---

## 10. Dış bağlantı ve marka güveni

Kaliteli ve gerçek kaynaklardan gelen bağlantılar keşfedilmeye yardımcı olur:

- Üretici/marka sosyal medya profilleri
- LinkedIn şirket sayfası
- Ticaret odası veya sektörel dernek profilleri
- Gerçek proje ve iş ortaklarının referans sayfaları
- Fuar, etkinlik ve sektörel yayın sayfaları
- Yetkili tedarikçi veya üretici listeleri

Bağlantıları doğal biçimde oluşturun. Toplu backlink paketi, otomatik dizin,
gizli link, link değişim ağı veya spam yorum kullanmayın; bunlar uzun vadede
zarar verebilir.

---

## 11. Search Console'u düzenli takip edin

### İlk hafta

- Sitemap durumunda hata var mı?
- Kaç URL keşfedildi?
- URL Denetimi'nde önemli sayfalar taranabiliyor mu?
- `robots.txt` veya `noindex` engeli var mı?
- Canonical Google tarafından doğru seçilmiş mi?

### İlk 2–4 hafta

- **Pages / Sayfalar** raporunda indekslenmeyen URL nedenleri
- **Performance / Performans** raporunda gösterim ve sorgular
- **Core Web Vitals**
- Mobil kullanılabilirlik
- HTTPS ve yönlendirme hataları

### Her yeni ürün veya haber yayınında

1. VPS veritabanına kaydı aktarın.
2. Web build alın.
3. Sitemap'te URL'nin bulunduğunu kontrol edin.
4. URL Denetimi ile canlı testi çalıştırın.
5. Gerekirse bir kez indeksleme isteği gönderin.

İlk günlerde `site:oxymedmedical.com` aramasında görünmemesi tek başına hata
değildir. Asıl durum Search Console'un **Sayfalar** raporundan takip edilmelidir.

---

## 12. Sorun giderme tablosu

| Search Console sonucu | Ne anlama gelir? | Yapılacak |
|---|---|---|
| URL Google'da bilinmiyor | Google URL'yi henüz görmemiş | Sitemap gönderin, iç link ekleyin, URL denetiminden canlı test yapın |
| Taranmış, şu anda indekslenmemiş | Google gördü ama henüz sonuçlara almadı | İçeriği özgünleştirin, iç linkleri artırın, bekleyin |
| Keşfedilmiş, şu anda indekslenmemiş | URL bulundu ama tarama bekliyor | Sitemap, 200 yanıtı, sunucu hızı ve içerik kalitesini kontrol edin |
| Robots.txt tarafından engellendi | Tarayıcı erişemiyor | URL'nin public olması gerekiyorsa robots kuralını düzeltin |
| `noindex` bulundu | Sayfa indekslemeyi reddediyor | Public sayfalarda `index, follow` olduğundan emin olun |
| Başka sayfa canonical seçildi | Google bu URL'yi kopya görüyor | Canonical, içerik ve hreflang ilişkisini kontrol edin |
| Sunucu hatası 5xx | Google sayfayı okuyamıyor | API/Nginx loglarını ve servis durumunu kontrol edin |
| Sitemap alınamadı | Sitemap erişilemiyor veya XML bozuk | `curl`, Nginx ve build çıktısını kontrol edin |

---

## 13. Yapılacaklar kontrol listesi

- [ ] `https://www.oxymedmedical.com` için Search Console Domain property oluşturuldu.
- [ ] DNS TXT doğrulaması tamamlandı.
- [ ] `https://www.oxymedmedical.com/sitemap.xml` Search Console'a gönderildi.
- [ ] Sitemap durumu başarılı görünüyor.
- [ ] Ana sayfa için URL Denetimi yapıldı.
- [ ] Ürün listeleme sayfası için URL Denetimi yapıldı.
- [ ] Yatak Başı Ünitesi URL'si için URL Denetimi yapıldı.
- [ ] En önemli diğer ürün URL'leri için URL Denetimi yapıldı.
- [ ] Ana sayfa ve ürün sayfaları canlı testte `200` dönüyor.
- [ ] Public sayfalarda `index, follow` bulunuyor.
- [ ] Canonical adresler www HTTPS alan adına işaret ediyor.
- [ ] Sitemap'te yalnızca yayındaki public URL'ler var.
- [ ] Admin ve özel çıktı sayfaları sitemap dışında.
- [ ] Google Rich Results Test çalıştırıldı.
- [ ] PageSpeed Insights mobil kontrolden geçirildi.
- [ ] Google Business Profile oluşturuldu/doğrulandı veya güncellendi.
- [ ] Bing Webmaster Tools'a site ve sitemap eklendi.
- [ ] LinkedIn ve gerçek sektörel profillerde site adresi güncellendi.
- [ ] Search Console raporu haftalık kontrol edilecek.

---

## Resmi kaynaklar

- Google Search Console'a mülk ekleme:
  https://support.google.com/webmasters/answer/34592
- Google alan adı doğrulama:
  https://support.google.com/webmasters/answer/10431861
- Google site doğrulama yöntemleri:
  https://support.google.com/webmasters/answer/9008080
- Sitemap oluşturma ve gönderme:
  https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- URL denetimi:
  https://support.google.com/webmasters/answer/9012289
- Yeniden tarama/indeksleme isteği:
  https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- Google Search performansını izleme:
  https://developers.google.com/search/docs/monitor-debug/search-console-start
- Bing sitemap gönderme:
  https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed
