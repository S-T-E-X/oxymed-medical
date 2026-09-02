-- Oxymed Medical: Yatak Başı Ünitesi içerik aktarımı
-- Kaynak: Replit geliştirme veritabanındaki products.id=13
-- Hedef: VPS PostgreSQL veritabanı
-- Bu dosya yalnızca id=13 ve page_slug=yatak-basi-unitesi satırını günceller.

BEGIN;

DO $assert$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM products
    WHERE id = 13 AND page_slug = 'yatak-basi-unitesi'
  ) THEN
    RAISE EXCEPTION 'Beklenen Yatak Başı Ünitesi ürünü bulunamadı (id=13, page_slug=yatak-basi-unitesi)';
  END IF;
END
$assert$;

UPDATE products
SET
  description = 'Medikal gaz, elektrik, data, çağrı sistemi ve LED aydınlatmayı tek gövdede birleştiren Yatak Başı Ünitesi, hastane projelerine özel modüler ve ergonomik çözüm sunar.',
  page_data = '{"faq":[{"answer":"Proje ihtiyacına göre oksijen, vakum ve basınçlı hava çıkışları sunulabilir. Gaz tipi ve çıkış adedi, sağlık tesisinin teknik altyapısı ile birlikte belirlenir.","question":"Yatak Başı Ünitesi hangi medikal gazları destekler?"},{"answer":"Evet. Uzunluk, çıkışların konumu ve aksesuar yerleşimi oda planı, yatak sayısı ve klinik kullanım senaryosuna göre projelendirilebilir.","question":"Ünite ölçüleri ve yerleşimi değiştirilebilir mi?"},{"answer":"Evet. Elektrik prizleri, data bağlantıları, USB çıkışları ve çağrı sistemi bileşenleri ihtiyaç duyulan konfigürasyona göre eklenebilir.","question":"Elektrik ve data bağlantıları eklenebilir mi?"},{"answer":"Genel aydınlatma ve hasta başı okuma aydınlatması için LED seçenekleri sunulabilir. Yerleşim, hasta ve sağlık personelinin kullanım konforuna göre planlanır.","question":"LED aydınlatma seçenekleri nelerdir?"},{"answer":"Evet. Oda planı, yatak yerleşimi, medikal gaz altyapısı ve elektrik ihtiyaçları değerlendirilerek uygun yerleşim ve konfigürasyon belirlenir.","question":"Montaj öncesi proje çalışması yapılıyor mu?"},{"answer":"Temizlik ve bakım, ürünün kullanım talimatlarına uygun şekilde ve yüzeye zarar vermeyen uygun temizleyicilerle yapılmalıdır. Teknik servis gerektiren işlemler yetkili ekiplerce gerçekleştirilmelidir.","question":"Ürünün temizliği ve bakımı nasıl yapılmalıdır?"}],"specs":[{"label":"Medikal gaz","value":"O2, vakum ve basınçlı hava seçenekleri"},{"label":"Gaz çıkışı","value":"Proje konfigürasyonuna göre"},{"label":"Elektrik prizleri","value":"İhtiyaca göre yapılandırılabilir"},{"label":"Data / çağrı sistemi","value":"Opsiyonel"},{"label":"LED aydınlatma","value":"Genel ve hasta başı okuma seçenekleri"},{"label":"Gövde","value":"Alüminyum profil"},{"label":"Uzunluk","value":"Proje ölçülerine göre 1000–2000 mm seçenekleri"},{"label":"Montaj tipi","value":"Duvar tipi"}],"locales":{},"features":[{"icon":"wind","text":"Oksijen, vakum ve basınçlı hava hatları için düzenli ve erişilebilir çıkış altyapısı sunar.","title":"Medikal gaz erişimi"},{"icon":"plug-zap","text":"Priz, data, USB ve çağrı sistemi seçeneklerini yatak başında kontrollü biçimde toplar.","title":"Elektrik ve data düzeni"},{"icon":"lightbulb","text":"Genel ve okuma aydınlatması seçenekleriyle hasta ve sağlık personeli konforunu destekler.","title":"LED hasta başı aydınlatma"},{"icon":"wrench","text":"Modüler alüminyum profil yapısı, bağlantılara erişimi ve bakım süreçlerini kolaylaştırır.","title":"Servis dostu gövde"}],"useCases":[{"icon":"hospital","text":"Yoğun bakım üniteleri"},{"icon":"bed","text":"Yenidoğan ve çocuk yoğun bakım üniteleri"},{"icon":"stethoscope","text":"Ameliyathane sonrası bakım alanları"},{"icon":"hospital","text":"Servis ve hasta odaları"},{"icon":"activity","text":"Poliklinik ve gözlem odaları"},{"icon":"building","text":"Özel bakım ve klinik alanlar"}],"advantages":["Medikal gaz ve elektrik bağlantılarını yatak başında düzenli ve erişilebilir tutar.","Modüler yapısı sayesinde farklı oda planlarına ve klinik ihtiyaçlara uyarlanabilir.","LED aydınlatma seçenekleri hasta, refakatçi ve sağlık personeli konforunu destekler.","Kolay temizlenebilen yüzeyleri günlük hijyen süreçlerine uyum sağlar.","Servis ve bakım işlemleri için bağlantılara kontrollü erişim sunar.","Proje ölçülerine göre farklı uzunluk ve yerleşim seçenekleriyle planlanabilir."],"detailCards":[{"text":"Medikal gaz, elektrik, data ve çağrı bağlantılarını tek bir gövdede toplayarak çalışma alanını daha düzenli hale getirir.","title":"Düzenli Hasta Başı Organizasyonu","imageUrl":""},{"text":"Oda planı, yatak sayısı ve klinik ihtiyaçlara göre gaz çıkışı, priz, anahtar ve aksesuar yerleşimi yapılandırılabilir.","title":"Projeye Özel Konfigürasyon","imageUrl":""},{"text":"Kolay temizlenebilen yüzeyleri ve sağlam alüminyum profil yapısı ile yoğun kullanımlı sağlık alanlarına uyum sağlar.","title":"Hijyenik ve Dayanıklı Gövde","imageUrl":""}],"featureTiles":[{"text":"Yatak sayısı, oda planı ve klinik ihtiyaçlara göre ölçülendirilebilir.","title":"Proje Bazlı Tasarım"},{"text":"Priz, data, USB ve çağrı sistemi seçenekleriyle yapılandırılabilir.","title":"Elektrik ve Data Altyapısı"},{"text":"Bağlantılar ve aydınlatma, sağlık personelinin hızlı erişebileceği konumda düzenlenir.","title":"Ergonomik Kullanım"},{"text":"Alüminyum profil yapı, yoğun kullanım için dayanıklı ve bakımı kolay bir çözüm sunar.","title":"Uzun Ömürlü Gövde"}],"heroSubtitle":"Güvenli klinik altyapı için modüler hasta başı sistemi","sectionOrder":["detailCards","technical","useCases","featureTiles","faq"],"hiddenSections":[],"heroDescription":"Medikal gaz, elektrik, data, çağrı sistemi ve LED aydınlatmayı tek gövdede birleştiren Yatak Başı Ünitesi, hastane projelerine özel modüler ve ergonomik çözüm sunar.","templateVersion":1}'::jsonb
WHERE id = 13
  AND page_slug = 'yatak-basi-unitesi';

COMMIT;

SELECT id, page_slug, length(description) AS description_length,
       jsonb_array_length(page_data->'faq') AS faq_count,
       jsonb_array_length(page_data->'features') AS feature_count
FROM products
WHERE id = 13 AND page_slug = 'yatak-basi-unitesi';
