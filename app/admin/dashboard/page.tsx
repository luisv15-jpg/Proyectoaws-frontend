'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import styles from './page.module.css';

interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_sales: number;
  pending_orders: number;
  processing_orders: number;
}

interface MonthlySale {
  month: string;
  total: number;
  count: number;
}

interface TopProduct {
  id: string;
  nombre: string;
  vendidos: number;
  stock: number;
  precio: string;
}

interface RecentOrder {
  id: string;
  total: string;
  estado: string;
  createdAt: string;
  user: {
    nombre: string;
    email: string;
  };
}

interface RecentUser {
  id: string;
  nombre: string;
  email: string;
  role: string;
  createdAt: string;
}

interface CategoryDistribution {
  categoria: string;
  count: number;
  sales: number;
}

interface OrderStatusDistribution {
  estado: string;
  count: number;
  total: string;
}

interface DailySale {
  date: string;
  total: number;
  count: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_products: 0,
    total_orders: 0,
    total_sales: 0,
    pending_orders: 0,
    processing_orders: 0,
  });
  const [salesData, setSalesData] = useState<MonthlySale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState<OrderStatusDistribution[]>([]);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        salesRes,
        topProductsRes,
        ordersRes,
        usersRes,
        categoryRes,
        statusRes,
        dailySalesRes,
      ] = await Promise.all([
        api.get('/dashboard/overview'),
        api.get('/dashboard/sales-by-month'),
        api.get('/dashboard/top-products?limit=5'),
        api.get('/dashboard/recent-orders?limit=10'),
        api.get('/dashboard/recent-users?limit=5'),
        api.get('/dashboard/category-distribution'),
        api.get('/dashboard/order-status-distribution'),
        api.get('/dashboard/daily-sales?days=7'),
      ]);

      setStats(overviewRes.data.stats);
      setSalesData(salesRes.data);
      setTopProducts(topProductsRes.data);
      setRecentOrders(ordersRes.data);
      setRecentUsers(usersRes.data);
      setCategoryDistribution(categoryRes.data);
      setOrderStatusDistribution(statusRes.data);
      setDailySales(dailySalesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuración del gráfico de ventas mensuales
  const monthlyChartData = {
    labels: salesData.map(s => s.month),
    datasets: [
      {
        label: 'Ventas (S/)',
        data: salesData.map(s => s.total),
        backgroundColor: 'rgba(201, 169, 110, 0.2)',
        borderColor: '#c9a96e',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#c9a96e',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Configuración del gráfico de ventas diarias
  const dailyChartData = {
    labels: dailySales.map(s => {
      const date = new Date(s.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Ventas Diarias (S/)',
        data: dailySales.map(s => s.total),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  // Configuración del gráfico de distribución por categoría
  const categoryChartData = {
    labels: categoryDistribution.map(c => c.categoria),
    datasets: [
      {
        label: 'Cantidad de Productos',
        data: categoryDistribution.map(c => c.count),
        backgroundColor: [
          'rgba(201, 169, 110, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Configuración del gráfico de estado de pedidos
  const statusChartData = {
    labels: orderStatusDistribution.map(s => {
      const statusMap: Record<string, string> = {
        pending: 'Pendiente',
        processing: 'Procesando',
        shipped: 'Enviado',
        delivered: 'Entregado',
        cancelled: 'Cancelado',
      };
      return statusMap[s.estado] || s.estado;
    }),
    datasets: [
      {
        data: orderStatusDistribution.map(s => s.count),
        backgroundColor: [
          '#f59e0b',
          '#3b82f6',
          '#8b5cf6',
          '#10b981',
          '#ef4444',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 11 },
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `S/ ${context.raw.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `S/ ${value}`,
        },
        grid: {
          color: '#f0f0f0',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: { size: 11 },
        },
      },
    },
  };

  const dailyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `S/ ${context.raw.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `S/ ${value}`,
        },
      },
    },
  };

  const statsCards = [
    { title: 'Usuarios', value: stats.total_users, icon: 'pi pi-users', color: '#3b82f6', bg: '#eff6ff' },
    { title: 'Productos', value: stats.total_products, icon: 'pi pi-box', color: '#10b981', bg: '#ecfdf5' },
    { title: 'Pedidos', value: stats.total_orders, icon: 'pi pi-shopping-cart', color: '#f59e0b', bg: '#fffbeb' },
    { title: 'Ventas Totales', value: `S/ ${stats.total_sales.toFixed(2)}`, icon: 'pi pi-chart-line', color: '#c9a96e', bg: '#faf5eb' },
    { title: 'Pendientes', value: stats.pending_orders, icon: 'pi pi-clock', color: '#ef4444', bg: '#fef2f2' },
  ];

  const orderStatusBody = (rowData: RecentOrder) => {
    const statusMap: Record<string, { severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary'; label: string }> = {
      pending: { severity: 'warning', label: 'Pendiente' },
      processing: { severity: 'info', label: 'Procesando' },
      shipped: { severity: 'secondary', label: 'Enviado' },
      delivered: { severity: 'success', label: 'Entregado' },
      cancelled: { severity: 'danger', label: 'Cancelado' },
    };
    const status = statusMap[rowData.estado] || { severity: 'secondary', label: rowData.estado };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const userRoleBody = (rowData: RecentUser) => {
    return rowData.role === 'admin' ? 
      <Tag value="Administrador" severity="success" /> : 
      <Tag value="Usuario" severity="info" />;
  };

  const dateBody = (rowData: RecentOrder | RecentUser) => {
    return new Date(rowData.createdAt).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const priceBody = (rowData: RecentOrder) => {
    return `S/ ${parseFloat(rowData.total).toFixed(2)}`;
  };

  const productPriceBody = (rowData: TopProduct) => {
    return `S/ ${parseFloat(rowData.precio).toFixed(2)}`;
  };

  const stockBody = (rowData: TopProduct) => {
    if (rowData.stock === 0) return <Tag value="Agotado" severity="danger" />;
    if (rowData.stock < 10) return <Tag value={`Stock bajo: ${rowData.stock}`} severity="warning" />;
    return <Tag value={rowData.stock} severity="info" />;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <ProgressSpinner />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Tarjetas de estadísticas */}
      <div className={styles.statsGrid}>
        {statsCards.map((stat, index) => (
          <Card key={index} className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
                <i className={stat.icon}></i>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statTitle}>{stat.title}</h3>
                <p className={styles.statValue}>{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gráfico de ventas mensuales */}
      <div className={styles.chartsGrid}>
        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <i className="pi pi-chart-line" style={{ marginRight: '0.5rem', color: '#c9a96e' }}></i>
              Ventas por Mes
            </h3>
          </div>
          <div className={styles.chartContainer}>
            {salesData.length > 0 ? (
              <Chart type="line" data={monthlyChartData} options={chartOptions} />
            ) : (
              <div className={styles.noData}>No hay datos de ventas</div>
            )}
          </div>
        </Card>
      </div>

      {/* Ventas diarias */}
      <div className={styles.chartsGrid}>
        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <i className="pi pi-calendar" style={{ marginRight: '0.5rem', color: '#3b82f6' }}></i>
              Ventas de los Últimos 7 Días
            </h3>
          </div>
          <div className={styles.chartContainer}>
            {dailySales.length > 0 ? (
              <Chart type="line" data={dailyChartData} options={dailyOptions} />
            ) : (
              <div className={styles.noData}>No hay datos de ventas</div>
            )}
          </div>
        </Card>
      </div>

      {/* Dos columnas: Gráficos */}
      <div className={styles.twoColumns}>
        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <i className="pi pi-tag" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
              Distribución por Categoría
            </h3>
          </div>
          <div className={styles.pieChartContainer}>
            {categoryDistribution.length > 0 ? (
              <Chart type="pie" data={categoryChartData} options={pieOptions} />
            ) : (
              <div className={styles.noData}>No hay datos de categorías</div>
            )}
          </div>
        </Card>

        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <i className="pi pi-chart-pie" style={{ marginRight: '0.5rem', color: '#f59e0b' }}></i>
              Distribución de Pedidos
            </h3>
          </div>
          <div className={styles.pieChartContainer}>
            {orderStatusDistribution.length > 0 ? (
              <Chart type="doughnut" data={statusChartData} options={pieOptions} />
            ) : (
              <div className={styles.noData}>No hay datos de pedidos</div>
            )}
          </div>
        </Card>
      </div>

      {/* Dos columnas: Tablas */}
      <div className={styles.twoColumns}>
        {/* Productos más vendidos */}
        <Card className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <i className="pi pi-star" style={{ marginRight: '0.5rem', color: '#f59e0b' }}></i>
              Productos Más Vendidos
            </h3>
          </div>
          <DataTable
            value={topProducts}
            rows={5}
            emptyMessage="No hay productos"
            className={styles.table}
          >
            <Column field="nombre" header="Producto" sortable />
            <Column field="vendidos" header="Vendidos" sortable style={{ width: '100px' }} />
            <Column field="stock" header="Stock" body={stockBody} style={{ width: '120px' }} />
            <Column
              field="precio"
              header="Precio"
              body={productPriceBody}
              style={{ width: '100px' }}
            />
          </DataTable>
        </Card>

        {/* Pedidos recientes */}
        <Card className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <i className="pi pi-shopping-bag" style={{ marginRight: '0.5rem', color: '#c9a96e' }}></i>
              Pedidos Recientes
            </h3>
          </div>
          <DataTable
            value={recentOrders}
            rows={5}
            emptyMessage="No hay pedidos"
            className={styles.table}
          >
            <Column field="user.nombre" header="Cliente" />
            <Column field="total" header="Total" body={priceBody} style={{ width: '100px' }} />
            <Column field="estado" header="Estado" body={orderStatusBody} style={{ width: '120px' }} />
            <Column field="createdAt" header="Fecha" body={dateBody} style={{ width: '120px' }} />
          </DataTable>
        </Card>
      </div>

      {/* Usuarios recientes */}
      <div className={styles.singleColumn}>
        <Card className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <i className="pi pi-users" style={{ marginRight: '0.5rem', color: '#3b82f6' }}></i>
              Usuarios Recientes
            </h3>
          </div>
          <DataTable
            value={recentUsers}
            rows={5}
            emptyMessage="No hay usuarios"
            className={styles.table}
          >
            <Column field="nombre" header="Nombre" sortable />
            <Column field="email" header="Email" sortable />
            <Column field="role" header="Rol" body={userRoleBody} style={{ width: '120px' }} />
            <Column field="createdAt" header="Registro" body={dateBody} style={{ width: '120px' }} />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}