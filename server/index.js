// ================================
// Importar dependencias principales
// ================================
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

// Importar las rutas de productos y movimientos
import productRoutes from './routes/productRoutes.js';
import movementRoutes from './routes/movementRoutes.js'; // ✅ Importar las rutas de movimientos

// ================================
// Configurar variables de entorno
// ================================
dotenv.config(); 
// 👉 Esto carga las variables definidas en tu archivo .env
// (por ejemplo PORT y MONGO_URL)

// ================================
// Crear la aplicación Express
// ================================
const app = express();

// ================================
// Middlewares (procesadores intermedios)
// ================================

// body-parser convierte el contenido del body (JSON o formulario) 
// en objetos JavaScript accesibles desde req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// ================================
// Variables del entorno
// ================================
const PORT = process.env.PORT || 8000;
const URL = process.env.MONGO_URL;

// ================================
// Rutas básicas
// ================================

// Ruta de prueba simple para verificar el servidor
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente ✅');
});

// Registrar las rutas con prefijo /api
app.use('/api', productRoutes);   // ✅ Rutas de productos
app.use('/api', movementRoutes);  // ✅ Rutas de movimientos

// ================================
// Conexión con MongoDB usando Mongoose
// ================================
mongoose
  .connect(URL)
  .then(() => {
    console.log('✅ DB connected successfully');
    
    // Iniciar el servidor solo después de conectar la base de datos
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar a la base de datos:', err);
  });
