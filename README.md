# Velvet – Frontend de tienda de ropa en AWS

Tienda de ropa en línea hecha con Next.js, TypeScript y PrimeReact. Consume la API de [Proyectoaws-backend](https://github.com/luisv15-jpg/Proyectoaws-backend) y sube las imágenes de productos y perfiles a Amazon S3 con URLs firmadas por el backend.

## Funcionalidades

**Para clientes**
- Catálogo con filtros y página de detalle de cada producto.
- Carrito y checkout.
- Registro, inicio de sesión, recuperación de contraseña y perfil con foto.

**Panel de administración**
- Dashboard con gráficos de ventas, productos más vendidos y estado de los pedidos (Chart.js).
- Gestión de productos con subida de imágenes a S3.
- Gestión de pedidos y usuarios.
- Papelera para restaurar productos y usuarios eliminados.

## Stack

| Parte | Herramientas |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | PrimeReact, Tailwind CSS 4, CSS Modules, Lucide |
| Formularios | React Hook Form y Zod |
| Datos | Axios, Context API para sesión y carrito |
| AWS | Amazon S3 para las imágenes (subida con URL firmada) |

## Instalación

```bash
git clone https://github.com/luisv15-jpg/Proyectoaws-frontend.git
cd Proyectoaws-frontend
pnpm install
pnpm dev
```

Abre `http://localhost:3000`. El backend debe estar corriendo.

## Variables de entorno

Crea un archivo `.env.local` con:

```
NEXT_PUBLIC_API_URL=http://localhost:3002
```

El frontend no guarda credenciales de AWS. Para subir una imagen pide al backend una URL firmada (`POST /uploads/presign`) y envía el archivo directo a S3.

## Estructura

```
app/          páginas: tienda, carrito, checkout, cuenta y /admin
components/   navbar, footer y subida de imágenes
contexts/     sesión (AuthContext) y carrito (CartContext)
lib/          cliente de la API y subida a S3
types/        tipos compartidos
```

## Autor

Luis Abel Vasquez Medina
