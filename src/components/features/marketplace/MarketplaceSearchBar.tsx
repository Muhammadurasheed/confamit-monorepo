import { useState, useEffect } from "react";
import { Search, MapPin, Loader2, Edit2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCurrentLocation, forwardGeocode } from "@/services/marketplace";
import { toast } from "sonner";

interface MarketplaceSearchBarProps {
  onSearch: (query: string, location?: { lat: number; lng: number }) => void;
  defaultQuery?: string;
  loading?: boolean;
}

const MarketplaceSearchBar = ({ 
  onSearch, 
  defaultQuery = "",
  loading = false 
}: MarketplaceSearchBarProps) => {
  const [query, setQuery] = useState(defaultQuery);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("Lagos");
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState("");

  useEffect(() => {
    // Auto-detect location on mount
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setGettingLocation(true);
    try {
      console.log('Starting location detection...');
      const coords = await getCurrentLocation();
      console.log('Location detected successfully:', coords);
      setLocation(coords);
      
      // Get human-readable location name via reverse geocoding
      const { reverseGeocode } = await import('@/services/marketplace');
      const locationName = await reverseGeocode(coords.lat, coords.lng);
      console.log('Reverse geocoded location:', locationName);
      
      setLocationName(locationName);
      
      // Show appropriate toast
      if (coords.lat === 6.5244 && coords.lng === 3.3792) {
        toast.info(`Using default location: ${locationName}`);
      } else {
        toast.success(`Location detected: ${locationName}`);
      }
    } catch (error) {
      console.error("Location detection failed:", error);
      toast.error("Couldn't detect your location. Using Lagos as default.");
      setLocation({ lat: 6.5244, lng: 3.3792 }); // Lagos default
      setLocationName("Lagos");
    } finally {
      setGettingLocation(false);
    }
  };

  const handleManualLocation = async () => {
    if (!manualLocationInput.trim()) {
      setIsEditingLocation(false);
      return;
    }
    setGettingLocation(true);
    try {
      const coords = await forwardGeocode(manualLocationInput);
      if (coords) {
        setLocation(coords);
        setLocationName(manualLocationInput);
        setIsEditingLocation(false);
        toast.success(`Location set to ${manualLocationInput}`);
      } else {
        toast.error(`Could not find location: ${manualLocationInput}`);
      }
    } catch (e) {
      toast.error("Error setting custom location.");
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    onSearch(query, location || undefined);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for products, services, or businesses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 h-12 text-base"
            disabled={loading}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          size="lg"
          className="h-12 px-8"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Location Display */}
      <div className="flex items-center justify-between text-sm h-10">
        <div className="flex items-center gap-2 text-muted-foreground w-full">
          <MapPin className="h-4 w-4" />
          {isEditingLocation ? (
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Input
                autoFocus
                value={manualLocationInput}
                onChange={(e) => setManualLocationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                placeholder="E.g. Abuja, Port Harcourt..."
                className="h-8 text-sm bg-background"
                disabled={gettingLocation}
              />
              <Button size="icon" variant="secondary" className="h-8 w-8 shrink-0" onClick={handleManualLocation} disabled={gettingLocation || !manualLocationInput.trim()}>
                {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setIsEditingLocation(false)} disabled={gettingLocation}>
                <span className="sr-only">Cancel</span>
                &times;
              </Button>
            </div>
          ) : (
            <>
              <span>
                Searching near: <span className="font-medium text-foreground cursor-pointer hover:underline decoration-dotted" onClick={() => { setManualLocationInput(locationName); setIsEditingLocation(true); }}>{locationName}</span>
              </span>
              <Button size="icon" variant="ghost" className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground" onClick={() => { setManualLocationInput(locationName); setIsEditingLocation(true); }}>
                <Edit2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
        {!isEditingLocation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={detectLocation}
            disabled={gettingLocation}
            className="shrink-0"
          >
            {gettingLocation ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Detecting...
              </>
            ) : (
              "Auto-detect"
            )}
          </Button>
        )}
      </div>

      {/* Popular Searches */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Popular:</span>
        {["iPhone", "Laptop", "Fashion", "Restaurant", "Electronics"].map((term) => (
          <button
            key={term}
            onClick={() => {
              setQuery(term);
              onSearch(term, location || undefined);
            }}
            className="text-sm px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceSearchBar;
