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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  // Validaciones de contraseña
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const validatePassword = (password: string) => {
    setPasswordErrors({
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    validatePassword(password);
  };

  const isPasswordValid = () => {
    return (
      passwordErrors.minLength &&
      passwordErrors.uppercase &&
      passwordErrors.lowercase &&
      passwordErrors.number &&
      passwordErrors.specialChar
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (!isPasswordValid()) {
      setError('La contraseña no cumple con los requisitos');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({ 
        nombre: formData.nombre, 
        email: formData.email, 
        password: formData.password 
      });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
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
          <p>"La elegancia no es llamar la atención, sino quedarse en la memoria"</p>
          <span>- Giorgio Armani</span>
          <Link href="/" className={styles.backButton}>
            <i className="pi pi-arrow-left"></i>
            <span className={styles.backText}>Volver a tienda</span>
          </Link>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Crear Cuenta</h2>
            <p className={styles.cardSubtitle}>Regístrate para comenzar</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorMessage}>
                <i className="pi pi-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="nombre" className={styles.label}>
                Nombre completo
              </label>
              <InputText
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                className={styles.input}
                placeholder="Tu nombre"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Correo electrónico
              </label>
              <InputText
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.password}
                onChange={handlePasswordChange}
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
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className={styles.input}
                placeholder="••••••••"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className={styles.passwordMismatch}>
                  <i className="pi pi-times-circle"></i>
                  Las contraseñas no coinciden
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              label="Registrarse" 
              icon="pi pi-user-plus" 
              loading={loading}
              className={styles.registerBtn}
              disabled={!isPasswordValid()}
            />

            <Divider align="center" className={styles.divider}>
              <span className={styles.dividerText}>o</span>
            </Divider>

            <div className={styles.loginSection}>
              <p className={styles.loginText}>
                ¿Ya tienes cuenta?
              </p>
              <Link href="/login">
                <Button 
                  label="Iniciar Sesión" 
                  icon="pi pi-sign-in" 
                  text 
                  className={styles.loginLinkBtn}
                />
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}