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

interface DeletedUser {
  id: string;
  nombre: string;
  email: string;
  role: string;
  deletedAt: string;
}

export default function TrashUsersPage() {
  const [users, setUsers] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const fetchDeletedUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/deleted');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching deleted users:', error);
      toast.error('Error al cargar usuarios eliminados');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (user: DeletedUser) => {
    confirmDialog({
      message: `¿Restaurar a ${user.nombre}?`,
      header: 'Confirmar restauración',
      icon: 'pi pi-refresh',
      acceptLabel: 'Sí, restaurar',
      acceptClassName: 'p-button-success',
      accept: async () => {
        try {
          await api.patch(`/users/${user.id}/restore`);
          toast.success('Usuario restaurado');
          fetchDeletedUsers();
        } catch (error) {
          toast.error('Error al restaurar');
        }
      }
    });
  };

  const handlePermanentDelete = (user: DeletedUser) => {
    confirmDialog({
      message: `¿Eliminar permanentemente a ${user.nombre}? Esta acción no se puede deshacer.`,
      header: 'Eliminación permanente',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await api.delete(`/users/${user.id}`);
          toast.success('Usuario eliminado permanentemente');
          fetchDeletedUsers();
        } catch (error) {
          toast.error('Error al eliminar');
        }
      }
    });
  };

  const actionBody = (rowData: DeletedUser) => {
    return (
      <div className={styles.actions}>
        <button
          className={styles.restoreBtn}
          onClick={() => handleRestore(rowData)}
          title="Restaurar usuario"
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

  const deletedDateBody = (rowData: DeletedUser) => {
    return new Date(rowData.deletedAt).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const roleBody = (rowData: DeletedUser) => {
    return rowData.role === 'admin' ? (
      <Tag value="Administrador" severity="success" className={styles.adminTag} />
    ) : (
      <Tag value="Usuario" severity="info" className={styles.userTag} />
    );
  };

  const header = (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <div className={styles.titleIcon}>
          <i className="pi pi-trash"></i>
        </div>
        <div>
          <h2>Papelera de Usuarios</h2>
          <p className={styles.subtitle}>Usuarios eliminados recientemente</p>
        </div>
        <Link href="/admin/users" className={styles.backLink}>
          <i className="pi pi-arrow-left"></i>
          Volver a Usuarios
        </Link>
      </div>
      <div className={styles.searchSection}>
        <i className="pi pi-search"></i>
        <InputText
          type="search"
          placeholder="Buscar usuario..."
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
        value={users}
        loading={loading}
        globalFilter={globalFilter}
        header={header}
        paginator
        rows={20}
        emptyMessage="No hay usuarios en la papelera"
        className={styles.table}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field="nombre" header="Nombre" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="role" header="Rol" body={roleBody} style={{ width: '130px' }} />
        <Column field="deletedAt" header="Fecha eliminación" body={deletedDateBody} sortable style={{ width: '180px' }} />
        <Column body={actionBody} header="Acciones" style={{ width: '100px' }} />
      </DataTable>
    </div>
  );
}