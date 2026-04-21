'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Product } from '@/types';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import styles from './page.module.css';

export default function Home() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <div className={styles.productCard}>
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
      <div className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>Elegancia que Seduce</h1>
          <p className={styles.heroSubtitle}>Descubre ropa recomendada solo para ti</p>
          <div className={styles.heroButton}>
            <Link href="/products">
              <Button label="Comprar Ahora" size="large" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        {user && recommendations.length > 0 && (
          <div className={styles.section}>
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

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Productos Destacados</h2>
          <div className={styles.productGrid}>
            {featuredProducts.map((product) => (
              <div key={product.id}>
                {productTemplate(product)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}