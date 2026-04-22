'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <Link href="/login" className={styles.backButton}>
            <i className="pi pi-arrow-left"></i>
            <span className={styles.backText}>Volver al inicio de sesión</span>
          </Link>
          
          <div className={styles.successIcon}>
            <i className="pi pi-envelope"></i>
          </div>
          <h2 className={styles.successTitle}>¡Revisa tu correo!</h2>
          <p className={styles.successMessage}>
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>
          </p>
          
          <div className={styles.infoBox}>
            <i className="pi pi-info-circle"></i>
            <div>
              <strong>¿No recibiste el correo?</strong>
              <ul>
                <li>Revisa tu carpeta de spam o correo no deseado</li>
                <li>Verifica que el correo ingresado sea correcto</li>
                <li>Espera unos minutos y vuelve a intentarlo</li>
              </ul>
            </div>
          </div>

          <div className={styles.resendSection}>
            <p>¿No recibiste el enlace?</p>
            <button 
              onClick={() => setSubmitted(false)}
              className={styles.resendLink}
            >
              Volver a intentar
            </button>
          </div>
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
          <i className="pi pi-lock"></i>
        </div>

        <div className={styles.header}>
          <h1>¿Olvidaste tu contraseña?</h1>
          <p>No te preocupes, te ayudamos a recuperarla</p>
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

          <Button 
            type="submit" 
            label="Enviar enlace de recuperación" 
            icon="pi pi-send" 
            loading={loading}
            className={styles.submitBtn}
          />

          <div className={styles.steps}>
            <p className={styles.stepsTitle}>¿Cómo funciona?</p>
            <div className={styles.stepsGrid}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepText}>Ingresa tu correo electrónico</div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepText}>Recibirás un enlace de recuperación</div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepText}>Crea una nueva contraseña</div>
              </div>
            </div>
          </div>

          <div className={styles.support}>
            <i className="pi pi-headphones"></i>
            <span>¿Necesitas ayuda? </span>
            <Link href="/contacto" className={styles.supportLink}>
              Contacta con soporte
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}