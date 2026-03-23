import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LogoUploadProps {
  onLogoUploaded: (url: string) => void;
  currentLogo?: string;
}

export const LogoUpload = ({ onLogoUploaded, currentLogo }: LogoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogo || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setLogoUrl(data.secure_url);
      onLogoUploaded(data.secure_url);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setLogoUrl(null);
    onLogoUploaded("");
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Business Logo</label>

      {logoUrl ? (
        <div className="relative inline-block">
          <img
            src={logoUrl}
            alt="Business logo"
            className="w-32 h-32 object-cover rounded-lg border-2 border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="logo-upload"
            disabled={uploading}
          />
          <label
            htmlFor="logo-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            {uploading ? (
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="text-sm text-muted-foreground">
              {uploading ? (
                "Uploading logo..."
              ) : (
                <>
                  <span className="text-primary font-medium">Click to upload</span> or
                  drag and drop
                  <br />
                  PNG, JPG, SVG (max. 2MB)
                </>
              )}
            </div>
          </label>
        </div>
      )}
    </div>
  );
};
