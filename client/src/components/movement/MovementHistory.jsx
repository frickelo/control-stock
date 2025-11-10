// client/src/components/movement/MovementHistory.jsx
import React, { useEffect, useState } from 'react';
import { getMovements, getAllProducts } from '../../services/productService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function MovementHistory() {
  const [movements, setMovements] = useState([]);
  const [filters, setFilters] = useState({ tipo: '', rango: 'mes', producto: '' });
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchMovements();
    // eslint-disable-next-line
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts();
      setProductos(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar productos');
    }
  };

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const { tipo, rango, producto } = filters;
      // calcular fecha desde
      let desde = null;
      const ahora = new Date();
      switch (rango) {
        case 'dia':
          desde = new Date(); desde.setHours(0,0,0,0); break;
        case 'semana':
          desde = new Date(); desde.setDate(desde.getDate()-7); desde.setHours(0,0,0,0); break;
        case 'mes':
          desde = new Date(); desde.setMonth(desde.getMonth()-1); desde.setHours(0,0,0,0); break;
        case 'anio':
          desde = new Date(); desde.setFullYear(desde.getFullYear()-1); desde.setHours(0,0,0,0); break;
        default: desde = null;
      }

      const params = {};
      if (tipo) params.tipo = tipo;
      if (producto) params.producto = producto;
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Registro de cambios de stock</h3>
        <div>
          <Link to="/" className="btn btn-light me-2">Productos</Link>
          <Link to="/stock-adjust" className="btn btn-outline-primary">Ajustar stock</Link>
        </div>
      </div>

      {/* filtros */}
      <div className="mb-3 row g-2 align-items-end">
        <div className="col-auto">
          <label className="form-label small">Tipo</label>
          <select name="tipo" className="form-select" value={filters.tipo} onChange={handleFilterChange}>
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </div>

        <div className="col-auto">
          <label className="form-label small">Producto</label>
          <select name="producto" className="form-select" value={filters.producto} onChange={handleFilterChange}>
            <option value="">Todos</option>
            {productos.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
          </select>
        </div>

        <div className="col-auto">
          <label className="form-label small">Rango</label>
          <select name="rango" className="form-select" value={filters.rango} onChange={handleFilterChange}>
            <option value="dia">Hoy</option>
            <option value="semana">Última semana</option>
            <option value="mes">Último mes</option>
            <option value="anio">Último año</option>
          </select>
        </div>
      </div>

      {/* tabla */}
      {loading ? (
        <div className="p-3">Cargando movimientos...</div>
      ) : (
        <div className="table-responsive">
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
              ) : movements.map((m, i) => (
                <tr key={m._id}>
                  <td>{i + 1}</td>
                  <td>{m.tipo}</td>
                  <td>{m.producto?.nombre || m.producto}</td>
                  <td>{m.cantidad}</td>
                  <td>{m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
