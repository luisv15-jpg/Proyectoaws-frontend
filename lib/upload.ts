import api from './api';

type UploadFolder = 'products' | 'avatars';

interface PresignResponse {
  url: string;
  fields: Record<string, string>;
  publicUrl: string;
}

/**
 * Sube una imagen a S3 sin credenciales de AWS en el navegador:
 * 1. El backend valida la petición y devuelve una URL firmada (POST /uploads/presign).
 * 2. El navegador envía el archivo directo a S3 con esa firma.
 * Devuelve la URL pública de la imagen.
 */
export async function uploadToS3(file: File, folder: UploadFolder = 'products'): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Solo se permiten imágenes');
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error('La imagen no puede superar los 2MB');
  }

  const { data } = await api.post<PresignResponse>('/uploads/presign', {
    fileName: file.name,
    contentType: file.type,
    folder,
  });

  const form = new FormData();
  Object.entries(data.fields).forEach(([key, value]) => form.append(key, value));
  form.append('file', file); // S3 exige que el archivo vaya al final

  const response = await fetch(data.url, { method: 'POST', body: form });
  if (!response.ok) {
    throw new Error('No se pudo subir la imagen a S3');
  }

  return data.publicUrl;
}
