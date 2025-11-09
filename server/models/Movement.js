// server/models/Movement.js
import mongoose from 'mongoose';

// Definir el esquema de Movimiento
const movementSchema = new mongoose.Schema({
  // Relación con el producto (referencia al modelo Product)
   producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  tipo: {
    type: String,
    enum: ['entrada', 'salida'],
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1,
  },
}, { timestamps: true });

// Exportar el modelo Movement
export default mongoose.model('Movement', movementSchema);
