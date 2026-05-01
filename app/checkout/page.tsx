'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { RadioButton } from 'primereact/radiobutton';
import { Divider } from 'primereact/divider';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import styles from './page.module.css';

interface ShippingInfo {
  nombre: string;
  dni: string;
  telefono: string;
  direccion: string;
  distrito: string;
  ciudad: string;
  referencia: string;
}

interface PaymentMethod {
  name: string;
  key: string;
  icon: string;
}

export default function CheckoutPage() {
  const { user, loading, refreshUser } = useAuth();
  const { items, total, loading: cartLoading, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    nombre: '',
    dni: '',
    telefono: '',
    direccion: '',
    distrito: '',
    ciudad: '',
    referencia: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('yape');

  const paymentMethods: PaymentMethod[] = [
    { name: 'Yape', key: 'yape', icon: 'pi pi-mobile' },
    { name: 'Plin', key: 'plin', icon: 'pi pi-mobile' },
    { name: 'Transferencia Bancaria', key: 'transferencia', icon: 'pi pi-building' },
    { name: 'Tarjeta de Crédito/Débito', key: 'tarjeta', icon: 'pi pi-credit-card' },
  ];

  useEffect(() => {
    if (user && !loading) {
      refreshUser().then(() => {

        if (!sessionStorage.getItem('checkout_reloaded')) {
          sessionStorage.setItem('checkout_reloaded', 'true');
          setIsReloading(true);
          router.refresh();
        }
      });
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        nombre: user.nombre || '',
        dni: user.dni || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!user && !loading && !isReloading) {
      router.push('/login');
    }
    if (user && items.length === 0 && !cartLoading) {
      router.push('/cart');
    }
  }, [user, items, loading, cartLoading, router, isReloading]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingInfo.direccion || !shippingInfo.ciudad) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = async () => {
    setLoadingSubmit(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          talla: item.talla,
          color: item.color,
          cantidad: item.cantidad,
        })),
        metodo_pago: paymentMethod,
        direccion_entrega: `${shippingInfo.direccion}, ${shippingInfo.distrito}, ${shippingInfo.ciudad}`,
      };

      const response = await api.post('/orders', orderData);

      await clearCart();

      sessionStorage.removeItem('checkout_reloaded');

      toast.success('Pedido realizado exitosamente');
      router.push(`/orders/${response.data.order.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar el pedido');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading || cartLoading || isReloading) {
    return (
      <>
        <Navbar />
        <div className={styles.loading}>
          <i className="pi pi-spin pi-spinner"></i>
          <p>Cargando...</p>
        </div>
      </>
    );
  }

  if (!user || items.length === 0) return null;

  const subtotal = total;
  const envio = subtotal > 200 ? 0 : 15;
  const totalFinal = subtotal + envio;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>Finalizar Compra</h1>

        <div className={styles.steps}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>1</div>
            <span>Dirección</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>2</div>
            <span>Pago</span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.formSection}>
            {step === 1 && (
              <Card className={styles.formCard}>
                <h2 className={styles.sectionTitle}>Información de envío</h2>
                <form onSubmit={handleShippingSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Nombre completo *</label>
                      <InputText
                        value={shippingInfo.nombre}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>DNI *</label>
                      <InputText
                        value={shippingInfo.dni}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, dni: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Teléfono *</label>
                      <InputText
                        value={shippingInfo.telefono}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, telefono: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Correo electrónico</label>
                      <InputText value={user?.email} disabled />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Dirección *</label>
                    <InputText
                      value={shippingInfo.direccion}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, direccion: e.target.value })}
                      placeholder="Calle, número, urbanización"
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Distrito *</label>
                      <InputText
                        value={shippingInfo.distrito}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, distrito: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Ciudad *</label>
                      <InputText
                        value={shippingInfo.ciudad}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, ciudad: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Referencia (opcional)</label>
                    <InputText
                      value={shippingInfo.referencia}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, referencia: e.target.value })}
                      placeholder="Referencia adicional para la entrega"
                    />
                  </div>

                  <Button type="submit" label="Continuar con el pago" icon="pi pi-arrow-right" className={styles.continueBtn} />
                </form>
              </Card>
            )}

            {step === 2 && (
              <Card className={styles.formCard}>
                <h2 className={styles.sectionTitle}>Método de pago</h2>

                <div className={styles.paymentMethods}>
                  {paymentMethods.map((method) => (
                    <label key={method.key} className={styles.paymentOption}>
                      <RadioButton
                        inputId={method.key}
                        value={method.key}
                        onChange={(e) => setPaymentMethod(e.value)}
                        checked={paymentMethod === method.key}
                      />
                      <i className={method.icon}></i>
                      <span>{method.name}</span>
                    </label>
                  ))}
                </div>

                <Divider />

                <div className={styles.paymentInfo}>
                  {paymentMethod === 'yape' && (
                    <div className={styles.paymentDetails}>
                      <i className="pi pi-info-circle"></i>
                      <p>El número de Yape se mostrará después de confirmar el pedido.</p>
                    </div>
                  )}
                  {paymentMethod === 'plin' && (
                    <div className={styles.paymentDetails}>
                      <i className="pi pi-info-circle"></i>
                      <p>El número de Plin se mostrará después de confirmar el pedido.</p>
                    </div>
                  )}
                  {paymentMethod === 'transferencia' && (
                    <div className={styles.paymentDetails}>
                      <i className="pi pi-info-circle"></i>
                      <p>Los datos bancarios se enviarán a tu correo después de confirmar el pedido.</p>
                    </div>
                  )}
                  {paymentMethod === 'tarjeta' && (
                    <div className={styles.paymentDetails}>
                      <i className="pi pi-info-circle"></i>
                      <p>Serás redirigido a la pasarela de pagos segura.</p>
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <Button label="Volver" icon="pi pi-arrow-left" onClick={() => setStep(1)} text />
                  <Button
                    label="Confirmar pedido"
                    icon="pi pi-check"
                    onClick={handlePaymentSubmit}
                    loading={loadingSubmit}
                    className={styles.confirmBtn}
                  />
                </div>
              </Card>
            )}
          </div>

          <div className={styles.summarySection}>
            <Card className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Resumen del pedido</h3>

              <div className={styles.summaryItems}>
                {items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div className={styles.summaryItemInfo}>
                      <span className={styles.summaryItemName}>{item.product.nombre}</span>
                      <span className={styles.summaryItemDetail}>
                        {item.talla} / {item.color} x {item.cantidad}
                      </span>
                    </div>
                    <span className={styles.summaryItemPrice}>
                      S/ {(item.precio_unitario * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Divider />

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Envío</span>
                <span>{envio === 0 ? 'Gratis' : `S/ ${envio.toFixed(2)}`}</span>
              </div>
              <div className={styles.summaryDivider}></div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>S/ {totalFinal.toFixed(2)}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}