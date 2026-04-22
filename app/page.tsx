'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Product } from '@/types';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './page.module.css';
import Footer from '@/components/layout/Footer';

export default function Home() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailNewsletter, setEmailNewsletter] = useState('');

  useEffect(() => {
    // Inicializar AOS
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });

    const fetchData = async () => {
      try {
        const [productsRes] = await Promise.all([
          api.get('/products?limit=12'),
        ]);
        setFeaturedProducts(productsRes.data.products || []);

        if (user) {
          try {
            const recRes = await api.get('/ai/recommendations?limit=6');
            setRecommendations(recRes.data || []);
          } catch (recError) {
            console.error('Error fetching recommendations:', recError);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailNewsletter) {
      alert(`¡Gracias por suscribirte con ${emailNewsletter}!`);
      setEmailNewsletter('');
    }
  };

  const getProductPrice = (product: Product) => {
    const precioOferta = product.precio_oferta ? parseFloat(product.precio_oferta as any) : null;
    const precioOriginal = parseFloat(product.precio as any);
    
    if (precioOferta && !isNaN(precioOferta)) {
      return {
        price: precioOferta.toFixed(2),
        originalPrice: precioOriginal.toFixed(2),
        hasOffer: true
      };
    }
    return {
      price: precioOriginal.toFixed(2),
      originalPrice: null,
      hasOffer: false
    };
  };

  const productTemplate = (product: Product) => {
    const { price, originalPrice, hasOffer } = getProductPrice(product);

    return (
      <div className={styles.productCard} data-aos="fade-up">
        <img 
          src={product.imagen_principal || '/placeholder.jpg'} 
          alt={product.nombre} 
          className={styles.productImage}
        />
        <div className={styles.productContent}>
          <h3 className={styles.productTitle}>{product.nombre}</h3>
          <div className={styles.productPrice}>
            {hasOffer && (
              <span className={styles.originalPrice}>S/ {originalPrice}</span>
            )}
            <span className={hasOffer ? styles.offerPrice : styles.normalPrice}>
              S/ {price}
            </span>
          </div>
          <Link href={`/product/${product.id}`}>
            <Button 
              label="Ver Detalles" 
              icon="pi pi-eye" 
              className={styles.productButton}
            />
          </Link>
        </div>
      </div>
    );
  };

  const categories = [
    { name: 'Poleras', icon: 'pi pi-shopping-bag', color: '#c9a96e', href: '/products?categoria=poleras' },
    { name: 'Pantalones', icon: 'pi pi-tag', color: '#3b82f6', href: '/products?categoria=pantalones' },
    { name: 'Vestidos', icon: 'pi pi-heart', color: '#ec4899', href: '/products?categoria=vestidos' },
    { name: 'Zapatos', icon: 'pi pi-gift', color: '#10b981', href: '/products?categoria=zapatos' },
    { name: 'Accesorios', icon: 'pi pi-star', color: '#8b5cf6', href: '/products?categoria=accesorios' },
    { name: 'Chaquetas', icon: 'pi pi-warehouse', color: '#f59e0b', href: '/products?categoria=chaquetas' },
    { name: 'Deportivo', icon: 'pi pi-star', color: '#ef4444', href: '/products?categoria=deportivo' },
    { name: 'Ofertas', icon: 'pi pi-percentage', color: '#06b6d4', href: '/products?precio_oferta=si' },
  ];

  const testimonials = [
    { name: 'María González', role: 'Cliente frecuente', text: 'La calidad de las prendas es excelente. Me encanta cómo se sienten y cómo me quedan.', rating: 5, avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { name: 'Carlos Rodríguez', role: 'Comprador verificado', text: 'Rápido envío y atención al cliente impecable. Volveré a comprar sin duda.', rating: 5, avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { name: 'Ana Lucía', role: 'Cliente Premium', text: 'Los diseños son únicos y la calidad es insuperable. Mi tienda favorita.', rating: 5, avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { name: 'Javier Pérez', role: 'Nuevo cliente', text: 'Excelente relación precio-calidad. Muy satisfecho con mi compra.', rating: 4, avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  ];

  const benefits = [
    { icon: 'pi pi-truck', title: 'Envío gratis', description: 'En compras mayores a S/200' },
    { icon: 'pi pi-lock', title: 'Pago seguro', description: 'Transacciones 100% protegidas' },
    { icon: 'pi pi-refresh', title: 'Devoluciones fáciles', description: '30 días para cambiar de opinión' },
    { icon: 'pi pi-headphones', title: 'Soporte 24/7', description: 'Atención al cliente siempre' },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.skeletonHero}>
          <div className={styles.skeleton}></div>
        </div>
        <div className="container">
          <div className={styles.productGrid}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeleton}></div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Hero Banner */}
      <div className={styles.hero} data-aos="zoom-in">
        <div className={styles.heroOverlay}>
          <h1 className={styles.heroTitle}>Elegancia que Seduce</h1>
          <p className={styles.heroSubtitle}>Descubre ropa que hará que todos te miren</p>
          <div className={styles.heroButton}>
            <Link href="/products">
              <Button label="Comprar Ahora" size="large" />
            </Link>
          </div>
        </div>
      </div>

      {/* Beneficios */}
      <div className={styles.benefitsSection}>
        <div className="container">
          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <div key={index} className={styles.benefitCard} data-aos="fade-up" data-aos-delay={index * 100}>
                <i className={benefit.icon}></i>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Categorías destacadas */}
        <div className={styles.section} data-aos="fade-up">
          <h2 className={styles.sectionTitle}>Categorías Destacadas</h2>
          <div className={styles.categoriesGrid}>
            {categories.map((cat, index) => (
              <Link key={index} href={cat.href} className={styles.categoryCard} style={{ '--cat-color': cat.color } as React.CSSProperties} data-aos="zoom-in" data-aos-delay={index * 50}>
                <i className={cat.icon}></i>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recomendaciones personalizadas */}
        {user && recommendations.length > 0 && (
          <div className={styles.section} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>✨ Recomendado para ti</h2>
            <Carousel 
              value={recommendations} 
              itemTemplate={productTemplate} 
              numVisible={4} 
              numScroll={4}
              responsiveOptions={[
                { breakpoint: '1024px', numVisible: 3, numScroll: 3 },
                { breakpoint: '768px', numVisible: 2, numScroll: 2 },
                { breakpoint: '560px', numVisible: 1, numScroll: 1 }
              ]}
            />
          </div>
        )}

        {/* Productos destacados */}
        <div className={styles.section} data-aos="fade-up">
          <h2 className={styles.sectionTitle}>Productos Destacados</h2>
          <div className={styles.productGrid}>
            {featuredProducts.slice(0, 8).map((product) => (
              <div key={product.id}>
                {productTemplate(product)}
              </div>
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link href="/products">
              <Button label="Ver todos los productos" icon="pi pi-arrow-right" text />
            </Link>
          </div>
        </div>

        {/* Testimonios */}
        <div className={styles.section} data-aos="fade-up">
          <h2 className={styles.sectionTitle}>Lo que dicen nuestros clientes</h2>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard} data-aos="flip-left" data-aos-delay={index * 100}>
                <div className={styles.testimonialHeader}>
                  <img src={testimonial.avatar} alt={testimonial.name} className={styles.testimonialAvatar} />
                  <div>
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
                <div className={styles.testimonialRating}>
                  {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                </div>
                <p className={styles.testimonialText}>"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className={styles.newsletterSection} data-aos="zoom-in">
          <div className={styles.newsletterContent}>
            <i className="pi pi-envelope"></i>
            <h3>Suscríbete a nuestro newsletter</h3>
            <p>Recibe ofertas exclusivas y novedades directamente en tu correo</p>
            <form onSubmit={handleNewsletter} className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={emailNewsletter}
                onChange={(e) => setEmailNewsletter(e.target.value)}
                required
              />
              <Button type="submit" label="Suscribirse" icon="pi pi-send" />
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}