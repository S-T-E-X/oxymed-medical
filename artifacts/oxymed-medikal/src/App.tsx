import { type ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./admin/AuthContext";
import CookieBanner from "./components/common/CookieBanner";
import VisitorTracker from "./components/common/VisitorTracker";
import RouteTransitionLoader from "./components/common/RouteTransitionLoader";
import AdminLayout, { ProtectedRoute } from "./admin/AdminLayout";
import LoginPage from "./admin/LoginPage";
import DashboardPage from "./admin/DashboardPage";
import SlidersPage from "./admin/SlidersPage";
import AdminProductsPage from "./admin/ProductsPage";
import ProductEditPage from "./admin/ProductEditPage";
import AdminNewsPage from "./admin/NewsPage";
import AdminReferencesPage from "./admin/ReferencesPage";
import AdminCorporatePage from "./admin/CorporatePage";
import SettingsPage from "./admin/SettingsPage";
import QuotesPage from "./admin/QuotesPage";
import MediaPage from "./admin/MediaPage";
import CatalogsPage from "./admin/CatalogsPage";
import AdminCertificatesPage from "./admin/CertificatesPage";
import ProductStockPage from "./admin/ProductStockPage";
import MaterialStockPage from "./admin/MaterialStockPage";
import QuoteFormsPage from "./admin/QuoteFormsPage";
import QuoteFormEditPage from "./admin/QuoteFormEditPage";
import GasControlPanelAdminPage from "./admin/GasControlPanelAdminPage";
import WarrantyPage from "./admin/WarrantyPage";
import WarrantyDeviceDetailPage from "./admin/WarrantyDeviceDetailPage";
import ProductionPage from "./admin/ProductionPage";
import ProductionDetailPage from "./admin/ProductionDetailPage";
import RecetePage from "./admin/RecetePage";
import ServisRaporlariPage from "./admin/ServisRaporlariPage";
import ServisRaporuFormPage from "./admin/ServisRaporuFormPage";
import AdminEmailLogsPage from "./admin/AdminEmailLogsPage";
import AdminUsersPage from "./admin/AdminUsersPage";
import PageBannersPage from "./admin/PageBannersPage";
import AmalgamSeparatorAdminPage from "./admin/AmalgamSeparatorAdminPage";
import DentalVacuumPumpAdminPage from "./admin/DentalVacuumPumpAdminPage";
import DentalVacuumSystemAdminPage from "./admin/DentalVacuumSystemAdminPage";
import AmalgamSeparatorPage from "./pages/AmalgamSeparatorPage";
import DentalVacuumPumpPage from "./pages/DentalVacuumPumpPage";
import DentalVacuumSystemPage from "./pages/DentalVacuumSystemPage";
import ServisCihazPage from "./pages/ServisCihazPage";
import ServisRaporDogrulamaPage from "./pages/ServisRaporDogrulamaPage";
import QuotePrintPage from "./pages/QuotePrintPage";
import CorporatePage from "./pages/CorporatePage";
import CertificatesPage from "./pages/CertificatesPage";
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import ProductsPage from "./pages/ProductsPage";
import QuotePage from "./pages/QuotePage";
import ReferencesPage from "./pages/ReferencesPage";
import ServicePage from "./pages/ServicePage";
import ServiceReportPageTaslak from "./pages/ServiceReportPageTaslak";
import DeviceQrPage from "./pages/DeviceQrPage";
import ServiceReportPage from "./pages/ServiceReportPage";
import GasControlPanelPage from "./pages/GasControlPanelPage";
import QuoteTemplatePage from "./pages/QuoteTemplatePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { I18nProvider } from "./i18n/I18nProvider";
import LocaleSuggestion from "./i18n/LocaleSuggestion";
import { LOCALES } from "./i18n/config";
import { localizedPath, type RouteKey } from "./i18n/routes";

/** The marketing pages that exist in every language. */
const TRANSLATED_PAGES: Array<{ routeKey: RouteKey; element: ReactElement }> = [
  { routeKey: "home", element: <HomePage /> },
  { routeKey: "products", element: <ProductsPage /> },
  { routeKey: "gcp", element: <GasControlPanelPage /> },
  { routeKey: "ams", element: <AmalgamSeparatorPage /> },
  { routeKey: "dvp", element: <DentalVacuumPumpPage /> },
  { routeKey: "dvs", element: <DentalVacuumSystemPage /> },
  { routeKey: "service", element: <ServicePage /> },
  { routeKey: "quote", element: <QuotePage /> },
  // News list page is translated; detail routes are registered separately
  // because they carry a dynamic :slug segment.
  { routeKey: "news", element: <NewsPage /> },
];

/**
 * One route per language per translated page. Turkish keeps its original
 * unprefixed URLs, so existing links and search results stay valid.
 */
function localizedRoutes() {
  return LOCALES.flatMap((locale) =>
    TRANSLATED_PAGES.map(({ routeKey, element }) => {
      const path = localizedPath(routeKey, locale);
      return <Route key={`${locale}-${routeKey}`} path={path} element={element} />;
    }),
  );
}

/** Serial-number deep links into the service page, per language. */
function localizedServiceSerialRoutes() {
  return LOCALES.map((locale) => (
    <Route
      key={`${locale}-service-serial`}
      path={`${localizedPath("service", locale)}/:serialNo`}
      element={<ServicePage />}
    />
  ));
}

/**
 * Article detail routes for every locale. Each locale uses its own news
 * segment (e.g. /haberler/:slug for tr, /en/news/:slug for en).
 * Turkish detail route reuses the unprefixed /haberler/:slug so existing
 * indexed URLs stay valid.
 */
function localizedNewsDetailRoutes() {
  return LOCALES.map((locale) => (
    <Route
      key={`${locale}-news-detail`}
      path={`${localizedPath("news", locale)}/:slug`}
      element={<NewsDetailPage />}
    />
  ));
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <I18nProvider>
        <AuthProvider>
          <Toaster richColors position="top-right" />
          <VisitorTracker />
          <CookieBanner />
          <LocaleSuggestion />
          <RouteTransitionLoader />
          <Routes>
          {localizedRoutes()}
          {localizedNewsDetailRoutes()}
          <Route path="/kurumsal" element={<CorporatePage />} />
           <Route path="/sertifikalar" element={<CertificatesPage />} />
          <Route path="/referanslar" element={<ReferencesPage />} />
          <Route path="/taslak" element={<ServiceReportPageTaslak />} />
          <Route path="/servis/qr/:qrToken" element={<DeviceQrPage />} />
          <Route path="/servis/cihaz/:qrToken" element={<ServisCihazPage />} />
          <Route path="/servis/rapor/:verificationToken" element={<ServisRaporDogrulamaPage />} />
          {localizedServiceSerialRoutes()}
          <Route path="/servis-raporu/:recordId" element={<ServiceReportPage />} />
          <Route path="/servis-raporu" element={<ServiceReportPage />} />
          <Route path="/urunler/:slug" element={<ProductDetailPage />} />
          <Route path="/teklif-sablonu" element={<QuoteTemplatePage />} />
          <Route path="/teklif-goruntule/:id" element={<QuotePrintPage />} />

          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="sliders" element={<SlidersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<ProductEditPage />} />
            <Route path="products/:id" element={<ProductEditPage />} />
            <Route path="haberler" element={<AdminNewsPage />} />
            <Route path="referanslar" element={<AdminReferencesPage />} />
            <Route path="kurumsal" element={<AdminCorporatePage />} />
            <Route path="sertifikalar" element={<AdminCertificatesPage />} />
            <Route path="ayarlar" element={<SettingsPage />} />
            <Route path="teklifler" element={<QuotesPage />} />
            <Route path="medya" element={<MediaPage />} />
            <Route path="kataloglar" element={<CatalogsPage />} />
            <Route path="stok/urunler" element={<ProductStockPage />} />
            <Route path="stok/malzeme" element={<MaterialStockPage />} />
            <Route path="teklif-formlari" element={<QuoteFormsPage />} />
            <Route path="teklif-formlari/:id" element={<QuoteFormEditPage />} />
            <Route path="kat-kontrol-panosu" element={<GasControlPanelAdminPage />} />
            <Route path="garanti" element={<WarrantyPage />} />
            <Route path="garanti/:id" element={<WarrantyDeviceDetailPage />} />
            <Route path="uretim" element={<ProductionPage />} />
            <Route path="uretim/:id" element={<ProductionDetailPage />} />
            <Route path="recete" element={<RecetePage />} />
            <Route path="servis-raporlari" element={<ServisRaporlariPage />} />
            <Route path="servis-raporlari/yeni" element={<ServisRaporuFormPage />} />
            <Route path="servis-raporlari/:id" element={<ServisRaporuFormPage />} />
            <Route path="eposta-loglari" element={<AdminEmailLogsPage />} />
            <Route path="email-logs" element={<AdminEmailLogsPage />} />
            <Route path="kullanicilar" element={<AdminUsersPage />} />
            <Route path="sayfa-bannerlari" element={<PageBannersPage />} />
            <Route path="urunler/amalgam-separator" element={<AmalgamSeparatorAdminPage />} />
            <Route path="urunler/dental-vakum-pompasi" element={<DentalVacuumPumpAdminPage />} />
            <Route path="urunler/dental-vakum-sistemi" element={<DentalVacuumSystemAdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
