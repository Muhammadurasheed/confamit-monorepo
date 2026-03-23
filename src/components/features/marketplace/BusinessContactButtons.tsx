import { ExternalLink, Navigation, Phone, MessageCircle, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackMarketplaceAction } from "@/services/marketplace";
import { toast } from "sonner";

interface BusinessContactButtonsProps {
  businessId: string;
  businessName: string;
  contact: {
    phone: string;
    email: string;
    website: string;
    whatsapp?: string;
    instagram?: string;
  };
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

const BusinessContactButtons = ({
  businessId,
  businessName,
  contact,
  location,
}: BusinessContactButtonsProps) => {
  const handleVisitWebsite = async () => {
    await trackMarketplaceAction(businessId, 'website_click');
    window.open(contact.website, '_blank');
    toast.success("Opening business website...");
  };

  const handleGetDirections = async () => {
    await trackMarketplaceAction(businessId, 'directions');
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
    window.open(mapsUrl, '_blank');
    toast.success("Opening Google Maps...");
  };

  const handlePhoneCall = async () => {
    await trackMarketplaceAction(businessId, 'phone_call');
    window.location.href = `tel:${contact.phone}`;
  };

  const handleWhatsApp = async () => {
    if (!contact.whatsapp) return;
    await trackMarketplaceAction(businessId, 'whatsapp');
    const whatsappUrl = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}?text=Hi, I found your business on ConfirmIT!`;
    window.open(whatsappUrl, '_blank');
    toast.success("Opening WhatsApp...");
  };

  const handleInstagram = () => {
    if (!contact.instagram) return;
    window.open(`https://instagram.com/${contact.instagram.replace('@', '')}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Primary Action: Visit Website */}
      <Button
        size="lg"
        className="w-full h-12"
        onClick={handleVisitWebsite}
      >
        <ExternalLink className="mr-2 h-5 w-5" />
        Visit Website
      </Button>

      {/* Secondary Action: Get Directions */}
      <Button
        size="lg"
        variant="outline"
        className="w-full h-12"
        onClick={handleGetDirections}
      >
        <Navigation className="mr-2 h-5 w-5" />
        Get Directions
      </Button>

      {/* Additional Contact Methods */}
      <Button
        size="lg"
        variant="outline"
        className="w-full h-12"
        onClick={handlePhoneCall}
      >
        <Phone className="mr-2 h-5 w-5" />
        Call Now
      </Button>

      {contact.whatsapp && (
        <Button
          size="lg"
          variant="outline"
          className="w-full h-12"
          onClick={handleWhatsApp}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          WhatsApp
        </Button>
      )}

      {contact.instagram && (
        <Button
          size="lg"
          variant="outline"
          className="w-full h-12"
          onClick={handleInstagram}
        >
          <Instagram className="mr-2 h-5 w-5" />
          Instagram
        </Button>
      )}
    </div>
  );
};

export default BusinessContactButtons;
