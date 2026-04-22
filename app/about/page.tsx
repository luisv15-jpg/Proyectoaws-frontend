'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Link from 'next/link';
import { Button } from 'primereact/button';
import styles from './page.module.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <>
        <Navbar />
        <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero} data-aos="fade-in">
            <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Sobre Velvet</h1>
            <p className={styles.heroSubtitle}>
                Donde la elegancia se encuentra con la pasión por la moda
            </p>
            </div>
        </section>

        {/* Historia */}
        <section className={styles.section} data-aos="fade-up">
            <div className={styles.sectionContent}>
            <div className={styles.textContent}>
                <h2>Nuestra Historia</h2>
                <p>
                Velvet nació en 2020 con una visión clara: crear una marca de moda que 
                combinara la elegancia atemporal con la sensualidad moderna. 
                Desde nuestros inicios, nos hemos dedicado a ofrecer prendas que 
                empoderan y realzan la belleza única de cada persona.
                </p>
                <p>
                Inspirados por la sofisticación de las grandes casas de moda europeas 
                y la calidez de la artesanía local, cada prenda Velvet es diseñada 
                pensando en quienes buscan destacar sin esfuerzo.
                </p>
            </div>
            <div className={styles.imageContent}>
                <div className={styles.imagePlaceholder}>
                <img 
                    src="https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg" 
                    alt="Tienda Velvet" 
                    className={styles.aboutImage}
                />
                </div>
            </div>
            </div>
        </section>

        {/* Misión y Visión */}
        <section className={styles.section} data-aos="fade-up">
            <div className={styles.missionVision}>
            <div className={styles.card}>
                <i className="pi pi-star"></i>
                <h3>Misión</h3>
                <p>
                Ofrecer prendas de alta calidad que fusionen elegancia y comodidad, 
                permitiendo a nuestros clientes expresar su estilo único con confianza.
                </p>
            </div>
            <div className={styles.card}>
                <i className="pi pi-eye"></i>
                <h3>Visión</h3>
                <p>
                Ser la marca de referencia en moda elegante y sensual en Latinoamérica, 
                reconocida por nuestra calidad, diseño y compromiso con la sostenibilidad.
                </p>
            </div>
            <div className={styles.card}>
                <i className="pi pi-heart"></i>
                <h3>Valores</h3>
                <p>
                Calidad, autenticidad, inclusión, sostenibilidad y pasión por lo que hacemos.
                </p>
            </div>
            </div>
        </section>

        {/* Valores detallados */}
        <section className={styles.section} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>Nuestros Valores</h2>
            <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
                <i className="pi pi-gem"></i>
                <h4>Calidad</h4>
                <p>Materiales seleccionados y acabados impecables en cada prenda.</p>
            </div>
            <div className={styles.valueCard}>
                <i className="pi pi-users"></i>
                <h4>Inclusión</h4>
                <p>Moda para todos los cuerpos, tallas y estilos.</p>
            </div>
            <div className={styles.valueCard}>
                <i className="pi pi-leaf"></i>
                <h4>Sostenibilidad</h4>
                <p>Comprometidos con prácticas responsables y el medio ambiente.</p>
            </div>
            <div className={styles.valueCard}>
                <i className="pi pi-heart-fill"></i>
                <h4>Pasión</h4>
                <p>Cada diseño nace del amor por la moda y la elegancia.</p>
            </div>
            </div>
        </section>

        {/* Equipo */}
        <section className={styles.section} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>Nuestro Equipo</h2>
            <div className={styles.teamGrid}>
            <div className={styles.teamCard}>
                <div className={styles.teamAvatar}>
                <i className="pi pi-user"></i>
                </div>
                <h4>María Fernanda López</h4>
                <span>Fundadora & Directora Creativa</span>
                <p>Con más de 10 años de experiencia en la industria de la moda.</p>
            </div>
            <div className={styles.teamCard}>
                <div className={styles.teamAvatar}>
                <i className="pi pi-user"></i>
                </div>
                <h4>Carlos Alberto Ruiz</h4>
                <span>Diseñador Principal</span>
                <p>Especialista en tendencias y diseño de vanguardia.</p>
            </div>
            <div className={styles.teamCard}>
                <div className={styles.teamAvatar}>
                <i className="pi pi-user"></i>
                </div>
                <h4>Valentina Gómez</h4>
                <span>Directora de Marketing</span>
                <p>Estratega digital apasionada por la moda.</p>
            </div>
            </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection} data-aos="zoom-in">
            <div className={styles.ctaContent}>
            <h3>¿Listo para descubrir tu nuevo estilo?</h3>
            <p>Explora nuestra colección y encuentra las prendas que harán brillar tu esencia.</p>
            <Link href="/products">
                <Button label="Ver Colección" icon="pi pi-arrow-right" className={styles.ctaBtn} />
            </Link>
            </div>
        </section>
        </div>
        <Footer />
    </>
  );
}