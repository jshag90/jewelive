import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductUpload from './pages/ProductUpload';
// Start by creating index.css, do not import App.css
// import './App.css'; 

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={
          <ProtectedRoute>
            <ProductUpload />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
