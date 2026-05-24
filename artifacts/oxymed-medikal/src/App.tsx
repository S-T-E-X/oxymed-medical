import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./admin/AuthContext";
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
import ProductStockPage from "./admin/ProductStockPage";
import MaterialStockPage from "./admin/MaterialStockPage";
import CorporatePage from "./pages/CorporatePage";
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import ProductsPage from "./pages/ProductsPage";
import QuotePage from "./pages/QuotePage";
import ReferencesPage from "./pages/ReferencesPage";
import ServicePage from "./pages/ServicePage";
import ServiceReportPage from "./pages/ServiceReportPage";
import GasControlPanelPage from "./pages/GasControlPanelPage";
import QuoteTemplatePage from "./pages/QuoteTemplatePage";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/kurumsal" element={<CorporatePage />} />
          <Route path="/urunler" element={<ProductsPage />} />
          <Route path="/referanslar" element={<ReferencesPage />} />
          <Route path="/haberler" element={<NewsPage />} />
          <Route path="/haberler/:slug" element={<NewsDetailPage />} />
          <Route path="/teklif-al" element={<QuotePage />} />
          <Route path="/servis" element={<ServicePage />} />
          <Route path="/servis-raporu" element={<ServiceReportPage />} />
          <Route path="/urunler/kat-kontrol-panosu" element={<GasControlPanelPage />} />
          <Route path="/teklif-sablonu" element={<QuoteTemplatePage />} />

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
            <Route path="ayarlar" element={<SettingsPage />} />
            <Route path="teklifler" element={<QuotesPage />} />
            <Route path="medya" element={<MediaPage />} />
            <Route path="kataloglar" element={<CatalogsPage />} />
            <Route path="stok/urunler" element={<ProductStockPage />} />
            <Route path="stok/malzeme" element={<MaterialStockPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
