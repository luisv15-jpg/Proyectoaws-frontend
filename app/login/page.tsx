'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.brand}>
          <h1 className={styles.brandTitle}>Velvet</h1>
          <p className={styles.brandSubtitle}>Elegancia que Seduce</p>
        </div>
        <div className={styles.quote}>
          <p>"La moda es el armor para sobrevivir a la realidad cotidiana"</p>
          <span>- Bill Cunningham</span>
          {/* Botón de regreso debajo de Bill */}
          <Link href="/" className={styles.backButton}>
            <i className="pi pi-arrow-left"></i>
            <span className={styles.backText}>Volver a tienda</span>
          </Link>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Bienvenido</h2>
            <p className={styles.cardSubtitle}>Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorMessage}>
                <i className="pi pi-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Correo electrónico
              </label>
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                placeholder="usuario@ejemplo.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Contraseña
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

            <div className={styles.forgotPassword}>
              <Link href="/forgot-password" className={styles.forgotLink}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button 
              type="submit" 
              label="Iniciar Sesión" 
              icon="pi pi-sign-in" 
              loading={loading}
              className={styles.loginBtn}
            />

            <Divider align="center" className={styles.divider}>
              <span className={styles.dividerText}>o</span>
            </Divider>

            <div className={styles.registerSection}>
              <p className={styles.registerText}>
                ¿No tienes cuenta?
              </p>
              <Link href="/register">
                <Button 
                  label="Crear una cuenta" 
                  icon="pi pi-user-plus" 
                  text 
                  className={styles.registerBtn}
                />
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}