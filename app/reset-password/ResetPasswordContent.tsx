'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido');
    }
  }, [token]);

  // Limpiar token de la URL después de cargar
  useEffect(() => {
    if (token) {
      // Limpiar URL sin recargar la página
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      toast.success('Contraseña actualizada correctamente');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <div className={styles.errorIcon}>
            <i className="pi pi-times-circle"></i>
          </div>
          <h2 className={styles.errorTitle}>Token inválido</h2>
          <p className={styles.errorMessage}>
            El enlace de recuperación no es válido o ha expirado.
          </p>
          <Link href="/forgot-password" className={styles.backButton}>
            <i className="pi pi-arrow-left"></i>
            <span className={styles.backText}>Solicitar nuevo enlace</span>
          </Link>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <div className={styles.successIcon}>
            <i className="pi pi-check-circle"></i>
          </div>
          <h2 className={styles.successTitle}>¡Contraseña actualizada!</h2>
          <p className={styles.successMessage}>
            Tu contraseña ha sido restablecida correctamente.
          </p>
          <p className={styles.successHint}>
            Serás redirigido al inicio de sesión en unos segundos...
          </p>
          <Link href="/login" className={styles.backButton}>
            <i className="pi pi-arrow-left"></i>
            <span className={styles.backText}>Ir al inicio de sesión</span>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Link href="/login" className={styles.backButton}>
          <i className="pi pi-arrow-left"></i>
          <span className={styles.backText}>Volver al inicio de sesión</span>
        </Link>

        <div className={styles.illustration}>
          <i className="pi pi-key"></i>
        </div>

        <div className={styles.header}>
          <h1>Restablecer contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              <i className="pi pi-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Nueva contraseña
            </label>
            <InputText
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirmar contraseña
            </label>
            <InputText
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          <Button 
            type="submit" 
            label="Restablecer contraseña" 
            icon="pi pi-check" 
            loading={loading}
            className={styles.submitBtn}
          />
        </form>
      </Card>
    </div>
  );
}