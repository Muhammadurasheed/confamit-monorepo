import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X, CheckCircle2, AlertCircle } from "lucide-react";
import { CLOUDINARY_CONFIG, UPLOAD_LIMITS } from "@/lib/constants";

interface DocumentUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
}

const DocumentUpload = ({
  value,
  onChange,
  accept = "image/*,application/pdf",
  label = "Upload Document",
}: DocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", "business-documents");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/raw/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file size
      if (file.size > UPLOAD_LIMITS.maxFileSize) {
        setError("File size exceeds 10MB limit");
        toast.error("File too large", {
          description: "Maximum file size is 10MB",
        });
        return;
      }

      setUploading(true);
      setError(null);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      try {
        const url = await uploadToCloudinary(file);
        setProgress(100);
        onChange(url);
        toast.success("Document uploaded successfully");
      } catch (error: any) {
        setError(error.message || "Upload failed");
        toast.error("Upload failed", {
          description: "Please try again",
        });
      } finally {
        clearInterval(progressInterval);
        setUploading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(",").reduce((acc, type) => ({ ...acc, [type.trim()]: [] }), {}),
    maxFiles: 1,
    disabled: uploading,
  });

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  const getFileIcon = () => {
    if (value?.endsWith(".pdf")) {
      return <File className="h-8 w-8 text-danger" />;
    }
    return <File className="h-8 w-8 text-primary" />;
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {!value ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card
              {...getRootProps()}
              className={`cursor-pointer transition-all hover:border-primary ${
                isDragActive ? "border-primary bg-primary/5" : ""
              } ${error ? "border-danger" : ""}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div
                  className={`rounded-full p-4 mb-4 ${
                    isDragActive ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  <Upload
                    className={`h-8 w-8 ${
                      isDragActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <p className="text-sm font-medium mb-1">
                  {isDragActive ? "Drop the file here" : label}
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse (max 10MB)
                </p>
              </div>
            </Card>

            {uploading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Uploading... {progress}%
                </p>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs text-danger"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-success bg-success/5">
              <div className="flex items-center gap-3 p-4">
                {getFileIcon()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Document uploaded</p>
                  <p className="text-xs text-muted-foreground">Ready for submission</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentUpload;
