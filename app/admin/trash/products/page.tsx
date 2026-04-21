'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
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
        <Button
          icon="pi pi-refresh"
          className="p-button-rounded p-button-text p-button-success"
          onClick={() => handleRestore(rowData)}
          tooltip="Restaurar"
        />
        <Button
          icon="pi pi-times-circle"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => handlePermanentDelete(rowData)}
          tooltip="Eliminar permanentemente"
        />
      </div>
    );
  };

  const deletedDateBody = (rowData: DeletedProduct) => {
    return new Date(rowData.deletedAt).toLocaleDateString('es-PE');
  };

  const header = (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <Link href="/admin/products" className={styles.backLink}>
          <i className="pi pi-arrow-left"></i>
          Volver a Productos
        </Link>
        <h2>Papelera de Productos</h2>
      </div>
      <div className={styles.searchSection}>
        <i className="pi pi-search"></i>
        <InputText
          type="search"
          placeholder="Buscar..."
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
        rows={10}
        emptyMessage="No hay productos en la papelera"
        className={styles.table}
      >
        <Column field="nombre" header="Nombre" sortable />
        <Column field="categoria" header="Categoría" sortable />
        <Column field="precio" header="Precio" body={(row) => `S/ ${parseFloat(row.precio).toFixed(2)}`} sortable />
        <Column field="deletedAt" header="Fecha eliminación" body={deletedDateBody} sortable />
        <Column body={actionBody} header="Acciones" style={{ width: '120px' }} />
      </DataTable>
    </div>
  );
}