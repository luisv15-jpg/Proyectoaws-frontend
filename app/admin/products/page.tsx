'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Product } from '@/types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import toast from 'react-hot-toast';
import Link from 'next/link';
import MultiImageUpload from '@/components/admin/MultiImageUpload';
import styles from './page.module.css';

interface ProductItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  precio_oferta: string | null;
  stock: number;
  categoria: string;
  subcategoria: string | null;
  imagen_principal: string | null;
  imagenes: string[] | null;
  tallas: string[] | null;
  colores: string[] | null;
  activo: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasOffer, setHasOffer] = useState(false);
  const [hasOfferEdit, setHasOfferEdit] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);

  const [createForm, setCreateForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    precio_oferta: '',
    stock: 0,
    categoria: '',
    subcategoria: '',
    imagenes: [] as string[],
    tallas: '',
    colores: '',
  });

  const openCreateDialog = () => {
    setCreateForm({
      nombre: '',
      descripcion: '',
      precio: '',
      precio_oferta: '',
      stock: 0,
      categoria: '',
      subcategoria: '',
      imagenes: [],
      tallas: '',
      colores: '',
    });
    setHasOffer(false);
    setImagePreview(null);
    setCreateDialogVisible(true);
  };

  const [editForm, setEditForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    precio_oferta: '',
    stock: 0,
    categoria: '',
    subcategoria: '',
    imagenes: [] as string[],
    tallas: '',
    colores: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (page: number = 1, limit: number = 100) => {
    setLoading(true);
    try {
      const response = await api.get('/products/admin/all?page=' + page + '&limit=' + limit);
      const productsData = response.data.products || [];
      setProducts(productsData);
      setTotalProducts(productsData.length);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }

    useEffect(() => {
      fetchProducts(1, rows);
    }, []);

    const onPageChange = (event: any) => {
      const newPage = event.page + 1;
      const newRows = event.rows;
      setFirst(event.first);
      setRows(newRows);
      fetchProducts(newPage, newRows);
    }

  };

  const handleCreateProduct = async () => {
    if (!createForm.nombre || !createForm.precio || !createForm.categoria) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    try {
      const precioNum = parseFloat(createForm.precio);
      let precioOfertaNum = null;

      if (hasOffer && createForm.precio_oferta && createForm.precio_oferta.trim() !== '') {
        precioOfertaNum = parseFloat(createForm.precio_oferta);
        if (isNaN(precioOfertaNum)) {
          toast.error('El precio de oferta no es válido');
          return;
        }
        if (precioOfertaNum >= precioNum) {
          toast.error('El precio de oferta debe ser menor al precio original');
          return;
        }
      }

      const primeraImagen = createForm.imagenes.length > 0 ? createForm.imagenes[0] : undefined;

      const restoImagenes = createForm.imagenes.length > 1 ? createForm.imagenes.slice(1) : [];

      const productData = {
        nombre: createForm.nombre,
        descripcion: createForm.descripcion || undefined,
        precio: precioNum,
        precio_oferta: hasOffer && precioOfertaNum ? precioOfertaNum : null,
        stock: createForm.stock,
        categoria: createForm.categoria,
        subcategoria: createForm.subcategoria || undefined,
        imagen_principal: primeraImagen,  
        imagenes: restoImagenes,          
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
        precio_oferta: '',
        stock: 0,
        categoria: '',
        subcategoria: '',
        imagenes: [],
        tallas: '',
        colores: '',
      });
      setHasOffer(false);
      setImagePreview(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear producto');
    }
  };

  const handleEditProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    const hasOfferValue = product.precio_oferta && parseFloat(product.precio_oferta) > 0;
    setHasOfferEdit(hasOfferValue || false);
    setEditForm({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: product.precio,
      precio_oferta: product.precio_oferta || '',
      stock: product.stock,
      categoria: product.categoria,
      subcategoria: product.subcategoria || '',
      imagenes: product.imagenes || [],
      tallas: product.tallas?.join(', ') || '',
      colores: product.colores?.join(', ') || '',
    });
    setImagePreview(product.imagen_principal || null);
    setEditDialogVisible(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const precioNum = parseFloat(editForm.precio);
      let precioOfertaNum = null;

      if (hasOfferEdit && editForm.precio_oferta && editForm.precio_oferta.trim() !== '') {
        precioOfertaNum = parseFloat(editForm.precio_oferta);
        if (isNaN(precioOfertaNum)) {
          toast.error('El precio de oferta no es válido');
          return;
        }
        if (precioOfertaNum >= precioNum) {
          toast.error('El precio de oferta debe ser menor al precio original');
          return;
        }
      }

      const primeraImagen = editForm.imagenes.length > 0 ? editForm.imagenes[0] : undefined;

      const restoImagenes = editForm.imagenes.length > 1 ? editForm.imagenes.slice(1) : [];

      const productData = {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion || undefined,
        precio: precioNum,
        precio_oferta: hasOfferEdit && precioOfertaNum ? precioOfertaNum : null,
        stock: editForm.stock,
        categoria: editForm.categoria,
        subcategoria: editForm.subcategoria || undefined,
        imagen_principal: primeraImagen,
        imagenes: restoImagenes,
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

  const handleDeleteProduct = (product: ProductItem) => {
    confirmDialog({
      message: (
        <div className={styles.confirmMessage}>
          <div className={styles.confirmIcon}>
            <i className="pi pi-exclamation-triangle"></i>
          </div>
          <div className={styles.confirmText}>
            <strong>¿Mover "{product.nombre}" a la papelera?</strong>
            <p>El producto será desactivado y podrá ser restaurado desde la papelera.</p>
          </div>
        </div>
      ),
      header: (
        <div className={styles.confirmHeader}>
          <i className="pi pi-trash"></i>
          <span>Confirmar eliminación</span>
        </div>
      ),
      acceptLabel: 'Sí, mover',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-secondary',
      className: styles.customConfirmDialog,
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
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

  const handleRestoreProduct = (product: ProductItem) => {
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

  const stockBody = (rowData: ProductItem) => {
    const stock = rowData.stock;
    if (stock === 0) return <Tag value="Agotado" severity="danger" className={styles.stockTag} />;
    if (stock < 10) return <Tag value={`Stock bajo: ${stock}`} severity="warning" className={styles.stockTagWarning} />;
    return <Tag value={stock} severity="info" className={styles.stockTagOk} />;
  };

  const priceBody = (rowData: ProductItem) => {
    const hasOffer = rowData.precio_oferta && parseFloat(rowData.precio_oferta) > 0;
    return (
      <div className={styles.priceCell}>
        {hasOffer && (
          <span className={styles.originalPrice}>S/ {parseFloat(rowData.precio).toFixed(2)}</span>
        )}
        <span className={hasOffer ? styles.offerPrice : styles.normalPrice}>
          S/ {hasOffer ? parseFloat(rowData.precio_oferta!).toFixed(2) : parseFloat(rowData.precio).toFixed(2)}
        </span>
      </div>
    );
  };

  const statusBody = (rowData: ProductItem) => {
    if (rowData.deletedAt) {
      return <Tag value="Eliminado" severity="danger" className={styles.statusTag} />;
    }
    return rowData.activo ? (
      <Tag value="Activo" severity="success" className={styles.statusTagActive} />
    ) : (
      <Tag value="Inactivo" severity="secondary" className={styles.statusTagInactive} />
    );
  };

  const actionBody = (rowData: ProductItem) => {
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
        rows={20}
        emptyMessage="No hay productos registrados"
        className={styles.table}
        tableStyle={{ minWidth: '70rem' }}
      >
        <Column field="nombre" header="Producto" sortable />
        <Column field="categoria" header="Categoría" sortable style={{ width: '130px' }} />
        <Column field="precio" header="Precio" body={priceBody} sortable style={{ width: '130px' }} />
        <Column field="stock" header="Stock" body={stockBody} sortable style={{ width: '120px' }} />
        <Column field="activo" header="Estado" body={statusBody} sortable style={{ width: '110px' }} />
        <Column body={actionBody} header="Acciones" style={{ width: '100px' }} />
      </DataTable>

      {/* Dialog de creación */}
      <Dialog
        header="Nuevo Producto"
        visible={createDialogVisible}
        style={{ width: '600px' }}
        onHide={() => {
          setCreateDialogVisible(false);
          setImagePreview(null);
          setHasOffer(false);
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

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <i className="pi pi-dollar"></i>
                Precio regular *
              </label>
              <InputText
                value={createForm.precio}
                onChange={(e) => setCreateForm({ ...createForm, precio: e.target.value })}
                className={styles.fieldInput}
                placeholder="0.00"
              />
            </div>
            <div className={styles.field}>
              <div className={styles.offerHeader}>
                <label className={styles.fieldLabel}>
                  <i className="pi pi-percentage"></i>
                  Precio de oferta
                </label>
                <button
                  type="button"
                  className={styles.toggleOfferBtn}
                  onClick={() => setHasOffer(!hasOffer)}
                >
                  {hasOffer ? (
                    <>
                      <i className="pi pi-times"></i>
                      Quitar oferta
                    </>
                  ) : (
                    <>
                      <i className="pi pi-plus"></i>
                      Agregar oferta
                    </>
                  )}
                </button>
              </div>
              {hasOffer && (
                <InputText
                  value={createForm.precio_oferta}
                  onChange={(e) => setCreateForm({ ...createForm, precio_oferta: e.target.value })}
                  className={styles.fieldInput}
                  placeholder="0.00"
                />
              )}
              {hasOffer && (
                <small className={styles.fieldHint}>Debe ser menor al precio regular</small>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <i className="pi pi-box"></i>
                Stock *
              </label>
              <InputText
                type="number"
                value={createForm.stock.toString()}
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
                placeholder="Ej: Poleras, Pantalones"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <i className="pi pi-sitemap"></i>
                Subcategoría
              </label>
              <InputText
                value={createForm.subcategoria}
                onChange={(e) => setCreateForm({ ...createForm, subcategoria: e.target.value })}
                className={styles.fieldInput}
                placeholder="Ej: Oversize, Jeans"
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

          <div className={styles.field}>
            <MultiImageUpload
              onImagesUploaded={(urls) => {
                setCreateForm({ ...createForm, imagenes: urls });
              }}
              currentImages={createForm.imagenes}
              label="Imágenes del producto"
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
        style={{ width: '600px' }}
        onHide={() => {
          setEditDialogVisible(false);
          setImagePreview(null);
          setHasOfferEdit(false);
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

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <i className="pi pi-dollar"></i>
                Precio regular
              </label>
              <InputText
                value={editForm.precio}
                onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
                className={styles.fieldInput}
              />
            </div>
            <div className={styles.field}>
              <div className={styles.offerHeader}>
                <label className={styles.fieldLabel}>
                  <i className="pi pi-percentage"></i>
                  Precio de oferta
                </label>
                <button
                  type="button"
                  className={styles.toggleOfferBtn}
                  onClick={() => setHasOfferEdit(!hasOfferEdit)}
                >
                  {hasOfferEdit ? (
                    <>
                      <i className="pi pi-times"></i>
                      Quitar oferta
                    </>
                  ) : (
                    <>
                      <i className="pi pi-plus"></i>
                      Agregar oferta
                    </>
                  )}
                </button>
              </div>
              {hasOfferEdit && (
                <InputText
                  value={editForm.precio_oferta}
                  onChange={(e) => setEditForm({ ...editForm, precio_oferta: e.target.value })}
                  className={styles.fieldInput}
                />
              )}
              {hasOfferEdit && (
                <small className={styles.fieldHint}>Debe ser menor al precio regular</small>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                <i className="pi pi-box"></i>
                Stock
              </label>
              <InputText
                type="number"
                value={editForm.stock.toString()}
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
          </div>

          <div className={styles.formRow}>
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
              <label className={styles.fieldLabel}>
                <i className="pi pi-tag"></i>
                Tallas
              </label>
              <InputText
                value={editForm.tallas}
                onChange={(e) => setEditForm({ ...editForm, tallas: e.target.value })}
                className={styles.fieldInput}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-palette"></i>
              Colores
            </label>
            <InputText
              value={editForm.colores}
              onChange={(e) => setEditForm({ ...editForm, colores: e.target.value })}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.field}>
            <MultiImageUpload
              onImagesUploaded={(urls) => {
                setEditForm({ ...editForm, imagenes: urls });
              }}
              currentImages={editForm.imagenes}
              label="Imágenes del producto"
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