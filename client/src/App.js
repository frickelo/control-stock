// client/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Product from './components/product/Product';
import Movement from './components/movement/Movement';
import AddProduct from './pages/AddProduct';
import UpdateProduct from './pages/UpdateProduct';
import StockAdjust from './components/movement/StockAdjust';
import MovementHistory from './components/movement/MovementHistory';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <div className="min-vh-100" style={{ backgroundColor: '#f0f8ff', padding: 20 }}>
        <Routes>
          <Route path="/" element={<Product />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/update-product/:id" element={<UpdateProduct />} />
          <Route path="/stock-adjust" element={<StockAdjust />} />      {/* formulario de ajuste */}
          <Route path="/movements" element={<MovementHistory />} />     {/* historial solo lectura */}
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
