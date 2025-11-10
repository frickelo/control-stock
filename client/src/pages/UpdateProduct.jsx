// client/src/pages/UpdateProduct.jsx
import React, { useEffect, useState } from 'react';
import { getProductById, updateProduct } from '../services/productService';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    precio_compra: '',
    precio_venta: '',
    stock: 0,
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProductById(id);
        setForm({
          nombre: res.data.nombre || '',
          precio_compra: res.data.precio_compra || 0,
          precio_venta: res.data.precio_venta || 0,
          stock: res.data.stock || 0,
        });
      } catch (err) {
        console.error(err);
        toast.error('Error al obtener producto');
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(id, {
        nombre: form.nombre,
        precio_compra: Number(form.precio_compra),
        precio_venta: Number(form.precio_venta),
      });
      toast.success('Producto actualizado');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error al actualizar');
    }
  };

  return (
    <div className="container my-4">
      <h3>Actualizar Producto</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Precio Compra</label>
          <input name="precio_compra" type="number" className="form-control" value={form.precio_compra} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Precio Venta</label>
          <input name="precio_venta" type="number" className="form-control" value={form.precio_venta} onChange={handleChange} required />
        </div>

        <button type="submit" className="btn btn-primary">Actualizar</button>
      </form>
    </div>
  );
}

export default UpdateProduct;
