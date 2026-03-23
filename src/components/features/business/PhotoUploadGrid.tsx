import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CLOUDINARY_CONFIG } from "@/lib/constants";

interface PhotoUploadGridProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoUploadGrid = ({ photos, onPhotosChange, maxPhotos = 10 }: PhotoUploadGridProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'marketplace/businesses');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (photos.length >= maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const remainingSlots = maxPhotos - photos.length;
    const filesToUpload = acceptedFiles.slice(0, remainingSlots);

    setUploading(true);
    const newPhotos = [...photos];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        setUploadingIndex(i);
        const url = await uploadToCloudinary(filesToUpload[i]);
        newPhotos.push(url);
      }
      
      onPhotosChange(newPhotos);
      toast.success(`${filesToUpload.length} photo(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
      setUploadingIndex(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxPhotos - photos.length,
    disabled: uploading || photos.length >= maxPhotos,
  });

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const setPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    const newPhotos = [...photos];
    const [photo] = newPhotos.splice(index, 1);
    newPhotos.unshift(photo);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Business Photos ({photos.length}/{maxPhotos})</Label>
        {photos.length > 0 && (
          <p className="text-xs text-muted-foreground">
            First image is your primary thumbnail
          </p>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group"
          >
            <img
              src={photo}
              alt={`Business photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {index !== 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setPrimaryPhoto(index)}
                  className="h-8 text-xs"
                >
                  Set Primary
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={() => removePhoto(index)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Primary badge */}
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium">
                Primary
              </div>
            )}
          </div>
        ))}

        {/* Upload box */}
        {photos.length < maxPhotos && (
          <div
            {...getRootProps()}
            className={`aspect-square rounded-lg border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 bg-muted/50'
            } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Uploading...</p>
              </>
            ) : isDragActive ? (
              <>
                <Upload className="h-8 w-8 text-primary" />
                <p className="text-xs text-primary font-medium">Drop here</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-xs text-center px-2 text-muted-foreground">
                  Click or drag
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Upload tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Upload high-quality photos of your storefront, products, and interior</p>
        <p>• First photo will be your primary thumbnail in search results</p>
        <p>• Supported formats: JPEG, PNG, WebP (max 10MB per image)</p>
      </div>
    </div>
  );
};

export default PhotoUploadGrid;
