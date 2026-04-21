'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { getCartCount } = useCart();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <Link href="/">
            <span>LOGO</span>
          </Link>
        </div>

        <div className={styles.menu}>
          <Link href="/" className={styles.menuLink}>
            Inicio
          </Link>
          <Link href="/products" className={styles.menuLink}>
            Productos
          </Link>
          {isAdmin && (
            <div className={styles.adminMenu}>
              <Link href="/admin/dashboard" className={styles.menuLink}>
                Admin
              </Link>
            </div>
          )}
        </div>

        <div className={styles.rightSection}>
          <Link href="/cart" className={styles.cart}>
            <i className="pi pi-shopping-cart"></i>
            <Badge value={getCartCount()} severity="danger" className={styles.cartBadge} />
          </Link>

          {user ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>👤 {user.nombre}</span>
              <Button 
                icon="pi pi-sign-out" 
                onClick={logout} 
                text 
                className={styles.logoutBtn}
              />
            </div>
          ) : (
            <Link href="/login">
              <Button 
                icon="pi pi-user" 
                className={styles.loginBtn}
              />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}