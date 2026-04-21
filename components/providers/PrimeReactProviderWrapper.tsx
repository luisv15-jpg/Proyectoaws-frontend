'use client';

import { PrimeReactProvider } from 'primereact/api';
import { useEffect, useState } from 'react';

export default function PrimeReactProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <PrimeReactProvider>{children}</PrimeReactProvider>;
}