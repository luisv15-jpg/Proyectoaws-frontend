'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import toast from 'react-hot-toast';
import Link from 'next/link';
import styles from './page.module.css';

interface DeletedProduct {
  id: string;
  nombre: string;
  precio: string;
  stock: number;
  categoria: string;
  deletedAt: string;
}

export default function TrashProductsPage() {
  const [products, setProducts] = useState<DeletedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    fetchDeletedProducts();
  }, []);

  const fetchDeletedProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/admin/deleted');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching deleted products:', error);
      toast.error('Error al cargar productos eliminados');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (product: DeletedProduct) => {
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
          fetchDeletedProducts();
        } catch (error) {
          toast.error('Error al restaurar');
        }
      }
    });
  };

  const handlePermanentDelete = (product: DeletedProduct) => {
    confirmDialog({
      message: `¿Eliminar permanentemente "${product.nombre}"? Esta acción no se puede deshacer.`,
      header: 'Eliminación permanente',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await api.delete(`/products/${product.id}`);
          toast.success('Producto eliminado permanentemente');
          fetchDeletedProducts();
        } catch (error) {
          toast.error('Error al eliminar');
        }
      }
    });
  };

  const actionBody = (rowData: DeletedProduct) => {
    return (
      <div className={styles.actions}>
        <button
          className={styles.restoreBtn}
          onClick={() => handleRestore(rowData)}
          title="Restaurar producto"
        >
          <i className="pi pi-refresh"></i>
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => handlePermanentDelete(rowData)}
          title="Eliminar permanentemente"
        >
          <i className="pi pi-times-circle"></i>
        </button>
      </div>
    );
  };

  const priceBody = (rowData: DeletedProduct) => {
    return `S/ ${parseFloat(rowData.precio).toFixed(2)}`;
  };

  const deletedDateBody = (rowData: DeletedProduct) => {
    return new Date(rowData.deletedAt).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stockBody = (rowData: DeletedProduct) => {
    const stock = rowData.stock;
    if (stock === 0) return <Tag value="Agotado" severity="danger" className={styles.stockTag} />;
    if (stock < 10) return <Tag value={`Stock bajo: ${stock}`} severity="warning" className={styles.stockTagWarning} />;
    return <Tag value={stock} severity="info" className={styles.stockTagOk} />;
  };

  const header = (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <div className={styles.titleIcon}>
          <i className="pi pi-trash"></i>
        </div>
        <div>
          <h2>Papelera de Productos</h2>
          <p className={styles.subtitle}>Productos eliminados recientemente</p>
        </div>
        <Link href="/admin/products" className={styles.backLink}>
          <i className="pi pi-arrow-left"></i>
          Volver a Productos
        </Link>
      </div>
      <div className={styles.searchSection}>
        <i className="pi pi-search"></i>
        <InputText
          type="search"
          placeholder="Buscar producto..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className={styles.searchInput}
        />
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <ConfirmDialog />
      <DataTable
        value={products}
        loading={loading}
        globalFilter={globalFilter}
        header={header}
        paginator
        rows={20}
        emptyMessage="No hay productos en la papelera"
        className={styles.table}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field="nombre" header="Producto" sortable />
        <Column field="categoria" header="Categoría" sortable style={{ width: '130px' }} />
        <Column field="precio" header="Precio" body={priceBody} sortable style={{ width: '100px' }} />
        <Column field="stock" header="Stock" body={stockBody} sortable style={{ width: '120px' }} />
        <Column field="deletedAt" header="Fecha eliminación" body={deletedDateBody} sortable style={{ width: '180px' }} />
        <Column body={actionBody} header="Acciones" style={{ width: '100px' }} />
      </DataTable>
    </div>
  );
}