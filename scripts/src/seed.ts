import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  adminUsersTable,
  slidersTable,
  productCategoriesTable,
  productsTable,
  newsTable,
  referencesTable,
  siteSettingsTable,
  corporateSectionsTable,
} from "@workspace/db";

async function seed() {
  console.log("🌱 Starting seed...");

  // Admin user
  const passwordHash = await bcrypt.hash("oxymed2024!", 10);
  await db
    .insert(adminUsersTable)
    .values({ email: "admin@oxymed.com.tr", passwordHash, name: "Oxymed Admin" })
    .onConflictDoNothing();
  console.log("✅ Admin user seeded (admin@oxymed.com.tr / oxymed2024!)");

  // 3 Sliders
  await db
    .insert(slidersTable)
    .values([
      {
        title: "SAĞLIĞA HİZMET EDİYORUZ",
        subtitle: "MEDİKAL ÇÖZÜMLER",
        description: "Hastaneler, klinikler ve sağlık merkezleri için yerli üretim, yüksek kalite medikal ekipman ve sistem çözümleri.",
        ctaPrimaryText: "Ürünleri İncele",
        ctaPrimaryHref: "/urunler",
        ctaSecondaryText: "Teklif Al",
        ctaSecondaryHref: "/teklif",
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "YATAK BAŞI ÜNİTELERİ",
        subtitle: "YENİLİKÇİ TASARIM",
        description: "Elektrik, medikal gaz ve data sistemlerini tek bir ünitede birleştiren modern ve ergonomik çözümler.",
        ctaPrimaryText: "Daha Fazla Bilgi",
        ctaPrimaryHref: "/urunler#yatak-basi-uniteleri",
        sortOrder: 2,
        isActive: true,
      },
      {
        title: "PENDANT SİSTEMLERİ",
        subtitle: "AMELİYATHANE & YOĞUN BAKIM",
        description: "Ameliyathane ve yoğun bakım ünitelerine özel esnek, döner kollu medikal pendant çözümleri.",
        ctaPrimaryText: "Pendant Sistemleri",
        ctaPrimaryHref: "/urunler#pendant-sistemleri",
        sortOrder: 3,
        isActive: true,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ 3 sliders seeded");

  // 4 Product categories
  const [cat1, cat2, cat3, cat4] = await db
    .insert(productCategoriesTable)
    .values([
      { name: "Yatak Başı Üniteleri", slug: "yatak-basi-uniteleri", sortOrder: 1 },
      { name: "Pendant Sistemleri", slug: "pendant-sistemleri", sortOrder: 2 },
      { name: "Medikal Gaz Sistemleri", slug: "medikal-gaz-sistemleri", sortOrder: 3 },
      { name: "Elektrik & Data Sistemleri", slug: "elektrik-data-sistemleri", sortOrder: 4 },
    ])
    .onConflictDoNothing()
    .returning();
  console.log("✅ 4 product categories seeded");

  const catId1 = cat1?.id;
  const catId2 = cat2?.id;
  const catId3 = cat3?.id;
  const catId4 = cat4?.id;

  // 4 Products
  await db
    .insert(productsTable)
    .values([
      {
        categoryId: catId1,
        title: "Standart Yatak Başı Ünitesi",
        description: "Temel medikal gaz, elektrik ve data ihtiyaçlarını karşılayan ekonomik çözüm.",
        imageUrl: "/assets/images/product-bed-head-unit.png",
        specs: [
          { label: "Gaz Prizi", value: "2 - 6 Adet" },
          { label: "Elektrik Prizi", value: "4 - 8 Adet" },
          { label: "Uzunluk", value: "1000 - 2000 mm" },
        ],
        sortOrder: 1,
        published: true,
      },
      {
        categoryId: catId2,
        title: "Pendant Sistemi",
        description: "Ameliyathane ve yoğun bakım için esnek, döner kollu medikal pendant çözümleri.",
        imageUrl: "/assets/images/product-medical-gas.png",
        specs: [
          { label: "Yük Kapasitesi", value: "80 - 200 kg" },
          { label: "Kol Uzunluğu", value: "700 - 1500 mm" },
          { label: "Dönüş Açısı", value: "340°" },
        ],
        sortOrder: 2,
        published: true,
      },
      {
        categoryId: catId3,
        title: "Medikal Gaz Alarmı",
        description: "Hastane gaz dağıtım sistemleri için merkezi alarm ve izleme panelleri.",
        imageUrl: "/assets/images/product-electrical-data.png",
        specs: [
          { label: "Kanal", value: "4 - 16 Kanal" },
          { label: "Ekran", value: "LCD / LED" },
          { label: "Çıkış", value: "Röle + RS485" },
        ],
        sortOrder: 3,
        published: true,
      },
      {
        categoryId: catId4,
        title: "Elektrik & Data Ünitesi",
        description: "Hasta odaları için modüler elektrik, zayıf akım ve data çözümleri.",
        imageUrl: "/assets/images/product-bed-head-unit.png",
        specs: [
          { label: "Elektrik Prizi", value: "4 - 10 Adet" },
          { label: "Data Prizi", value: "RJ45 / HDMI" },
          { label: "Montaj", value: "Duvar / Kolona" },
        ],
        sortOrder: 4,
        published: true,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ 4 products seeded");

  // 4 News posts
  await db
    .insert(newsTable)
    .values([
      {
        title: "Medikal Gaz Sistemleri Nedir?",
        excerpt: "Medikal gaz sistemlerinin hastanelerdeki önemi, standartları ve doğru kurulum süreçleri hakkında bilmeniz gerekenler.",
        category: "TEKNİK BİLGİLER",
        imageUrl: "/assets/images/product-medical-gas.png",
        slug: "medikal-gaz-sistemleri-nedir",
        published: true,
        publishedAt: new Date("2024-05-28"),
      },
      {
        title: "Ameliyathane Pendant Sistemi Nasıl Seçilir?",
        excerpt: "Ameliyathane pendant sistemleri seçerken dikkat edilmesi gereken teknik kriterler ve avantajları.",
        category: "TEKNİK BİLGİLER",
        imageUrl: "/assets/images/product-pendant-system.png",
        slug: "ameliyathane-pendant-sistemi-nasil-secilir",
        published: true,
        publishedAt: new Date("2024-05-20"),
      },
      {
        title: "İstanbul Başakşehir Çam ve Sakura Şehir Hastanesi Projesi Tamamlandı",
        excerpt: "Yatak başı üniteleri, pendant sistemleri ve medikal gaz altyapısı başarıyla teslim edildi.",
        category: "PROJELER",
        imageUrl: "/assets/images/corporate-hero-facility.png",
        slug: "istanbul-basaksehir-cam-sakura-sehir-hastanesi",
        published: true,
        publishedAt: new Date("2024-05-02"),
      },
      {
        title: "Expomed Eurasia 2024 Fuarı'nda Yerimizi Aldık",
        excerpt: "Yeni ürünlerimiz ve çözümlerimizle sektör profesyonelleriyle buluştuk.",
        category: "FUARLAR",
        imageUrl: "/assets/images/corporate-production-floor.png",
        slug: "expomed-eurasia-2024-fuari",
        published: true,
        publishedAt: new Date("2024-04-10"),
      },
    ])
    .onConflictDoNothing();
  console.log("✅ 4 news posts seeded");

  // 6 References
  await db
    .insert(referencesTable)
    .values([
      { title: "İstanbul Başakşehir Çam ve Sakura Şehir Hastanesi", projectType: "Şehir Hastanesi", capacity: "2.682 Yatak", city: "İstanbul", imageUrl: "/assets/images/corporate-hero-facility.png", category: "ŞEHİR HASTANELERİ" },
      { title: "Ankara Bilkent Şehir Hastanesi", projectType: "Şehir Hastanesi", capacity: "3.704 Yatak", city: "Ankara", imageUrl: "/assets/images/stats-facility.png", category: "ŞEHİR HASTANELERİ" },
      { title: "İzmir Şehir Hastanesi", projectType: "Şehir Hastanesi", capacity: "1.035 Yatak", city: "İzmir", imageUrl: "/assets/images/corporate-production-floor.png", category: "ŞEHİR HASTANELERİ" },
      { title: "Bursa Şehir Hastanesi", projectType: "Şehir Hastanesi", capacity: "1.011 Yatak", city: "Bursa", imageUrl: "/assets/images/corporate-warehouse.png", category: "ŞEHİR HASTANELERİ" },
      { title: "Acıbadem Maslak Hastanesi", projectType: "Özel Hastane", capacity: "234 Yatak", city: "İstanbul", imageUrl: "/assets/images/corporate-bedhead-line.png", category: "ÖZEL HASTANELER" },
      { title: "Hacettepe Üniversitesi Hastanesi", projectType: "Üniversite Hastanesi", capacity: "1.200 Yatak", city: "Ankara", imageUrl: "/assets/images/product-pendant-system.png", category: "ÜNİVERSİTE HASTANELERİ" },
    ])
    .onConflictDoNothing();
  console.log("✅ 6 references seeded");

  // Site settings
  await db
    .insert(siteSettingsTable)
    .values([
      { settingKey: "phone", settingValue: "+90 232 870 0 222" },
      { settingKey: "email", settingValue: "info@oxymed.com.tr" },
      { settingKey: "address", settingValue: "10016 Sk. No:5 AOSB Çiğli / İzmir / TÜRKİYE" },
      { settingKey: "linkedin", settingValue: "#" },
      { settingKey: "instagram", settingValue: "#" },
      { settingKey: "youtube", settingValue: "#" },
      { settingKey: "yearsExperience", settingValue: "15+" },
      { settingKey: "completedProjects", settingValue: "200+" },
      { settingKey: "exportCountries", settingValue: "50+" },
      { settingKey: "customerSatisfaction", settingValue: "100%" },
    ])
    .onConflictDoNothing();
  console.log("✅ Site settings seeded");

  // Corporate sections
  await db
    .insert(corporateSectionsTable)
    .values([
      {
        sectionKey: "about",
        title: "Sağlık İçin Güvenilir Sistemler",
        subtitle: "",
        content: `1999 yılında kurulan firmamız, medikal gaz sistemleri ve tıbbi cihazların üretimi, satışı, projelendirilmesi ve uygulaması alanlarında faaliyet göstermektedir. Kurulduğumuz günden bu yana sağlık sektörünün ihtiyaçlarını doğru analiz eden, güvenilir ve sürdürülebilir çözümler geliştiren bir anlayışla çalışmalarımızı sürdürmekteyiz.

Faaliyetlerimizin ilk yıllarından itibaren üretimini gerçekleştirdiğimiz medikal gaz sistemi ekipmanları ve hayata geçirdiğimiz sağlık tesisi projeleriyle kalite, güvenilirlik ve teknik yeterlilik konularında sektörde güçlü bir konum elde ettik. Hastaneler, klinikler ve çeşitli sağlık kuruluşlarında tamamladığımız uygulamalar sayesinde markamız, yüksek ürün kalitesi ve mühendislik yaklaşımıyla anılan bir yapıya kavuşmuştur.

Yıllar içerisinde üretim ve proje faaliyetlerimizin yanı sıra ithalat ve ihracat alanlarında da faaliyet göstererek hizmet ağımızı genişlettik. Ulusal ve uluslararası pazarlarda geliştirdiğimiz iş birlikleriyle ürün ve çözümlerimizi farklı coğrafyalardaki sağlık projelerine ulaştırmaya devam ediyoruz.

Teknik bilgi birikimimiz, deneyimli ekibimiz ve yıllar içerisinde başarıyla tamamladığımız projeler, bugün sahip olduğumuz mühendislik gücünün temelini oluşturmaktadır. Üretimden projelendirmeye, montajdan devreye almaya, satış sonrası teknik destekten periyodik bakım hizmetlerine kadar tüm süreçlerde kalite ve sürekliliği ön planda tutuyoruz.

Amacımız; geçmişten gelen tecrübemizi günümüz teknolojileriyle birleştirerek sağlık sektörüne güvenilir, verimli ve uzun ömürlü çözümler sunmaktır. Sürekli gelişimi esas alan yaklaşımımızla ürün kalitemizi, mühendislik kabiliyetimizi ve hizmet standartlarımızı her geçen gün daha ileriye taşımayı hedefliyoruz.

25 yılı aşkın tecrübemizle, sağlık tesisleri için güvenilir sistemler geliştiriyor; iş ortaklarımıza yalnızca ürün değil, uzun vadeli çözüm ortaklığı sunuyoruz.`,
        imageUrl: "/assets/images/corporate-hero-facility.png",
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Corporate sections seeded");

  console.log("✨ Seed completed!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
