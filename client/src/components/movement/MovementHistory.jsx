// client/src/components/movement/MovementHistory.jsx
import React, { useEffect, useState } from 'react';
import { getMovements, getAllProducts } from '../../services/productService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      let desde = null;
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

  // ---------- Exportar PDF (con paginado) ----------
  const exportarPDF = (movimientos, options = { mode: 'auto', rowsPerPage: 25 }) => {
    // options.mode: 'auto' (autopagination) | 'chunk' (forzar X filas por página)
    // options.rowsPerPage: numero de filas por pagina si usas 'chunk'
    const doc = new jsPDF('p', 'pt'); // unidades en puntos (pt)
    const title = 'Registro de cambios de stock';
    doc.setFontSize(14);
    doc.text(title, 40, 40);

    const head = [['#', 'Tipo', 'Producto', 'Cantidad', 'Fecha']];

    const body = movimientos.map((m, i) => [
      i + 1,
      m.tipo,
      m.producto?.nombre || (m.producto || ''),
      m.cantidad,
      m.createdAt ? new Date(m.createdAt).toLocaleString() : ''
    ]);

    const marginTop = 60; // espacio superior para título
    const marginBottom = 40; // dejar sitio para footer

    if (options.mode === 'chunk') {
      // --- ENFOQUE B: chunk manual: forzar rowsPerPage por tabla ---
      const rowsPerPage = options.rowsPerPage || 25;
      // chunkear body en arrays de tamaño rowsPerPage
      const chunks = [];
      for (let i = 0; i < body.length; i += rowsPerPage) {
        chunks.push(body.slice(i, i + rowsPerPage));
      }

      chunks.forEach((chunk, idx) => {
        if (idx > 0) doc.addPage();
        autoTable(doc, {
          startY: marginTop,
          head: head,
          body: chunk,
          margin: { left: 40, right: 40, bottom: marginBottom },
          styles: { fontSize: 10 },
          headStyles: { fillColor: [40, 40, 40] },
        });
      });

    } else {
      // --- ENFOQUE A (recomendado): dejar que autoTable haga el paginado ---
      autoTable(doc, {
        startY: marginTop,
        head: head,
        body: body,
        margin: { left: 40, right: 40, bottom: marginBottom },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [40, 40, 40] },
        // autoTable paginará automáticamente si no cabe en la página
      });
    }

    // --- Añadir numeración de páginas en el footer ---
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageStr = `Página ${i} de ${pageCount}`;
      doc.text(pageStr, pageWidth / 2, pageHeight - 15, { align: 'center' });
    }

    // Guardar/descargar PDF
    doc.save('historial_movimientos.pdf');
  };
  // -----------------------------------

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Registro de cambios de stock</h3>
        <div>
          <Link to="/" className="btn btn-light me-2">Productos</Link>
          <Link to="/stock-adjust" className="btn btn-outline-primary me-2">Ajustar stock</Link>

          {/* Botón para descargar PDF: por defecto usa modo 'auto' */}
          <button className="btn btn-outline-success me-2" onClick={() => exportarPDF(movements, { mode: 'auto' })}>
            <i className="fa-solid fa-file-pdf me-1"></i> Descargar PDF
          </button>

          {/* Si quieres forzar X filas por página, usa mode: 'chunk' y rowsPerPage: N
              <button onClick={() => exportarPDF(movements, { mode: 'chunk', rowsPerPage: 25 })}>PDF 25/pg</button>
          */}
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
