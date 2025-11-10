// client/src/components/movement/Movement.jsx
import React, { useEffect, useState } from 'react';
// --- ADDED: import getAllProducts para cargar lista de productos ---
import { getMovements, createMovement, getAllProducts } from '../../services/productService';
import toast from 'react-hot-toast';
import './Movement.css';

function Movement() {
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({
    tipo: 'entrada',
    producto: '',
    cantidad: 0,
  });

  // --- ADDED: estado para lista de productos (se usa en el <select>) ---
  const [productos, setProductos] = useState([]);

  const [filters, setFilters] = useState({
    tipo: '',
    rango: 'mes',
  });
  const [loading, setLoading] = useState(true);

  // --- ADDED: cargar productos una vez al montar ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getAllProducts();
        setProductos(res.data || []);
      } catch (err) {
        console.error('Error cargando productos', err);
        toast.error('Error al cargar productos');
      }
    };
    fetchProducts();
  }, []);

  // fetchMovements se ejecuta cuando cambian los filtros
  useEffect(() => {
    fetchMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const { tipo, rango } = filters;
      const ahora = new Date();
      let desde = null;

      // Determina la fecha "desde" según el rango seleccionado
      switch (rango) {
        case 'dia':
          desde = new Date();
          desde.setHours(0, 0, 0, 0);
          break;
        case 'semana':
          desde = new Date();
          desde.setDate(desde.getDate() - 7);
          desde.setHours(0, 0, 0, 0);
          break;
        case 'mes':
          desde = new Date();
          desde.setMonth(desde.getMonth() - 1);
          desde.setHours(0, 0, 0, 0);
          break;
        case 'anio':
          desde = new Date();
          desde.setFullYear(desde.getFullYear() - 1);
          desde.setHours(0, 0, 0, 0);
          break;
        default:
          desde = null;
      }

      const params = {};
      if (tipo) params.tipo = tipo;
      if (desde) params.desde = desde.toISOString();

      const res = await getMovements(params);
      setMovements(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al obtener movimientos');
    } finally {
      setLoading(false);
    }
  };

  // Manejador del formulario (registro de movimiento)
  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Manejador para los filtros
  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMovement({
        tipo: form.tipo,
        producto: form.producto,
        cantidad: Number(form.cantidad),
      });
      toast.success('Movimiento registrado');
      setForm({ tipo: 'entrada', producto: '', cantidad: 0 });
      fetchMovements();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error al registrar movimiento');
    }
  };

  return (
    <div className="container my-4">
      <h3>Historial de Movimientos</h3>

      {/* --- Formulario para registrar --- */}
      <form onSubmit={handleSubmit} className="mb-4" style={{ maxWidth: 600 }}>
        <div className="mb-3">
          <label className="form-label">Tipo</label>
          <select name="tipo" className="form-select" value={form.tipo} onChange={handleChangeForm}>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </div>

        {/* --- REEMPLAZADO: input por select de productos --- */}
        <div className="mb-3">
          <label className="form-label">Producto</label>
          <select
            name="producto"
            className="form-select"
            value={form.producto}
            onChange={handleChangeForm} // <-- USAR handleChangeForm (no handleChange)
            required
          >
            <option value="">Seleccione un producto</option>
            {productos.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Cantidad</label>
          <input
            type="number"
            name="cantidad"
            className="form-control"
            value={form.cantidad}
            onChange={handleChangeForm}
            min="1"
            required
          />
        </div>

        <button className="btn btn-primary">Registrar Movimiento</button>
      </form>

      {/* --- Filtros --- */}
      <div className="mb-4 d-flex gap-3">
        <div>
          <label className="form-label">Filtrar por tipo</label>
          <select name="tipo" className="form-select" value={filters.tipo} onChange={handleChangeFilter}>
            <option value="">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
          </select>
        </div>
        <div>
          <label className="form-label">Rango de tiempo</label>
          <select name="rango" className="form-select" value={filters.rango} onChange={handleChangeFilter}>
            <option value="dia">Hoy</option>
            <option value="semana">Última semana</option>
            <option value="mes">Último mes</option>
            <option value="anio">Último año</option>
          </select>
        </div>
      </div>

      {/* --- Tabla de resultados --- */}
      {loading ? (
        <div className="p-3">Cargando movimientos...</div>
      ) : (
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr><td colSpan="5" className="text-center">No hay movimientos</td></tr>
            ) : (
              movements.map((m, i) => (
                <tr key={m._id}>
                  <td>{i + 1}</td>
                  <td>{m.tipo}</td>
                  <td>{m.producto?.nombre || m.producto}</td>
                  <td>{m.cantidad}</td>
                  <td>{m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Movement;
