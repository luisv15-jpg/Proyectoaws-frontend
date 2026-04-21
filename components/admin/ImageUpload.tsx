'use client';

import { useState, useRef } from 'react';
import { uploadToS3 } from '@/lib/upload';
import toast from 'react-hot-toast';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string | null;
  label?: string;
}

export default function ImageUpload({ 
  onImageUploaded, 
  currentImage, 
  label = 'Imagen del producto' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    // Vista previa local
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    setUploading(true);
    try {
      const url = await uploadToS3(file);
      setPreview(url);
      onImageUploaded(url);
      toast.success('Imagen subida exitosamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      
      <div className={styles.uploadArea}>
        {preview ? (
          <div className={styles.previewContainer}>
            <img src={preview} alt="Vista previa" className={styles.preview} />
            <div className={styles.previewActions}>
              <button
                type="button"
                className={styles.changeBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="pi pi-refresh"></i>
                Cambiar
              </button>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={handleRemoveImage}
              >
                <i className="pi pi-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div 
            className={styles.uploadBox}
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="pi pi-cloud-upload"></i>
            <p>Haz clic para seleccionar una imagen</p>
            <span>JPG, PNG o GIF (máx. 5MB)</span>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        
        {uploading && (
          <div className={styles.uploading}>
            <i className="pi pi-spin pi-spinner"></i>
            <span>Subiendo imagen...</span>
          </div>
        )}
      </div>
    </div>
  );
}