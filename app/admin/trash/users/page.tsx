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

  const deletedDateBody = (rowData: DeletedUser) => {
    return new Date(rowData.deletedAt).toLocaleDateString('es-PE');
  };

  const header = (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <Link href="/admin/users" className={styles.backLink}>
          <i className="pi pi-arrow-left"></i>
          Volver a Usuarios
        </Link>
        <h2>Papelera de Usuarios</h2>
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
        value={users}
        loading={loading}
        globalFilter={globalFilter}
        header={header}
        paginator
        rows={10}
        emptyMessage="No hay usuarios en la papelera"
        className={styles.table}
      >
        <Column field="nombre" header="Nombre" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="role" header="Rol" body={(row) => <Tag value={row.role} />} />
        <Column field="deletedAt" header="Fecha eliminación" body={deletedDateBody} sortable />
        <Column body={actionBody} header="Acciones" style={{ width: '120px' }} />
      </DataTable>
    </div>
  );
}