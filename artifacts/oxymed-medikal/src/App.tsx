import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import CorporatePage from "./pages/CorporatePage";
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import ProductsPage from "./pages/ProductsPage";
import QuotePage from "./pages/QuotePage";
import ReferencesPage from "./pages/ReferencesPage";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/kurumsal" element={<CorporatePage />} />
        <Route path="/urunler" element={<ProductsPage />} />
        <Route path="/referanslar" element={<ReferencesPage />} />
        <Route path="/haberler" element={<NewsPage />} />
        <Route path="/teklif-al" element={<QuotePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
