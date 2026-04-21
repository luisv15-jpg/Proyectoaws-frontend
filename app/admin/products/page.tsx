'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Product } from '@/types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import toast from 'react-hot-toast';
import Link from 'next/link';
import styles from './page.module.css';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: 0,
    categoria: '',
    subcategoria: '',
    imagen_principal: '',
    tallas: '',
    colores: '',
  });

  const [editForm, setEditForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: 0,
    categoria: '',
    subcategoria: '',
    imagen_principal: '',
    tallas: '',
    colores: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/admin/all');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!createForm.nombre || !createForm.precio || !createForm.categoria) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    try {
      const productData = {
        nombre: createForm.nombre,
        descripcion: createForm.descripcion || undefined,
        precio: parseFloat(createForm.precio),
        stock: createForm.stock,
        categoria: createForm.categoria,
        subcategoria: createForm.subcategoria || undefined,
        imagen_principal: createForm.imagen_principal || undefined,
        tallas: createForm.tallas ? createForm.tallas.split(',').map(t => t.trim()) : [],
        colores: createForm.colores ? createForm.colores.split(',').map(c => c.trim()) : [],
      };

      await api.post('/products', productData);
      toast.success('Producto creado exitosamente');
      setCreateDialogVisible(false);
      setCreateForm({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: 0,
        categoria: '',
        subcategoria: '',
        imagen_principal: '',
        tallas: '',
        colores: '',
      });
      setImagePreview(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear producto');
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: product.precio.toString(),
      stock: product.stock,
      categoria: product.categoria,
      subcategoria: product.subcategoria || '',
      imagen_principal: product.imagen_principal || '',
      tallas: product.tallas?.join(', ') || '',
      colores: product.colores?.join(', ') || '',
    });
    setImagePreview(product.imagen_principal || null);
    setEditDialogVisible(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const productData = {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion || undefined,
        precio: parseFloat(editForm.precio),
        stock: editForm.stock,
        categoria: editForm.categoria,
        subcategoria: editForm.subcategoria || undefined,
        imagen_principal: editForm.imagen_principal || undefined,
        tallas: editForm.tallas ? editForm.tallas.split(',').map(t => t.trim()) : [],
        colores: editForm.colores ? editForm.colores.split(',').map(c => c.trim()) : [],
      };

      await api.put(`/products/${selectedProduct?.id}`, productData);
      toast.success('Producto actualizado');
      setEditDialogVisible(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    confirmDialog({
      message: `¿Mover "${product.nombre}" a la papelera?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, mover',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await api.patch(`/products/${product.id}/soft-delete`);
          toast.success('Producto movido a la papelera');
          fetchProducts();
        } catch (error) {
          toast.error('Error al mover producto');
        }
      }
    });
  };

  const handleRestoreProduct = (product: Product) => {
    confirmDialog({
      message: `¿Restaurar "${product.nombre}"?`,
      header: 'Confirmar restauración',
      icon: 'pi pi-refresh',
      acceptLabel: 'Sí, restaurar',
      acceptClassName: 'p-button-success',
      accept: async () => {
        try {
          await api.patch(`/products/${product.id}/restore`);
          toast.success('Producto restaurado');
          fetchProducts();
        } catch (error) {
          toast.error('Error al restaurar');
        }
      }
    });
  };

  const stockBody = (rowData: Product) => {
    const stock = rowData.stock;
    if (stock === 0) return <Tag value="Agotado" severity="danger" className={styles.stockTag} />;
    if (stock < 10) return <Tag value={`Stock bajo: ${stock}`} severity="warning" className={styles.stockTagWarning} />;
    return <Tag value={stock} severity="info" className={styles.stockTagOk} />;
  };

  const priceBody = (rowData: Product) => {
    return `S/ ${parseFloat(rowData.precio as string).toFixed(2)}`;
  };

  const statusBody = (rowData: Product) => {
    if (rowData.deletedAt) {
      return <Tag value="Eliminado" severity="danger" className={styles.statusTag} />;
    }
    return rowData.activo ? (
      <Tag value="Activo" severity="success" className={styles.statusTagActive} />
    ) : (
      <Tag value="Inactivo" severity="secondary" className={styles.statusTagInactive} />
    );
  };

  const imageBody = (rowData: Product) => {
    if (!rowData.imagen_principal) {
      return <div className={styles.imagePlaceholder}><i className="pi pi-image"></i></div>;
    }
    return (
      <img
        src={rowData.imagen_principal}
        alt={rowData.nombre}
        className={styles.productImage}
      />
    );
  };

  const dateBody = (rowData: Product) => {
    return new Date(rowData.createdAt).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const actionBody = (rowData: Product) => {
    return (
      <div className={styles.actions}>
        <button
          className={styles.editBtn}
          onClick={() => handleEditProduct(rowData)}
          title="Editar producto"
        >
          <i className="pi pi-pencil"></i>
        </button>
        {rowData.deletedAt ? (
          <button
            className={styles.restoreBtn}
            onClick={() => handleRestoreProduct(rowData)}
            title="Restaurar producto"
          >
            <i className="pi pi-refresh"></i>
          </button>
        ) : (
          <button
            className={styles.deleteBtn}
            onClick={() => handleDeleteProduct(rowData)}
            title="Mover a papelera"
          >
            <i className="pi pi-trash"></i>
          </button>
        )}
      </div>
    );
  };

  const deletedProductsCount = products.filter(p => p.deletedAt).length;

  const header = (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <div className={styles.titleIcon}>
          <i className="pi pi-box"></i>
        </div>
        <div>
          <h2>Gestión de Productos</h2>
          <p className={styles.subtitle}>Administra el catálogo de productos</p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => setCreateDialogVisible(true)}
        >
          <i className="pi pi-plus"></i>
          Nuevo Producto
        </button>
        <Link href="/admin/trash/products" className={styles.trashLink}>
          <i className="pi pi-trash"></i>
          Papelera
          {deletedProductsCount > 0 && (
            <span className={styles.trashBadge}>{deletedProductsCount}</span>
          )}
        </Link>
      </div>
      <div className={styles.searchSection}>
        <i className="pi pi-search"></i>
        <InputText
          type="search"
          placeholder="Buscar producto por nombre..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className={styles.searchInput}
        />
      </div>
    </div>
  );

  const activeProducts = products.filter(p => !p.deletedAt);

  return (
    <div className={styles.container}>
      <ConfirmDialog />
      <DataTable
        value={activeProducts}
        loading={loading}
        globalFilter={globalFilter}
        header={header}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="No hay productos registrados"
        className={styles.table}
        tableStyle={{ minWidth: '70rem' }}
      >
        <Column field="nombre" header="Producto" sortable />
        <Column field="categoria" header="Categoría" sortable style={{ width: '130px' }} />
        <Column field="precio" header="Precio" body={priceBody} sortable style={{ width: '100px' }} />
        <Column field="stock" header="Stock" body={stockBody} sortable style={{ width: '120px' }} />
        <Column field="activo" header="Estado" body={statusBody} sortable style={{ width: '110px' }} />
        <Column field="createdAt" header="Registro" body={dateBody} sortable style={{ width: '110px' }} />
        <Column body={actionBody} header="Acciones" style={{ width: '100px' }} />
      </DataTable>

      {/* Dialog de creación */}
      <Dialog
        header="Nuevo Producto"
        visible={createDialogVisible}
        style={{ width: '550px' }}
        onHide={() => {
          setCreateDialogVisible(false);
          setImagePreview(null);
        }}
        draggable={false}
        className={styles.productDialog}
      >
        <div className={styles.editForm}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-tag"></i>
              Nombre del producto *
            </label>
            <InputText
              value={createForm.nombre}
              onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
              className={styles.fieldInput}
              placeholder="Ej: Camisa de Lino Elegante"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-align-left"></i>
              Descripción
            </label>
            <InputTextarea
              value={createForm.descripcion}
              onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
              className={styles.fieldInput}
              rows={3}
              placeholder="Descripción detallada del producto"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-dollar"></i>
              Precio *
            </label>
            <InputText
              value={createForm.precio}
              onChange={(e) => setCreateForm({ ...createForm, precio: e.target.value })}
              className={styles.fieldInput}
              placeholder="0.00"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-box"></i>
              Stock
            </label>
            <InputText
              type="number"
              value={createForm.stock}
              onChange={(e) => setCreateForm({ ...createForm, stock: parseInt(e.target.value) || 0 })}
              className={styles.fieldInput}
              placeholder="0"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-list"></i>
              Categoría *
            </label>
            <InputText
              value={createForm.categoria}
              onChange={(e) => setCreateForm({ ...createForm, categoria: e.target.value })}
              className={styles.fieldInput}
              placeholder="Ej: Poleras, Pantalones, Zapatos"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-sitemap"></i>
              Subcategoría
            </label>
            <InputText
              value={createForm.subcategoria}
              onChange={(e) => setCreateForm({ ...createForm, subcategoria: e.target.value })}
              className={styles.fieldInput}
              placeholder="Ej: Oversize, Jeans, Deportivo"
            />
          </div>

          <div className={styles.field}>
            <ImageUpload
              onImageUploaded={(url) => {
                setCreateForm({ ...createForm, imagen_principal: url });
              }}
              currentImage={createForm.imagen_principal}
              label="Imagen del producto"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-tag"></i>
              Tallas (separadas por coma)
            </label>
            <InputText
              value={createForm.tallas}
              onChange={(e) => setCreateForm({ ...createForm, tallas: e.target.value })}
              className={styles.fieldInput}
              placeholder="S, M, L, XL"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-palette"></i>
              Colores (separados por coma)
            </label>
            <InputText
              value={createForm.colores}
              onChange={(e) => setCreateForm({ ...createForm, colores: e.target.value })}
              className={styles.fieldInput}
              placeholder="Negro, Blanco, Azul"
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                setCreateDialogVisible(false);
                setImagePreview(null);
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleCreateProduct}
            >
              <i className="pi pi-check"></i>
              Crear Producto
            </button>
          </div>
        </div>
      </Dialog>

      {/* Dialog de edición */}
      <Dialog
        header="Editar Producto"
        visible={editDialogVisible}
        style={{ width: '550px' }}
        onHide={() => {
          setEditDialogVisible(false);
          setImagePreview(null);
        }}
        draggable={false}
        className={styles.productDialog}
      >
        <div className={styles.editForm}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-tag"></i>
              Nombre del producto
            </label>
            <InputText
              value={editForm.nombre}
              onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-align-left"></i>
              Descripción
            </label>
            <InputTextarea
              value={editForm.descripcion}
              onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
              className={styles.fieldInput}
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-dollar"></i>
              Precio
            </label>
            <InputText
              value={editForm.precio}
              onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-box"></i>
              Stock
            </label>
            <InputText
              type="number"
              value={editForm.stock}
              onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-list"></i>
              Categoría
            </label>
            <InputText
              value={editForm.categoria}
              onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-sitemap"></i>
              Subcategoría
            </label>
            <InputText
              value={editForm.subcategoria}
              onChange={(e) => setEditForm({ ...editForm, subcategoria: e.target.value })}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.field}>
            <ImageUpload
              onImageUploaded={(url) => {
                setEditForm({ ...editForm, imagen_principal: url });
                setImagePreview(url);
              }}
              currentImage={editForm.imagen_principal}
              label="Imagen del producto"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-tag"></i>
              Tallas (separadas por coma)
            </label>
            <InputText
              value={editForm.tallas}
              onChange={(e) => setEditForm({ ...editForm, tallas: e.target.value })}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-palette"></i>
              Colores (separados por coma)
            </label>
            <InputText
              value={editForm.colores}
              onChange={(e) => setEditForm({ ...editForm, colores: e.target.value })}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setEditDialogVisible(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleUpdateProduct}
            >
              <i className="pi pi-check"></i>
              Guardar cambios
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}