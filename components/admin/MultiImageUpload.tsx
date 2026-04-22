'use client';

import { useState, useRef } from 'react';
import { uploadToS3 } from '@/lib/upload';
import toast from 'react-hot-toast';
import styles from './MultiImageUpload.module.css';

interface MultiImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  currentImages?: string[];
  label?: string;
}

export default function MultiImageUpload({ 
  onImagesUploaded, 
  currentImages = [], 
  label = 'Imágenes del producto' 
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(currentImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen`);
        continue;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} excede los 5MB`);
        continue;
      }

      try {
        const url = await uploadToS3(file);
        uploadedUrls.push(url);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Error al subir ${file.name}`);
      }
    }

    setUploading(false);

    if (uploadedUrls.length > 0) {
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesUploaded(newImages);
      toast.success(`${uploadedUrls.length} imagen(es) subida(s)`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUploaded(newImages);
    toast.success('Imagen eliminada');
  };

  const handleSetAsPrincipal = (index: number) => {
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    setImages(newImages);
    onImagesUploaded(newImages);
    toast.success('Imagen principal actualizada');
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        <i className="pi pi-images"></i>
        {label}
      </label>
      
      <div className={styles.uploadArea}>
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <i className="pi pi-cloud-upload"></i>
          {uploading ? 'Subiendo...' : 'Seleccionar imágenes'}
        </button>
        <span className={styles.hint}>JPG, PNG o GIF (máx. 5MB c/u)</span>
        <span className={styles.hint}>Puedes seleccionar múltiples imágenes</span>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </div>

      {uploading && (
        <div className={styles.uploading}>
          <i className="pi pi-spin pi-spinner"></i>
          <span>Subiendo imágenes...</span>
        </div>
      )}

      {images.length > 0 && (
        <div className={styles.imageGrid}>
          {images.map((img, index) => (
            <div key={index} className={styles.imageCard}>
              <img src={img} alt={`Imagen ${index + 1}`} className={styles.image} />
              <div className={styles.imageOverlay}>
                {index === 0 && <span className={styles.principalBadge}>Principal</span>}
                <div className={styles.imageActions}>
                  {index !== 0 && (
                    <button
                      type="button"
                      className={styles.principalBtn}
                      onClick={() => handleSetAsPrincipal(index)}
                      title="Establecer como principal"
                    >
                      <i className="pi pi-star"></i>
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => handleRemoveImage(index)}
                    title="Eliminar"
                  >
                    <i className="pi pi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}