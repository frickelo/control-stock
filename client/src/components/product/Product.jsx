// client/src/components/product/Product.jsx
import React, { useEffect, useState } from 'react';
import { getAllProducts, deleteProduct, createMovement } from '../../services/productService';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function Product() {
  const [products, setProducts] = useState([]);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellQty, setSellQty] = useState(1);

  // Cargar productos
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error cargando productos', err);
      toast.error('Error al cargar productos');
    }
  };

  // Eliminar producto
  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
      try {
        await deleteProduct(id);
        toast.success('Producto eliminado');
        loadProducts();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Error al eliminar');
      }
    }
  };

  // Abrir modal de venta
  const openSellModal = (product) => {
    setSelectedProduct(product);
    setSellQty(1);
    setShowSellModal(true);
  };

  // Registrar venta
  const handleSell = async (e) => {
    e.preventDefault();
    try {
      await createMovement({
        producto: selectedProduct._id,
        tipo: 'salida',
        cantidad: Number(sellQty),
      });
      toast.success('Venta registrada');
      // Actualizar stock localmente (optimista)
      setProducts((prev) =>
        prev.map((p) =>
          p._id === selectedProduct._id
            ? { ...p, stock: p.stock - Number(sellQty) }
            : p
        )
      );
      setShowSellModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error al registrar la venta');
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Productos</h2>

        {/* --> Aquí agregamos el enlace visible a Movimientos y el botón Agregar */}
        <div>
            <Link to="/movements" className="btn btn-secondary me-2">
              <i className="fa-solid fa-clock-rotate-left me-1"></i> Historial stock
            </Link>

            <Link to="/stock-adjust" className="btn btn-outline-primary me-2">
              <i className="fa-solid fa-sliders me-1"></i> Ajustar stock
            </Link>

            <Link to="/add-product" className="btn btn-success">
              <i className="fa-solid fa-plus me-1"></i> Agregar nuevo
            </Link>
          </div>

      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Precio Compra</th>
            <th>Precio Venta</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod, index) => (
            <tr key={prod._id}>
              <td>{index + 1}</td>
              <td>{prod.nombre}</td>
              <td>{prod.precio_compra}</td>
              <td>{prod.precio_venta}</td>
              <td>{prod.stock}</td>
              <td>
                <Link to={`/update-product/${prod._id}`} className="btn btn-warning btn-sm me-2">
                  Editar
                </Link>
                <button onClick={() => handleDelete(prod._id)} className="btn btn-danger btn-sm me-2">
                  Eliminar
                </button>
                <button onClick={() => openSellModal(prod)} className="btn btn-primary btn-sm">
                  Vender
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de venta */}
      {showSellModal && selectedProduct && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleSell}>
              <div className="modal-header">
                <h5 className="modal-title">Vender: {selectedProduct.nombre}</h5>
                <button type="button" className="btn-close" onClick={() => setShowSellModal(false)}></button>
              </div>
              <div className="modal-body">
                <label>Cantidad</label>
                <input
                  type="number"
                  className="form-control"
                  value={sellQty}
                  onChange={(e) => setSellQty(e.target.value)}
                  min="1"
                  max={selectedProduct.stock}
                  required
                />
                <small className="text-muted">Stock disponible: {selectedProduct.stock}</small>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSellModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Confirmar venta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Product;
