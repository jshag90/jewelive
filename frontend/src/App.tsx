import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Lounge from './pages/Lounge';
import TradeLetter from './pages/TradeLetter';
import MyPage from './pages/MyPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import ProductUpload from './pages/ProductUpload';
import Search from './pages/Search';
import BrandDetail from './pages/BrandDetail';
import Categories from './pages/Categories';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/lounge" element={<Lounge />} />
        <Route path="/letter" element={<TradeLetter />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:id" element={<Categories />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/brand/:id" element={<BrandDetail />} />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <ProductUpload />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
