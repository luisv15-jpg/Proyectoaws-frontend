'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Product } from '@/types';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Skeleton } from 'primereact/skeleton';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import styles from './page.module.css';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('categoria', category);
      params.append('limit', '50');
      
      const response = await api.get(`/products?${params.toString()}`);
      if (response.data.products && response.data.products.length > 0) {
        setProducts(response.data.products);
      } 

    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['camisas', 'poleras', 'pantalones', 'vestidos']);
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

  const categoryOptions = [
    { label: 'Todas las categorías', value: '' },
    ...categories.map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.header}>
            <Skeleton width="300px" height="40px" className="mb-4" />
            <div className={styles.filters}>
              <Skeleton width="100%" height="40px" className="flex-1" />
              <Skeleton width="200px" height="40px" />
            </div>
          </div>
          <div className={styles.productGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className={styles.skeletonCard}>
                <Skeleton width="100%" height="200px" className="mb-2" />
                <Skeleton width="80%" height="20px" className="mb-2" />
                <Skeleton width="50%" height="20px" className="mb-2" />
                <Skeleton width="100%" height="40px" />
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
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuestros Productos</h1>
          <p className={styles.subtitle}>Descubre la colección que hará brillar tu estilo</p>
        </div>
        
        {/* Filtros */}
        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <i className="pi pi-search"></i>
            <InputText
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.categoryWrapper}>
            <Dropdown
              value={category}
              options={categoryOptions}
              onChange={(e) => setCategory(e.value)}
              placeholder="Todas las categorías"
              className={styles.categorySelect}
              showClear
            />
          </div>
        </div>

        {/* Resultados */}
        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="pi pi-inbox"></i>
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {products.map((product) => {
              const { price, originalPrice, hasOffer } = getProductPrice(product);
              return (
                <Card
                  key={product.id}
                  className={styles.productCard}
                  header={
                    <div className={styles.imageWrapper}>
                      <img 
                        src={product.imagen_principal || '/placeholder.jpg'} 
                        alt={product.nombre} 
                        className={styles.productImage}
                      />
                      {hasOffer && (
                        <span className={styles.offerBadge}>Oferta</span>
                      )}
                    </div>
                  }
                  footer={
                    <div className={styles.cardFooter}>
                      <div className={styles.priceContainer}>
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
                          className={styles.detailBtn}
                        />
                      </Link>
                    </div>
                  }
                >
                  <h3 className={styles.productTitle}>{product.nombre}</h3>
                  <p className={styles.productDescription}>
                    {product.descripcion?.substring(0, 80)}...
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}