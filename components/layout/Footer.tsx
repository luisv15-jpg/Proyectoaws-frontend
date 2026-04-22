'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div className={styles.footerCol}>
            <h3>Velvet</h3>
            <p>Elegancia que Seduce</p>
            <div className={styles.socialLinks}>
              <a href="#" target="_blank" rel="noopener noreferrer"><i className="pi pi-instagram"></i></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><i className="pi pi-facebook"></i></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><i className="pi pi-twitter"></i></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><i className="pi pi-youtube"></i></a>
            </div>
          </div>
          <div className={styles.footerCol}>
            <h4>Enlaces rápidos</h4>
            <ul>
              <li><Link href="/products">Productos</Link></li>
              <li><Link href="/about">Sobre nosotros</Link></li>
              <li><Link href="/#">Contacto</Link></li>
              <li><Link href="/faq">Preguntas frecuentes</Link></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Atención al cliente</h4>
            <ul>
              <li><Link href="/#">Devoluciones</Link></li>
              <li><Link href="/#">Envíos</Link></li>
              <li><Link href="/#">Términos y condiciones</Link></li>
              <li><Link href="/#">Política de privacidad</Link></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Contacto</h4>
            <ul>
              <li><i className="pi pi-phone"></i> +51 987 654 321</li>
              <li><i className="pi pi-envelope"></i> hola@velvet.com</li>
              <li><i className="pi pi-map-marker"></i> Lima, Perú</li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; {currentYear} Velvet - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
}