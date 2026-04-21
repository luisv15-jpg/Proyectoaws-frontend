import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Velvet | Elegancia que Seduce",
  description: "Descubre moda elegante y sensual para cada ocasión",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <PrimeReactProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster position="top-right" />
            </CartProvider>
          </AuthProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}