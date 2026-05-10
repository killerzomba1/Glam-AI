import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from '@/lib/LanguageContext';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/home/HomePage';
import GlamPage from '@/pages/glam/GlamPage';
import SavedPage from '@/pages/saved/SavedPage';
import ProductsPage from '@/pages/products/ProductsPage';
import SettingsPage from '@/pages/settings/SettingsPage';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index            element={<HomePage />}     />
            <Route path="/glam"     element={<GlamPage />}     />
            <Route path="/saved"    element={<SavedPage />}    />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
