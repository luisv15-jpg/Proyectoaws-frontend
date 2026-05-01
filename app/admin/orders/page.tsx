'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import toast from 'react-hot-toast';
import styles from './page.module.css';

interface Order {
  id: string;
  total: string;
  estado: string;
  metodo_pago: string;
  direccion_entrega: string;
  createdAt: string;
  user: {
    id: string;
    nombre: string;
    email: string;
  };
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);

  const statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'Procesando', value: 'processing' },
    { label: 'Enviado', value: 'shipped' },
    { label: 'Entregado', value: 'delivered' },
    { label: 'Cancelado', value: 'cancelled' },
  ];

  const statusFlow = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('estado', selectedStatus);
      params.append('limit', '100');

      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailDialogVisible(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.estado);
    setStatusDialogVisible(true);
  };

  const saveStatus = async () => {
    if (!selectedOrder) return;
    if (newStatus === selectedOrder.estado) {
      toast('El estado no ha cambiado');
      return;
    }

    setUpdatingStatus(true);
    try {
      await api.put(`/orders/${selectedOrder.id}/status`, { estado: newStatus });
      toast.success(`Estado actualizado a ${getStatusLabel(newStatus)}`);
      setStatusDialogVisible(false);
      fetchOrders();

      // Agregar al historial
      setStatusHistory(prev => [...prev, {
        orderId: selectedOrder.id,
        oldStatus: selectedOrder.estado,
        newStatus: newStatus,
        date: new Date(),
      }]);
    } catch (error) {
      toast.error('Error al actualizar estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusSeverity = (status: string) => {
    const severities: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
      pending: 'warning',
      processing: 'info',
      shipped: 'secondary',
      delivered: 'success',
      cancelled: 'danger',
    };
    return severities[status] || 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: 'pi pi-clock',
      processing: 'pi pi-spin pi-spinner',
      shipped: 'pi pi-truck',
      delivered: 'pi pi-check-circle',
      cancelled: 'pi pi-times-circle',
    };
    return icons[status] || 'pi pi-question-circle';
  };

  const getNextAllowedStatuses = (currentStatus: string) => {
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const statusBody = (rowData: Order) => {
    const status = rowData.estado;
    return (
      <div className={styles.statusCell}>
        <i className={getStatusIcon(status)} style={{ color: getStatusSeverity(status) === 'success' ? '#10b981' : '#888' }}></i>
        <Tag
          value={getStatusLabel(status)}
          severity={getStatusSeverity(status)}
          className={styles.statusTag}
        />
      </div>
    );
  };

  const paymentMethodBody = (rowData: Order) => {
    const methods: Record<string, { label: string; icon: string }> = {
      tarjeta: { label: 'Tarjeta', icon: 'pi pi-credit-card' },
      yape: { label: 'Yape', icon: 'pi pi-mobile' },
      plin: { label: 'Plin', icon: 'pi pi-mobile' },
      transferencia: { label: 'Transferencia', icon: 'pi pi-building' },
    };
    const method = methods[rowData.metodo_pago] || { label: rowData.metodo_pago, icon: 'pi pi-money-bill' };
    return (
      <div className={styles.paymentCell}>
        <i className={method.icon}></i>
        <span>{method.label}</span>
      </div>
    );
  };

  const priceBody = (rowData: Order) => {
    return `S/ ${parseFloat(rowData.total).toFixed(2)}`;
  };

  const dateBody = (rowData: Order) => {
    return new Date(rowData.createdAt).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const actionBody = (rowData: Order) => {
    const canChange = getNextAllowedStatuses(rowData.estado).length > 0;
    return (
      <div className={styles.actions}>
        <button
          className={styles.viewBtn}
          onClick={() => handleViewDetails(rowData)}
          title="Ver detalles"
        >
          <i className="pi pi-eye"></i>
        </button>
        <button
          className={`${styles.editBtn} ${!canChange ? styles.disabled : ''}`}
          onClick={() => canChange && handleUpdateStatus(rowData)}
          title={canChange ? "Cambiar estado" : "No se puede cambiar el estado"}
          disabled={!canChange}
        >
          <i className="pi pi-pencil"></i>
        </button>
      </div>
    );
  };

  const header = (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <div className={styles.titleIcon}>
          <i className="pi pi-shopping-cart"></i>
        </div>
        <div>
          <h2>Gestión de Pedidos</h2>
          <p className={styles.subtitle}>Administra los pedidos de los clientes</p>
        </div>
      </div>
      <div className={styles.filters}>
        <div className={styles.searchSection}>
          <i className="pi pi-search"></i>
          <InputText
            type="search"
            placeholder="Buscar por cliente o ID..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <ConfirmDialog />
      <DataTable
        value={orders}
        loading={loading}
        globalFilter={globalFilter}
        header={header}
        paginator
        rows={20}
        emptyMessage="No hay pedidos registrados"
        className={styles.table}
        tableStyle={{ minWidth: '60rem' }}
      >
        <Column field="id" header="ID" body={(row) => row.id.slice(0, 8)} sortable style={{ width: '100px' }} />
        <Column field="user.nombre" header="Cliente" sortable />
        <Column field="total" header="Total" body={priceBody} sortable style={{ width: '100px' }} />
        <Column field="estado" header="Estado" body={statusBody} sortable style={{ width: '140px' }} />
        <Column field="metodo_pago" header="Pago" body={paymentMethodBody} sortable style={{ width: '130px' }} />
        <Column field="createdAt" header="Fecha" body={dateBody} sortable style={{ width: '160px' }} />
        <Column body={actionBody} header="Acciones" style={{ width: '100px' }} />
      </DataTable>

      {/* Dialog de detalles del pedido */}
      <Dialog
        header="Detalles del Pedido"
        visible={detailDialogVisible}
        style={{ width: '650px' }}
        onHide={() => setDetailDialogVisible(false)}
        draggable={false}
        className={styles.detailDialog}
      >
        {selectedOrder && (
          <div className={styles.orderDetails}>
            <div className={styles.detailSection}>
              <h3>Información del pedido</h3>
              <div className={styles.detailRow}>
                <span>ID:</span>
                <strong>{selectedOrder.id}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Fecha:</span>
                <strong>{new Date(selectedOrder.createdAt).toLocaleString('es-PE')}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Estado:</span>
                <div className={styles.statusDisplay}>
                  <i className={getStatusIcon(selectedOrder.estado)}></i>
                  <Tag value={getStatusLabel(selectedOrder.estado)} severity={getStatusSeverity(selectedOrder.estado)} />
                </div>
              </div>
              <div className={styles.detailRow}>
                <span>Método de pago:</span>
                <strong>{paymentMethodBody(selectedOrder)}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Total:</span>
                <strong className={styles.totalAmount}>S/ {parseFloat(selectedOrder.total).toFixed(2)}</strong>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>Información del cliente</h3>
              <div className={styles.detailRow}>
                <span>Nombre:</span>
                <strong>{selectedOrder.user?.nombre || 'N/A'}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Email:</span>
                <strong>{selectedOrder.user?.email || 'N/A'}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Dirección:</span>
                <strong>{selectedOrder.direccion_entrega}</strong>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>Productos</h3>
              <div className={styles.itemsList}>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className={styles.orderItem}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.productName}</span>
                      <span className={styles.itemDetails}>
                        Talla: {item.talla} / Color: {item.color}
                      </span>
                      <span className={styles.itemQuantity}>x{item.cantidad}</span>
                    </div>
                    <span className={styles.itemPrice}>S/ {parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Dialog de cambio de estado - Diseño mejorado */}
      {/* Dialog de cambio de estado - Diseño corregido */}
      <Dialog
        header="Cambiar estado del pedido"
        visible={statusDialogVisible}
        style={{ width: '450px' }}
        onHide={() => setStatusDialogVisible(false)}
        draggable={false}
        className={styles.statusDialog}
      >
        {selectedOrder && (
          <div className={styles.statusForm}>
            {/* Información del pedido */}
            <div className={styles.statusHeader}>
              <div className={styles.orderInfo}>
                <span className={styles.orderLabel}>Pedido</span>
                <strong className={styles.orderId}>{selectedOrder.id.slice(0, 8)}</strong>
              </div>
              <div className={styles.currentStatus}>
                <span className={styles.statusLabel}>Estado actual</span>
                <div className={styles.currentStatusBadge}>
                  <i className={getStatusIcon(selectedOrder.estado)}></i>
                  <span>{getStatusLabel(selectedOrder.estado)}</span>
                </div>
              </div>
            </div>

            {/* Selector de nuevo estado */}
            <div className={styles.statusSelector}>
              <label>Nuevo estado</label>
              <div className={styles.statusOptionsGrid}>
                {getNextAllowedStatuses(selectedOrder.estado).map((status) => (
                  <button
                    key={status}
                    className={`${styles.statusOption} ${newStatus === status ? styles.selected : ''}`}
                    onClick={() => setNewStatus(status)}
                  >
                    <i className={getStatusIcon(status)}></i>
                    <span>{getStatusLabel(status)}</span>
                    {newStatus === status && <i className="pi pi-check-circle"></i>}
                  </button>
                ))}
                {getNextAllowedStatuses(selectedOrder.estado).length === 0 && (
                  <p className={styles.noChanges}>Este pedido no puede cambiar de estado</p>
                )}
              </div>
            </div>

            {/* Vista previa del cambio */}
            {newStatus !== selectedOrder.estado && newStatus && (
              <div className={styles.statusPreview}>
                <i className="pi pi-info-circle"></i>
                <span>
                  El pedido pasará de <strong>{getStatusLabel(selectedOrder.estado)}</strong> a{' '}
                  <strong>{getStatusLabel(newStatus)}</strong>
                </span>
              </div>
            )}

            {/* Botones de acción */}
            <div className={styles.statusActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setStatusDialogVisible(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.saveBtn}
                onClick={saveStatus}
                disabled={newStatus === selectedOrder.estado || !newStatus}
              >
                <i className="pi pi-check"></i>
                Actualizar estado
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}