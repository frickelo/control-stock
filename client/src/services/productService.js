// client/src/services/productService.js
import api from './api';

// Productos
export const getAllProducts = () => api.get('/products');         // GET /api/products
export const getProductById = (id) => api.get(`/product/${id}`); // GET /api/product/:id
export const createProduct = (productData) => api.post('/product', productData); // POST /api/product
export const updateProduct = (id, productData) => api.put(`/producto/${id}`, productData); // PUT /api/producto/:id
export const deleteProduct = (id) => api.delete(`/producto/${id}`); // DELETE /api/producto/:id
export const searchProducts = (nombre) => api.get(`/productos/buscar?nombre=${encodeURIComponent(nombre)}`);

// Movimientos
export const createMovement = (movementData) => api.post('/movimiento', movementData); // POST /api/movimiento
export const getMovements = (params) => api.get('/movimientos', { params }); // GET /api/movimientos?producto=...&desde=...&hasta=...
