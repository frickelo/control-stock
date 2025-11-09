// server/controllers/movementController.js
import Movement from '../models/Movement.js';
import Product from '../models/Product.js';

// Crear un nuevo movimiento
export const createMovement = async (req, res) => {
  try {
    const { producto, tipo, cantidad } = req.body;

    const product = await Product.findById(producto);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    let nuevoStock = product.stock;
    if (tipo === 'entrada') {
      nuevoStock += cantidad;
    } else if (tipo === 'salida') {
      if (cantidad > product.stock) {
        return res.status(400).json({ message: 'Stock insuficiente para la salida' });
      }
      nuevoStock -= cantidad;
    } else {
      return res.status(400).json({ message: 'Tipo de movimiento inválido' });
    }

    product.stock = nuevoStock;
    await product.save();

    const newMovement = new Movement({ producto, tipo, cantidad });
    const savedMovement = await newMovement.save();

    res.status(201).json({
      message: 'Movimiento registrado correctamente',
      movimiento: savedMovement,
      producto_actualizado: product,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el movimiento', error: error.message });
  }
};

// ===============================
// LISTAR Y FILTRAR MOVIMIENTOS
// ===============================
export const getMovements = async (req, res) => {
  try {
    const { tipo, desde, hasta, producto } = req.query;
    const filtro = {};

    // Filtro por tipo
    if (tipo) filtro.tipo = tipo;

    // Filtro por producto
    if (producto) filtro.producto = producto;

    // Filtro por rango de fechas
    if (desde || hasta) {
      filtro.createdAt = {};
      if (desde) filtro.createdAt.$gte = new Date(desde);
      if (hasta) filtro.createdAt.$lte = new Date(hasta);
    }

    const movimientos = await Movement.find(filtro)
      .populate('producto', 'nombre precio_venta')
      .sort({ createdAt: -1 });

    return res.status(200).json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    return res.status(500).json({ message: 'Error al obtener los movimientos', error: error.message });
  }
};
