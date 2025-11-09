// src/server/routes/productRoutes.js
import express from 'express';
import { create, getAllProducts, getProductById, updateProduct, deleteProduct, searchProducts } from '../controllers/productController.js';

const router = express.Router();

// Ruta para crear un nuevo producto
router.post('/product', create);

// Ruta para obtener todos los productos
router.get('/products', getAllProducts);

// Ruta para obtener un producto por su ID
router.get('/product/:id', getProductById);

// ✅ Actualizar producto
router.put('/producto/:id', updateProduct);

// ✅ Eliminar producto (solo si stock = 0)
router.delete('/producto/:id', deleteProduct);

// Buscar productos por nombre
router.get('/productos/buscar', searchProducts);

export default router;
