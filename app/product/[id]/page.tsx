'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';
import { Product } from '@/types';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Galleria } from 'primereact/galleria';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import toast from 'react-hot-toast';
import styles from './page.module.css';
import Footer from '@/components/layout/Footer';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTalla, setSelectedTalla] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      if (response.data.tallas?.length) setSelectedTalla(response.data.tallas[0]);
      if (response.data.colores?.length) setSelectedColor(response.data.colores[0]);

      // Cargar productos relacionados
      try {
        const relatedRes = await api.get(`/products?categoria=${response.data.categoria}&limit=4`);
        setRelatedProducts(relatedRes.data.products?.filter((p: Product) => p.id !== id) || []);
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Producto no encontrado');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Inicia sesión para agregar al carrito');
      router.push('/login');
      return;
    }
    if (!selectedTalla) {
      toast.error('Selecciona una talla');
      return;
    }
    if (!selectedColor) {
      toast.error('Selecciona un color');
      return;
    }

    try {
      await addToCart(product!.id, selectedTalla, selectedColor, cantidad);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al agregar');
    }
  };

  const getProductPrice = () => {
    if (!product) return { price: 0, originalPrice: null, hasOffer: false };
    const precioOferta = product.precio_oferta ? parseFloat(product.precio_oferta as any) : null;
    const precioOriginal = parseFloat(product.precio as any);

    if (precioOferta && !isNaN(precioOferta)) {
      return {
        price: precioOferta,
        originalPrice: precioOriginal,
        hasOffer: true
      };
    }
    return {
      price: precioOriginal,
      originalPrice: null,
      hasOffer: false
    };
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingGrid}>
            <Skeleton width="100%" height="400px" className={styles.skeletonImage} />
            <div className={styles.skeletonInfo}>
              <Skeleton width="80%" height="32px" className="mb-4" />
              <Skeleton width="40%" height="24px" className="mb-4" />
              <Skeleton width="100%" height="100px" className="mb-4" />
              <Skeleton width="60%" height="40px" className="mb-4" />
              <Skeleton width="100%" height="50px" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) return null;

  const { price, originalPrice, hasOffer } = getProductPrice();
  const images = product.imagenes?.map(img => ({ itemImageSrc: img, thumbnailImageSrc: img })) || [];
  if (product.imagen_principal) {
    images.unshift({ itemImageSrc: product.imagen_principal, thumbnailImageSrc: product.imagen_principal });
  }

  const itemTemplate = (item: any) => {
    return <img src={item.itemImageSrc} alt={product.nombre} className={styles.galleriaImage} />;
  };

  const thumbnailTemplate = (item: any) => {
    return <img src={item.thumbnailImageSrc} alt={product.nombre} className={styles.galleriaThumbnail} />;
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.productGrid}>
          {/* Galería de imágenes */}
          <div className={styles.gallerySection}>
            {images.length > 0 ? (
              <Galleria
                value={images}
                item={itemTemplate}
                thumbnail={thumbnailTemplate}
                className={styles.galleria}
                showThumbnails={false}
                showIndicators={false}
                showItemNavigators
                showItemNavigatorsOnHover
                circular
              />
            ) : (
              <div className={styles.noImage}>
                <i className="pi pi-image"></i>
                <p>Sin imagen</p>
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className={styles.infoSection}>
            <div className={styles.breadcrumb}>
              <Link href="/">Inicio</Link>
              <span>/</span>
              <Link href="/products">Productos</Link>
              <span>/</span>
              <span className={styles.breadcrumbCurrent}>{product.nombre}</span>
            </div>

            <h1 className={styles.productTitle}>{product.nombre}</h1>

            <div className={styles.priceSection}>
              {hasOffer ? (
                <>
                  <span className={styles.originalPrice}>S/ {originalPrice?.toFixed(2)}</span>
                  <span className={styles.offerPrice}>S/ {price.toFixed(2)}</span>
                  <Tag value="Oferta" severity="success" className={styles.offerTag} />
                </>
              ) : (
                <span className={styles.normalPrice}>S/ {price.toFixed(2)}</span>
              )}
            </div>

            <div className={styles.stockSection}>
              {product.stock > 0 ? (
                <Tag value={`Stock disponible: ${product.stock}`} severity="info" className={styles.stockTag} />
              ) : (
                <Tag value="Agotado" severity="danger" className={styles.stockTag} />
              )}
            </div>

            <p className={styles.description}>{product.descripcion || 'Descripción no disponible'}</p>

            <Divider />

            {/* Tallas */}
            {product.tallas && product.tallas.length > 0 && (
              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>Talla</label>
                <div className={styles.sizeOptions}>
                  {product.tallas.map(talla => (
                    <button
                      key={talla}
                      onClick={() => setSelectedTalla(talla)}
                      className={`${styles.sizeBtn} ${selectedTalla === talla ? styles.sizeBtnActive : ''}`}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colores */}
            {product.colores && product.colores.length > 0 && (
              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>Color</label>
                <div className={styles.colorOptions}>
                  {product.colores.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`${styles.colorBtn} ${selectedColor === color ? styles.colorBtnActive : ''}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad */}
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>Cantidad</label>
              <div className={styles.quantitySelector}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  disabled={cantidad <= 1}
                >
                  <i className="pi pi-minus"></i>
                </button>
                <input
                  type="number"
                  className={styles.qtyInput}
                  value={cantidad}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= product.stock) {
                      setCantidad(val);
                    }
                  }}
                  min={1}
                  max={product.stock}
                />
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setCantidad(Math.min(product.stock, cantidad + 1))}
                  disabled={cantidad >= product.stock}
                >
                  <i className="pi pi-plus"></i>
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className={styles.actions}>
              <Button
                label="Agregar al Carrito"
                icon="pi pi-shopping-cart"
                size="large"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={styles.addToCartBtn}
              />
              <Button
                label="Comprar Ahora"
                icon="pi pi-bolt"
                size="large"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={styles.buyNowBtn}
                text
              />
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Productos Relacionados</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/product/${related.id}`} className={styles.relatedCard}>
                  <img
                    src={related.imagen_principal || '/placeholder.jpg'}
                    alt={related.nombre}
                    className={styles.relatedImage}
                  />
                  <h3 className={styles.relatedName}>{related.nombre}</h3>
                  <p className={styles.relatedPrice}>S/ {parseFloat(related.precio as any).toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
}