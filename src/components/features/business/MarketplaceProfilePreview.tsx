import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ExternalLink, Clock, Phone, Globe } from "lucide-react";
import type { MarketplaceProfile, Business } from "@/types";

interface MarketplaceProfilePreviewProps {
  business: Business;
  onEdit: () => void;
}

const MarketplaceProfilePreview = ({ business, onEdit }: MarketplaceProfilePreviewProps) => {
  const profile = business.marketplace?.profile as MarketplaceProfile | undefined;
  
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Marketplace Profile Preview</CardTitle>
          <CardDescription>Set up your profile to see how it appears to customers</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onEdit}>Set Up Profile</Button>
        </CardContent>
      </Card>
    );
  }

  const primaryPhoto = profile.photos?.primary || business.logo;
  const location = profile.location;
  const contact = profile.contact;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Your Marketplace Profile</CardTitle>
            <CardDescription>How customers see your business</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview Card - Mimics MarketplaceBusinessCard */}
        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex gap-4 p-4">
            {/* Thumbnail */}
            {primaryPhoto && (
              <div className="flex-shrink-0">
                <img
                  src={primaryPhoto}
                  alt={business.name}
                  className="w-20 h-20 rounded-lg object-cover border"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base line-clamp-1">{business.name}</h3>
                  {profile.tagline && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {profile.tagline}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-sm font-medium">
                    {business.rating || 0}
                  </span>
                </div>
              </div>

              {/* Location */}
              {location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">
                    {location.area}, {location.city}
                  </span>
                </div>
              )}

              {/* Products/Services Pills */}
              {(profile.products?.length > 0 || profile.services?.length > 0) && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {profile.products?.slice(0, 3).map((product, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">
                      {product}
                    </Badge>
                  ))}
                  {profile.services?.slice(0, 2).map((service, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                      {service}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {contact?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact?.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span className="line-clamp-1">Website</span>
                  </div>
                )}
                {profile.hours && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Mon-Sat: {profile.hours.monday?.open || '9:00'} - {profile.hours.monday?.close || '18:00'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* View Full Profile Button */}
          <div className="border-t bg-muted/30 px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-xs"
              onClick={() => window.open(`/marketplace/business/${business.businessId}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Full Profile
            </Button>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completeness</span>
            <span className="text-sm font-bold text-primary">
              {calculateCompleteness(profile)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${calculateCompleteness(profile)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Complete your profile to improve visibility
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

function calculateCompleteness(profile: MarketplaceProfile): number {
  let score = 0;
  const total = 10;

  if (profile.tagline) score += 1;
  if (profile.description) score += 1;
  if (profile.location?.area && profile.location?.city) score += 1;
  if (profile.contact?.phone) score += 1;
  if (profile.contact?.email) score += 1;
  if (profile.contact?.website) score += 1;
  if (profile.products && profile.products.length > 0) score += 1;
  if (profile.services && profile.services.length > 0) score += 1;
  if (profile.photos?.primary) score += 1;
  if (profile.hours) score += 1;

  return Math.round((score / total) * 100);
}

export default MarketplaceProfilePreview;
