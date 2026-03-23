import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateMarketplaceProfile } from "@/services/marketplace";
import { toast } from "sonner";
import PhotoUploadGrid from "./PhotoUploadGrid";

const profileSchema = z.object({
  tagline: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  products: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  website: z.string().url().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface MarketplaceProfileEditorProps {
  businessId: string;
  currentProfile?: any;
  onUpdate?: () => void;
}

const MarketplaceProfileEditor = ({ 
  businessId, 
  currentProfile,
  onUpdate 
}: MarketplaceProfileEditorProps) => {
  const [saving, setSaving] = useState(false);
  const [newProduct, setNewProduct] = useState("");
  const [newService, setNewService] = useState("");
  const [products, setProducts] = useState<string[]>(currentProfile?.products || []);
  const [services, setServices] = useState<string[]>(currentProfile?.services || []);
  const [photos, setPhotos] = useState<string[]>(
    currentProfile?.photos?.gallery || []
  );

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      tagline: currentProfile?.tagline || "",
      description: currentProfile?.description || "",
      website: currentProfile?.contact?.website || "",
      whatsapp: currentProfile?.contact?.whatsapp || "",
      instagram: currentProfile?.contact?.instagram || "",
    }
  });

  const addProduct = () => {
    if (newProduct.trim() && !products.includes(newProduct.trim())) {
      setProducts([...products, newProduct.trim()]);
      setNewProduct("");
    }
  };

  const removeProduct = (product: string) => {
    setProducts(products.filter(p => p !== product));
  };

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setServices(services.filter(s => s !== service));
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (photos.length === 0) {
      toast.error("Please upload at least one photo of your business");
      return;
    }

    console.log('Submitting marketplace profile:', {
      businessId,
      data,
      photos: photos.length
    });

    setSaving(true);
    try {
      await updateMarketplaceProfile(businessId, {
        tagline: data.tagline,
        description: data.description,
        products,
        services,
        photos: {
          primary: photos[0],
          gallery: photos,
        },
        contact: {
          phone: currentProfile?.contact?.phone || "",
          email: currentProfile?.contact?.email || "",
          website: data.website || "",
          whatsapp: data.whatsapp,
          instagram: data.instagram,
        }
      });
      
      toast.success("Profile updated successfully!");
      onUpdate?.();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error("Failed to update profile", {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Edit Marketplace Profile</CardTitle>
        <CardDescription>
          Update your business information to attract more customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline (100 characters max)</Label>
            <Input
              id="tagline"
              placeholder="e.g., 'Your trusted Apple products specialist'"
              {...register("tagline")}
            />
            {errors.tagline && (
              <p className="text-sm text-danger">{errors.tagline.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (500 characters max)</Label>
            <Textarea
              id="description"
              placeholder="Tell customers about your business, what makes you unique, and what you offer..."
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-danger">{errors.description.message}</p>
            )}
          </div>

          <Separator />

          {/* Products */}
          <div className="space-y-3">
            <Label>Products</Label>
            <div className="flex gap-2">
              <Input
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                placeholder="e.g., iPhone, MacBook, iPad"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
              />
              <Button type="button" variant="outline" onClick={addProduct}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {products.map((product) => (
                <Badge key={product} variant="secondary" className="gap-1">
                  {product}
                  <button type="button" onClick={() => removeProduct(product)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <Label>Services</Label>
            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="e.g., Repair, Trade-in, Warranty"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              />
              <Button type="button" variant="outline" onClick={addService}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <Badge key={service} variant="outline" className="gap-1">
                  {service}
                  <button type="button" onClick={() => removeService(service)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Photos */}
          <PhotoUploadGrid
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={10}
          />

          <Separator />

          {/* Contact Methods */}
          <div className="space-y-4">
            <Label>Contact Methods</Label>
            
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm text-muted-foreground">
                Website URL *
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.yourbusiness.com"
                {...register("website")}
              />
              {errors.website && (
                <p className="text-sm text-danger">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm text-muted-foreground">
                WhatsApp Number (optional)
              </Label>
              <Input
                id="whatsapp"
                placeholder="+2348012345678"
                {...register("whatsapp")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-sm text-muted-foreground">
                Instagram Handle (optional)
              </Label>
              <Input
                id="instagram"
                placeholder="@yourbusiness"
                {...register("instagram")}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MarketplaceProfileEditor;
