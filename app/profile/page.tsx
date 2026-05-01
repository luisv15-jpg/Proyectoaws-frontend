'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Divider } from 'primereact/divider';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Skeleton } from 'primereact/skeleton';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import { uploadToS3 } from '@/lib/upload';
import toast from 'react-hot-toast';
import styles from './page.module.css';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

interface UserProfile {
  nombre: string;
  email: string;
  dni: string;
  telefono: string;
  direccion: string;
  avatar: string | null;
  altura_cm: number | null;
  peso_kg: number | null;
}

interface RecentOrder {
  id: string;
  total: string;
  estado: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true); 
  const [profile, setProfile] = useState<UserProfile>({
    nombre: '',
    email: '',
    dni: '',
    telefono: '',
    direccion: '',
    avatar: null,
    altura_cm: null,
    peso_kg: null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const loadProfileData = async () => {
    setLoadingProfile(true);
    try {
      const response = await api.get('/users/profile/me');
      const userData = response.data;
      setProfile({
        nombre: userData.nombre || '',
        email: userData.email || '',
        dni: userData.dni || '',
        telefono: userData.telefono || '',
        direccion: userData.direccion || '',
        avatar: userData.avatar || null,
        altura_cm: userData.altura_cm || null,
        peso_kg: userData.peso_kg || null,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar perfil');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      loadProfileData();
      fetchRecentOrders();
    }
  }, [user, loading, router]);

  const fetchRecentOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await api.get('/orders/my-orders?limit=5');
      setRecentOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 2MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const url = await uploadToS3(file, 'avatars');
      await api.put('/users/profile/me', { avatar: url });
      
      await loadProfileData();
      
      toast.success('Foto de perfil actualizada');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al subir la imagen');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoadingSave(true);
    try {
      const updateData: any = {
        nombre: profile.nombre,
      };

      if (profile.dni) updateData.dni = profile.dni;
      if (profile.telefono) updateData.telefono = profile.telefono;
      if (profile.direccion) updateData.direccion = profile.direccion;
      if (profile.avatar) updateData.avatar = profile.avatar;
      if (profile.altura_cm) updateData.altura_cm = Number(profile.altura_cm);
      if (profile.peso_kg) updateData.peso_kg = Number(profile.peso_kg);

      await api.put('/users/profile/me', updateData);
      
      await loadProfileData();
      
      toast.success('Perfil actualizado');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoadingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Contraseña actualizada');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoadingPassword(false);
    }
  };

  const getOrderStatusColor = (estado: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[estado] || '#888';
  };

  const getOrderStatusText = (estado: string) => {
    const texts: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return texts[estado] || estado;
  };

  if (loading || loadingProfile) {
    return (
      <>
        <Navbar />
        <div className={styles.loading}>
          <i className="pi pi-spin pi-spinner"></i>
          <p>Cargando perfil...</p>
        </div>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <ConfirmDialog />

        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <i className="pi pi-user"></i>
          </div>
          <div>
            <h1 className={styles.title}>Mi Perfil</h1>
            <p className={styles.subtitle}>Administra tu información personal</p>
          </div>
        </div>

        <div className={styles.content}>
          <Card className={styles.profileCard}>
            <TabView className={styles.tabView} activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
              <TabPanel header="Información personal">
                <div className={styles.form}>
                  {/* Avatar Section */}
                  <div className={styles.avatarSection}>
                    <div className={styles.avatarContainer}>
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className={styles.avatar} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          <i className="pi pi-user"></i>
                        </div>
                      )}
                      {uploadingAvatar && (
                        <div className={styles.avatarUploading}>
                          <i className="pi pi-spin pi-spinner"></i>
                        </div>
                      )}
                      <button
                        className={styles.changeAvatarBtn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        <i className="pi pi-camera"></i>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <p className={styles.avatarHint}>Haz clic en la cámara para cambiar tu foto</p>
                  </div>

                  <Divider />

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Nombre completo</label>
                      <InputText
                        value={profile.nombre}
                        onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Correo electrónico</label>
                      <InputText value={profile.email} disabled />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>DNI</label>
                      <InputText
                        value={profile.dni}
                        onChange={(e) => setProfile({ ...profile, dni: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Teléfono</label>
                      <InputText
                        value={profile.telefono}
                        onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Dirección</label>
                    <InputText
                      value={profile.direccion}
                      onChange={(e) => setProfile({ ...profile, direccion: e.target.value })}
                      placeholder="Calle, número, urbanización"
                    />
                  </div>

                  <Divider />

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Altura (cm)</label>
                      <InputText
                        type="number"
                        value={profile.altura_cm?.toString()}
                        onChange={(e) => setProfile({ ...profile, altura_cm: parseInt(e.target.value) || null })}
                        placeholder="Ej: 170"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Peso (kg)</label>
                      <InputText
                        type="number"
                        value={profile.peso_kg?.toString() || ''}
                        onChange={(e) => setProfile({ ...profile, peso_kg: parseInt(e.target.value) || null })}
                        placeholder="Ej: 70"
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <Button
                      label="Guardar cambios"
                      icon="pi pi-save"
                      onClick={handleSaveProfile}
                      loading={loadingSave}
                      className={styles.saveBtn}
                    />
                  </div>
                </div>
              </TabPanel>

              <TabPanel header="Cambiar contraseña">
                <div className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Contraseña actual</label>
                    <InputText
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Nueva contraseña</label>
                    <InputText
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Confirmar nueva contraseña</label>
                    <InputText
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className={styles.formActions}>
                    <Button
                      label="Cambiar contraseña"
                      icon="pi pi-key"
                      onClick={handleChangePassword}
                      loading={loadingPassword}
                      className={styles.changePasswordBtn}
                    />
                  </div>
                </div>
              </TabPanel>

              <TabPanel header="Mi actividad">
                <div className={styles.activitySection}>
                  <h3 className={styles.activityTitle}>Pedidos recientes</h3>
                  {loadingOrders ? (
                    <div className={styles.skeletonList}>
                      <Skeleton width="100%" height="60px" className="mb-2" />
                      <Skeleton width="100%" height="60px" className="mb-2" />
                      <Skeleton width="100%" height="60px" className="mb-2" />
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className={styles.emptyActivity}>
                      <i className="pi pi-shopping-bag"></i>
                      <p>No tienes pedidos recientes</p>
                      <Link href="/products">
                        <Button label="Explorar productos" icon="pi pi-shopping-cart" />
                      </Link>
                    </div>
                  ) : (
                    <div className={styles.ordersList}>
                      {recentOrders.map((order) => (
                        <div key={order.id} className={styles.orderCard}>
                          <div className={styles.orderInfo}>
                            <span className={styles.orderId}>Pedido #{order.id.slice(0, 8)}</span>
                            <span className={styles.orderDate}>
                              {new Date(order.createdAt).toLocaleDateString('es-PE')}
                            </span>
                          </div>
                          <div className={styles.orderDetails}>
                            <span className={styles.orderTotal}>S/ {parseFloat(order.total).toFixed(2)}</span>
                            <span
                              className={styles.orderStatus}
                              style={{ background: getOrderStatusColor(order.estado) }}
                            >
                              {getOrderStatusText(order.estado)}
                            </span>
                          </div>
                          <Link href={`/orders/${order.id}`} className={styles.orderLink}>
                            Ver detalles <i className="pi pi-arrow-right"></i>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={styles.viewAllLink}>
                    <Link href="/orders">
                      Ver todos mis pedidos <i className="pi pi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </TabPanel>

              <TabPanel header="Eliminar cuenta">
                <div className={styles.dangerZone}>
                  <div className={styles.dangerIcon}>
                    <i className="pi pi-exclamation-triangle"></i>
                  </div>
                  <h3 className={styles.dangerTitle}>Zona peligrosa</h3>
                  <p className={styles.dangerText}>
                    Una vez que elimines tu cuenta, todos tus datos serán eliminados permanentemente.
                    Esta acción no se puede deshacer.
                  </p>
                  <Button
                    label="Eliminar mi cuenta"
                    icon="pi pi-trash"
                    className={styles.deleteBtn}
                    onClick={() => {
                      confirmDialog({
                        message: '¿Estás seguro de que deseas eliminar tu cuenta?',
                        header: 'Eliminar cuenta',
                        icon: 'pi pi-exclamation-triangle',
                        acceptLabel: 'Sí, eliminar',
                        rejectLabel: 'Cancelar',
                        acceptClassName: 'p-button-danger',
                        accept: async () => {
                          try {
                            await api.patch('/users/profile/soft-delete');
                            toast.success('Cuenta eliminada');
                            logout();
                            router.push('/');
                          } catch (error) {
                            toast.error('Error al eliminar cuenta');
                          }
                        }
                      });
                    }}
                  />
                </div>
              </TabPanel>
            </TabView>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}