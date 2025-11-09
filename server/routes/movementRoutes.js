// server/routes/movementRoutes.js
import express from 'express';
import { createMovement, getMovements } from '../controllers/movementController.js';

const router = express.Router();

// Ruta para registrar un movimiento
router.post('/movimiento', createMovement);
// Obtener todos los movimientos o filtrados
router.get('/movimientos', getMovements);

export default router;
