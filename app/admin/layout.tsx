'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import Link from 'next/link';
import styles from './layout.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!isAdmin) {
        router.replace('/');
      }
    }
  }, [user, loading, isAdmin, router]);

  // No renderizar nada mientras carga o si no hay acceso
  if (loading || !user || !isAdmin) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>
          <i className="pi pi-spin pi-spinner"></i>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Dashboard', icon: 'pi pi-chart-line', href: '/admin/dashboard' },
    { label: 'Usuarios', icon: 'pi pi-users', href: '/admin/users' },
    { label: 'Productos', icon: 'pi pi-box', href: '/admin/products' },
    { label: 'Pedidos', icon: 'pi pi-shopping-cart', href: '/admin/orders' },
  ];

  return (
    <div className={styles.adminContainer}>
      <Button
        icon="pi pi-bars"
        className={styles.menuButton}
        onClick={() => setSidebarVisible(true)}
      />

      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>Velvet Admin</h2>
        </div>
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.logoutSection}>
          <Button
            label="Cerrar Sesión"
            icon="pi pi-sign-out"
            onClick={logout}
            text
            className={styles.logoutBtn}
          />
        </div>
      </aside>

      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        position="left"
        className={styles.mobileSidebar}
      >
        <div className={styles.mobileLogo}>
          <h2>Velvet Admin</h2>
        </div>
        <nav className={styles.mobileNav}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileNavLink} ${pathname === item.href ? styles.active : ''}`}
              onClick={() => setSidebarVisible(false)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.mobileLogout}>
          <Button
            label="Cerrar Sesión"
            icon="pi pi-sign-out"
            onClick={logout}
            text
            className={styles.logoutBtn}
          />
        </div>
      </Sidebar>

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Panel de Administración</h1>
          <div className={styles.userInfo}>
            <i className="pi pi-user"></i>
            <span>{user?.nombre}</span>
          </div>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}