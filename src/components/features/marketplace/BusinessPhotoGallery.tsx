import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface BusinessPhotoGalleryProps {
  photos: {
    primary: string;
    gallery: string[];
  };
  businessName: string;
}

const BusinessPhotoGallery = ({ photos, businessName }: BusinessPhotoGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const allPhotos = [photos.primary, ...photos.gallery];

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  };

  const nextPhoto = () => {
    setSelectedIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const prevPhoto = () => {
    setSelectedIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Photo */}
      <motion.div
        className="relative w-full h-[400px] rounded-lg overflow-hidden bg-muted cursor-pointer group"
        onClick={() => openLightbox(0)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <img
          src={photos.primary || "/placeholder.svg"}
          alt={`${businessName} - Main`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
            Click to view full size
          </span>
        </div>
      </motion.div>

      {/* Gallery Grid */}
      {photos.gallery.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photos.gallery.slice(0, 3).map((photo, index) => (
            <motion.div
              key={index}
              className="relative h-24 rounded-md overflow-hidden bg-muted cursor-pointer group"
              onClick={() => openLightbox(index + 1)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={photo || "/placeholder.svg"}
                alt={`${businessName} - ${index + 2}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </motion.div>
          ))}
          
          {/* +More overlay */}
          {photos.gallery.length > 3 && (
            <motion.div
              className="relative h-24 rounded-md overflow-hidden bg-muted cursor-pointer group"
              onClick={() => openLightbox(4)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={photos.gallery[3] || "/placeholder.svg"}
                alt={`${businessName} - More`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  +{photos.gallery.length - 3} More
                </span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black border-none">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Previous Button */}
            {allPhotos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-10 text-white hover:bg-white/20"
                onClick={prevPhoto}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedIndex}
                src={allPhotos[selectedIndex]}
                alt={`${businessName} - Photo ${selectedIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>

            {/* Next Button */}
            {allPhotos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-10 text-white hover:bg-white/20"
                onClick={nextPhoto}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* Photo Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-white text-sm">
              {selectedIndex + 1} / {allPhotos.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessPhotoGallery;
