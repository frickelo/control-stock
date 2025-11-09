// src/server/controllers/productController.js
import Product from '../models/Product.js';

// Crear un nuevo producto
export const create = async (req, res) => {
  try {
    // Crear un nuevo objeto producto con los datos del body
    const newProduct = new Product(req.body);

    // Extraer el nombre del nuevo producto
    const { nombre } = newProduct;

    // Verificar si el producto ya existe en la base de datos (por nombre)
    const productExist = await Product.findOne({ nombre });
    if (productExist) {
      return res.status(400).json({ message: 'Producto ya existente' });
    }

    // Guardar el nuevo producto en la base de datos
    const savedProduct = await newProduct.save();

    // Responder con el producto creado
    res.status(200).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    // Buscar todos los productos en la base de datos
    const productData = await Product.find();

    // Si no hay productos, devolver mensaje
    if (!productData || productData.length === 0) {
      return res.status(404).json({ message: 'No hay productos registrados' });
    }

    // Enviar los productos encontrados
    return res.status(200).json(productData);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
  try {
    // Extraer el ID de los parámetros de la URL
    const { id } = req.params;

    // Buscar producto por ID
    const product = await Product.findById(id);

    // Si no se encuentra, devolver 404
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Devolver el producto encontrado
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el producto',
      error: error.message,
    });
  }
};

// ===============================
// EDITAR PRODUCTO
// ===============================
export const updateProduct = async (req, res) => {
  try {
    // 1️⃣ Extraer el ID desde la URL
    const { id } = req.params;

    // 2️⃣ Extraer los datos enviados desde el body
    const { nombre, precio_compra, precio_venta } = req.body;

    // 3️⃣ Buscar el producto en la base de datos
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // 4️⃣ Actualizar solo los campos permitidos
    if (nombre) product.nombre = nombre;
    if (precio_compra) product.precio_compra = precio_compra;
    if (precio_venta) product.precio_venta = precio_venta;

    // 5️⃣ Guardar los cambios en la base de datos
    const updatedProduct = await product.save();

    // 6️⃣ Responder con el producto actualizado
    res.status(200).json({
      message: 'Producto actualizado correctamente',
      producto: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

// ===============================
// ELIMINAR PRODUCTO (solo si stock = 0)
// ===============================
export const deleteProduct = async (req, res) => {
  try {
    // 1️⃣ Extraer el ID desde la URL
    const { id } = req.params;

    // 2️⃣ Buscar el producto
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // 3️⃣ Verificar si el stock es 0 antes de eliminar
    if (product.stock > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar el producto mientras tenga stock'
      });
    }

    // 4️⃣ Eliminar el producto
    await Product.findByIdAndDelete(id);

    // 5️⃣ Confirmar eliminación
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};

// ===============================
// BUSCAR PRODUCTOS POR NOMBRE
// ===============================
export const searchProducts = async (req, res) => {
  try {
    // 1️⃣ Extraer el término de búsqueda desde los parámetros de la URL
    const { nombre } = req.query;

    // 2️⃣ Si no se envía ningún nombre, devolver todos los productos
    if (!nombre) {
      const allProducts = await Product.find();
      return res.status(200).json(allProducts);
    }

    // 3️⃣ Buscar productos cuyo nombre contenga el texto (sin distinción de mayúsculas)
    const products = await Product.find({
      nombre: { $regex: nombre, $options: 'i' },
    });

    // 4️⃣ Si no se encuentra ninguno, devolver mensaje
    if (products.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos con ese nombre' });
    }

    // 5️⃣ Devolver los resultados
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar productos', error: error.message });
  }
};

