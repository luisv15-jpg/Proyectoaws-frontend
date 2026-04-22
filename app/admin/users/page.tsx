'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import toast from 'react-hot-toast';
import Link from 'next/link';
import styles from './page.module.css';
import { ColorPicker } from 'primereact/colorpicker';

interface User {
  id: string;
  nombre: string;
  email: string;
  role: 'user' | 'admin';
  dni?: string;
  telefono?: string;
  direccion?: string;
  createdAt: string;
  deletedAt?: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: '', email: '', role: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    confirmDialog({
      message: `¿Mover a ${user.nombre} a la papelera?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, mover',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await api.patch(`/users/${user.id}/soft-delete`);
          toast.success('Usuario movido a la papelera');
          fetchUsers();
        } catch (error) {
          toast.error('Error al mover usuario');
        }
      }
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({ nombre: user.nombre, email: user.email, role: user.role });
    setEditDialogVisible(true);
  };

  const saveEdit = async () => {
    try {
      await api.put(`/users/${selectedUser?.id}`, editForm);
      toast.success('Usuario actualizado');
      setEditDialogVisible(false);
      fetchUsers();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const roleBody = (rowData: User) => {
    return rowData.role === 'admin' ? (
      <Tag value="Administrador" severity="success" className={styles.adminTag} />
    ) : (
      <Tag value="Usuario" severity="info" className={styles.userTag} />
    );
  };

  const dateBody = (rowData: User) => {
    return new Date(rowData.createdAt).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const actionBody = (rowData: User) => {
    return (
      <div className={styles.actions}>
        <button
          className={styles.editBtn}
          onClick={() => handleEditUser(rowData)}
          title="Editar usuario"
        >
          <i className="pi pi-pencil"></i>
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => handleDeleteUser(rowData)}
          title="Mover a papelera"
        >
          <i className="pi pi-trash"></i>
        </button>
      </div>
    );
  };

  const deletedUsersCount = users.filter(u => u.deletedAt).length;

  const header = (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <div className={styles.titleIcon}>
          <i className="pi pi-users"></i>
        </div>
        <div>
          <h2>Gestión de Usuarios</h2>
          <p className={styles.subtitle}>Administra los usuarios de la plataforma</p>
        </div>
        <Link href="/admin/trash/users" className={styles.trashLink}>
          <i className="pi pi-trash"></i>
          Papelera
          {deletedUsersCount > 0 && (
            <span className={styles.trashBadge}>{deletedUsersCount}</span>
          )}
        </Link>
      </div>
      <div className={styles.searchSection}>
        <i className="pi pi-search"></i>
        <InputText
          type="search"
          placeholder="Buscar usuario por nombre o email..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className={styles.searchInput}
        />
      </div>
    </div>
  );

  const activeUsers = users.filter(u => !u.deletedAt);

  return (
    <div className={styles.container}>
      <ConfirmDialog />
      <DataTable
        value={activeUsers}
        loading={loading}
        globalFilter={globalFilter}
        header={header}
        paginator
        rows={20}
        emptyMessage="No hay usuarios registrados"
        className={styles.table}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field="nombre" header="Nombre" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="role" header="Rol" body={roleBody} sortable style={{ width: '140px' }} />
        <Column field="telefono" header="Teléfono" style={{ width: '120px' }} />
        <Column field="createdAt" header="Registro" body={dateBody} sortable style={{ width: '120px' }} />
        <Column body={actionBody} header="Acciones" style={{ width: '100px' }} />
      </DataTable>

      <Dialog
        header="Editar Usuario"
        visible={editDialogVisible}
        style={{ width: '480px' }}
        onHide={() => setEditDialogVisible(false)}
        draggable={false}
        className={styles.userDialog}
      >
        <div className={styles.editForm}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-user"></i>
              Nombre completo
            </label>
            <InputText
              value={editForm.nombre}
              onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
              className={styles.fieldInput}
              placeholder="Ingrese el nombre"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-envelope"></i>
              Correo electrónico
            </label>
            <InputText
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className={styles.fieldInput}
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <i className="pi pi-shield"></i>
              Rol del usuario
            </label>
            <div className={styles.roleOptions}>
              <button
                type="button"
                onClick={() => setEditForm({ ...editForm, role: 'user' })}
                className={`${styles.roleCard} ${editForm.role === 'user' ? styles.roleCardActive : ''}`}
              >
                <i className="pi pi-user"></i>
                <div>
                  <strong>Usuario</strong>
                  <span>Acceso limitado a la tienda</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setEditForm({ ...editForm, role: 'admin' })}
                className={`${styles.roleCard} ${editForm.role === 'admin' ? styles.roleCardActive : ''}`}
              >
                <i className="pi pi-shield"></i>
                <div>
                  <strong>Administrador</strong>
                  <span>Acceso total al panel</span>
                </div>
              </button>
            </div>
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
              onClick={saveEdit}
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