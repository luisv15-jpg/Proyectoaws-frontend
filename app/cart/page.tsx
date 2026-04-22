'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import styles from './page.module.css';

export default function CartPage() {
  const { user } = useAuth();
  const { items, total, loading, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = (cartItemId: string, productName: string) => {
    confirmDialog({
      message: `¿Eliminar "${productName}" del carrito?`,
      header: 'Eliminar producto',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-secondary',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      accept: async () => {
        await removeItem(cartItemId);
      }
    });
  };

  const handleClearCart = () => {
    confirmDialog({
      message: '¿Estás seguro de que deseas vaciar todo el carrito?',
      header: 'Vaciar carrito',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, vaciar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-secondary',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      accept: async () => {
        await clearCart();
      }
    });
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loading}>
          <i className="pi pi-spin pi-spinner"></i>
          <p>Cargando carrito...</p>
        </div>
      </>
    );
  }

  if (!user) return null;

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>
            <i className="pi pi-shopping-cart"></i>
          </div>
          <h2>Tu carrito está vacío</h2>
          <p>¡Explora nuestros productos y agrega tus favoritos!</p>
          <Link href="/products">
            <Button label="Ver Productos" icon="pi pi-shopping-bag" className={styles.verProducts} />
          </Link>
        </div>
      </>
    );
  }

  const subtotal = total;
  const envio = subtotal > 200 ? 0 : 15;
  const totalFinal = subtotal + envio;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <ConfirmDialog 
          className={styles.customConfirmDialog}
          contentClassName={styles.confirmContent}
          acceptClassName={styles.confirmAcceptBtn}
          rejectClassName={styles.confirmRejectBtn}
        />
        
        <div className={styles.header}>
          <h1 className={styles.title}>Mi Carrito</h1>
          <button className={styles.clearBtn} onClick={handleClearCart}>
            <i className="pi pi-trash"></i>
            Vaciar carrito
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.itemsSection}>
            {items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <img 
                    src={item.product.imagen_principal || '/placeholder.jpg'} 
                    alt={item.product.nombre}
                  />
                </div>
                
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.product.nombre}</h3>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemDetail}>
                      <i className="pi pi-tag"></i> Talla: {item.talla}
                    </span>
                    <span className={styles.itemDetail}>
                      <i className="pi pi-palette"></i> Color: {item.color}
                    </span>
                  </div>
                  <div className={styles.itemPrice}>
                    S/ {item.precio_unitario.toFixed(2)}
                  </div>
                </div>
                
                <div className={styles.itemActions}>
                  <div className={styles.itemQuantity}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                    >
                      <i className="pi pi-minus"></i>
                    </button>
                    <span className={styles.qtyValue}>{item.cantidad}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                    >
                      <i className="pi pi-plus"></i>
                    </button>
                  </div>
                  <div className={styles.itemTotal}>
                    <span className={styles.totalLabel}>Total</span>
                    <span className={styles.totalValue}>
                      S/ {(item.precio_unitario * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveItem(item.id, item.product.nombre)}
                    title="Eliminar"
                  >
                    <i className="pi pi-times"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summarySection}>
            <Card className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Resumen del pedido</h3>
              
              <div className={styles.summaryRow}>
                <span>Subtotal ({items.reduce((sum, i) => sum + i.cantidad, 0)} productos)</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Envío</span>
                <span>{envio === 0 ? 'Gratis' : `S/ ${envio.toFixed(2)}`}</span>
              </div>
              {envio > 0 && (
                <div className={styles.shippingNote}>
                  <i className="pi pi-info-circle"></i>
                  ¡Envío gratis en compras mayores a S/ 200!
                </div>
              )}
              <div className={styles.summaryDivider}></div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>S/ {totalFinal.toFixed(2)}</span>
              </div>
              
              <Button 
                label="Proceder al pago" 
                icon="pi pi-arrow-right" 
                onClick={handleCheckout}
                className={styles.checkoutBtn}
              />
              
              <Link href="/products" className={styles.continueLink}>
                <i className="pi pi-arrow-left"></i>
                Seguir comprando
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}