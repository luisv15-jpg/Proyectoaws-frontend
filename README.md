# Velvet – Frontend de tienda de ropa en AWS

Tienda de ropa en línea hecha con Next.js, TypeScript y PrimeReact. Consume la API de [Proyectoaws-backend](https://github.com/luisv15-jpg/Proyectoaws-backend) y guarda las imágenes de productos y perfiles en Amazon S3.

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
| AWS | Amazon S3 para las imágenes |

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
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET_NAME=
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=
```

Las variables con prefijo `NEXT_PUBLIC_` quedan visibles en el navegador. Para las credenciales de AWS usa un usuario IAM que solo pueda subir archivos a ese bucket.

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
