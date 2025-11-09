import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
  },
  precio_compra: {
    type: Number,
    required: [true, 'El precio de compra es obligatorio'],
    min: [0, 'El precio de compra no puede ser negativo'],
  },
  precio_venta: {
    type: Number,
    required: [true, 'El precio de venta es obligatorio'],
    min: [0, 'El precio de venta no puede ser negativo'],
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'El stock no puede ser negativo'],
  },
});

export default mongoose.model('Product', productSchema);
