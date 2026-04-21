export interface User {
  id: string;
  nombre: string;
  email: string;
  role: 'user' | 'admin';
  dni?: string;
  telefono?: string;
  direccion?: string;
  altura_cm?: number;
  peso_kg?: number;
}

export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  subcategoria: string;
  precio: number;
  precio_oferta: number | null;
  imagen_principal: string;
  imagenes: string[];
  tallas: string[];
  colores: string[];
  stock: number;
  vendidos: number;
  activo: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario: number;
  item_total: number;
}

export interface Order {
  id: string;
  total: number;
  estado: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  metodo_pago: string;
  direccion_entrega: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}