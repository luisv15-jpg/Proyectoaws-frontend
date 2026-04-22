'use client';

import { useState, useEffect, useCallback } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import api from '@/lib/api';
import { Product } from '@/types';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';
import { Skeleton } from 'primereact/skeleton';
import { Paginator } from 'primereact/paginator';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import styles from './page.module.css';
import Footer from '@/components/layout/Footer';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedTalla, setSelectedTalla] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);

  // Inicializar AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });
  }, []);

  // Re-inicializar AOS cuando los productos cambian
  useEffect(() => {
    AOS.refresh();
  }, [products]);

  const tallas = ['S', 'M', 'L', 'XL', 'XXL'];
  const colores = ['Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Beige', 'Gris'];

  const sortOptions = [
    { label: 'Más recientes', value: 'createdAt_DESC' },
    { label: 'Más antiguos', value: 'createdAt_ASC' },
    { label: 'Precio: menor a mayor', value: 'precio_ASC' },
    { label: 'Precio: mayor a menor', value: 'precio_DESC' },
    { label: 'Más vendidos', value: 'vendidos_DESC' },
    { label: 'Nombre: A-Z', value: 'nombre_ASC' },
    { label: 'Nombre: Z-A', value: 'nombre_DESC' },
  ];

  // Debounce para search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchDebounced, category, priceRange, selectedTalla, selectedColor, sortBy, sortOrder, first, rows]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchDebounced) params.append('search', searchDebounced);
      if (category) params.append('categoria', category);
      if (selectedTalla) params.append('talla', selectedTalla);
      if (selectedColor) params.append('color', selectedColor);
      if (priceRange[0] > 0) params.append('precioMin', priceRange[0].toString());
      if (priceRange[1] < 500) params.append('precioMax', priceRange[1].toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', (first / rows + 1).toString());
      params.append('limit', rows.toString());
      
      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products || []);
      setTotalProducts(response.data.total || 0);
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
      setCategories(['camisas', 'poleras', 'pantalones', 'vestidos', 'zapatos', 'accesorios']);
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

  const handleSortChange = (e: any) => {
    const [newSortBy, newSortOrder] = e.value.split('_');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setFirst(0);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchDebounced('');
    setCategory('');
    setPriceRange([0, 500]);
    setSelectedTalla('');
    setSelectedColor('');
    setSortBy('createdAt');
    setSortOrder('DESC');
    setFirst(0);
  };

  const categoryOptions = [
    { label: 'Todas las categorías', value: '' },
    ...categories.map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))
  ];

  const tallaOptions = [
    { label: 'Todas', value: '' },
    ...tallas.map(t => ({ label: t, value: t }))
  ];

  const colorOptions = [
    { label: 'Todos', value: '' },
    ...colores.map(c => ({ label: c, value: c }))
  ];

  if (loading && products.length === 0) {
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
        <div className={styles.header} data-aos="fade-up">
          <h1 className={styles.title}>Nuestros Productos</h1>
          <p className={styles.subtitle}>Descubre la colección que hará brillar tu estilo</p>
        </div>
        
        {/* Filtros */}
        <div className={styles.filtersSection} data-aos="fade-up" data-aos-delay="100">
          <div className={styles.filtersRow}>
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
                placeholder="Categoría"
                className={styles.filterSelect}
              />
            </div>
            <div className={styles.tallaWrapper}>
              <Dropdown
                value={selectedTalla}
                options={tallaOptions}
                onChange={(e) => setSelectedTalla(e.value)}
                placeholder="Talla"
                className={styles.filterSelect}
              />
            </div>
            <div className={styles.colorWrapper}>
              <Dropdown
                value={selectedColor}
                options={colorOptions}
                onChange={(e) => setSelectedColor(e.value)}
                placeholder="Color"
                className={styles.filterSelect}
              />
            </div>
          </div>

          <div className={styles.filtersRow}>
            <div className={styles.priceFilter}>
              <div className={styles.priceInputs}>
                <label className={styles.priceLabel}>Rango de precio</label>
                <div className={styles.priceInputWrapper}>
                  <span>S/</span>
                  <input
                    type="number"
                    placeholder="Mín"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className={styles.priceInput}
                  />
                </div>
                <span className={styles.priceSeparator}>-</span>
                <div className={styles.priceInputWrapper}>
                  <span>S/</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])}
                    className={styles.priceInput}
                  />
                </div>
              </div>
            </div>
            <div className={styles.sortWrapper}>
              <Dropdown
                value={`${sortBy}_${sortOrder}`}
                options={sortOptions}
                onChange={handleSortChange}
                placeholder="Ordenar por"
                className={styles.sortSelect}
              />
            </div>
            <button className={styles.clearFiltersBtn} onClick={handleClearFilters}>
              <i className="pi pi-filter-slash"></i>
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Resultados */}
        {products.length === 0 && !loading ? (
          <div className={styles.emptyState} data-aos="fade-up">
            <i className="pi pi-inbox"></i>
            <p>No se encontraron productos</p>
            <button className={styles.resetBtn} onClick={handleClearFilters}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className={styles.resultsInfo} data-aos="fade-up" data-aos-delay="200">
              <span>Mostrando {products.length} de {totalProducts} productos</span>
              {loading && <span className={styles.loadingSpinner}> Actualizando...</span>}
            </div>
            <div className={styles.productGrid}>
              {products.map((product, index) => {
                const { price, originalPrice, hasOffer } = getProductPrice(product);
                return (
                  <div 
                    key={product.id} 
                    data-aos="fade-up" 
                    data-aos-delay={Math.min(index * 50, 300)}
                    className={styles.productCardWrapper}
                  >
                    <Card
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
                          {product.stock < 5 && product.stock > 0 && (
                            <span className={styles.stockBadge}>¡Últimas unidades!</span>
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
                        {product.descripcion?.substring(0, 60)}...
                      </p>
                      <div className={styles.productMeta}>
                        {product.tallas && product.tallas.length > 0 && (
                          <span className={styles.metaTag}>
                            <i className="pi pi-tag"></i> {product.tallas.join(', ')}
                          </span>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
            <div data-aos="fade-up" data-aos-delay="300">
              <Paginator
                first={first}
                rows={rows}
                totalRecords={totalProducts}
                onPageChange={(e) => {
                  setFirst(e.first);
                  setRows(e.rows);
                }}
                className={styles.paginator}
              />
            </div>
          </>
        )}
      </div>
      <Footer/>
    </>
  );
}