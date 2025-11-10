// client/src/pages/AddProduct.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProduct, createMovement } from '../services/productService'; // ⬅️ importamos createMovement

function AddProduct() {
  const [form, setForm] = useState({
    nombre: '',
    precio_compra: '',
    precio_venta: '',
    stock: '',
  });

  const navigate = useNavigate();

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Guardar producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Crear el producto
      const res = await createProduct({
        ...form,
        precio_compra: Number(form.precio_compra),
        precio_venta: Number(form.precio_venta),
        stock: Number(form.stock),
      });

      // ✅ Si tiene stock inicial, registrar movimiento de entrada
      if (Number(form.stock) > 0) {
        await createMovement({
          producto: res.data._id || res.data._doc?._id, // depende de lo que devuelva tu backend
          tipo: 'entrada',
          cantidad: Number(form.stock),
        });
      }

      toast.success('Producto agregado correctamente');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Error al agregar producto');
    }
  };

  return (
    <div className="container">
      <h2 className="mb-3">Agregar Producto</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre</label>
          <input type="text" className="form-control" name="nombre" onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>Precio Compra</label>
          <input type="number" className="form-control" name="precio_compra" onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>Precio Venta</label>
          <input type="number" className="form-control" name="precio_venta" onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>Stock inicial</label>
          <input type="number" className="form-control" name="stock" onChange={handleChange} required />
        </div>

        <button type="submit" className="btn btn-primary">Guardar</button>
      </form>
    </div>
  );
}

export default AddProduct;
