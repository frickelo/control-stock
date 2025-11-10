// client/src/components/movement/StockAdjust.jsx
import React, { useEffect, useState } from 'react';
import { createMovement, getAllProducts } from '../../services/productService';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export default function StockAdjust() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ tipo: 'entrada', producto: '', cantidad: 1 });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getAllProducts();
        setProductos(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar productos');
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMovement({
        tipo: form.tipo,
        producto: form.producto,
        cantidad: Number(form.cantidad),
      });
      toast.success('Ajuste registrado correctamente');
      setForm({ tipo: 'entrada', producto: '', cantidad: 1 });
      // redirigir al historial si quieres:
      navigate('/movements');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error al registrar ajuste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Ajuste de stock</h3>
        <div>
          <Link to="/" className="btn btn-light me-2">Volver a Productos</Link>
          <Link to="/movements" className="btn btn-outline-secondary">Ver Historial</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div className="mb-3">
          <label className="form-label">Tipo</label>
          <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange}>
            <option value="entrada">Entrada (sumar)</option>
            <option value="salida">Salida (restar / venta)</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Producto</label>
          <select name="producto" className="form-select" value={form.producto} onChange={handleChange} required>
            <option value="">Seleccionar producto</option>
            {productos.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Cantidad</label>
          <input
            type="number"
            name="cantidad"
            min="1"
            className="form-control"
            value={form.cantidad}
            onChange={handleChange}
            required
          />
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar ajuste'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setForm({ tipo: 'entrada', producto: '', cantidad: 1 })}>
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
