import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import MarketplaceSearchBar from "@/components/features/marketplace/MarketplaceSearchBar";
import MarketplaceBusinessCard from "@/components/features/marketplace/MarketplaceBusinessCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { searchMarketplace } from "@/services/marketplace";
import type { MarketplaceSearchResult } from "@/types";
import { toast } from "sonner";

const MarketplaceSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<MarketplaceSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const query = searchParams.get('q') || '';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query, lat, lng]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const filters: any = { q: query };
      if (lat && lng) {
        filters.lat = parseFloat(lat);
        filters.lng = parseFloat(lng);
      }

      const response = await searchMarketplace(filters);
      setBusinesses(response.businesses);
      setTotalResults(response.totalResults);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search businesses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string, location?: { lat: number; lng: number }) => {
    const params = new URLSearchParams({ q: newQuery });
    if (location) {
      params.append('lat', location.lat.toString());
      params.append('lng', location.lng.toString());
    }
    navigate(`/marketplace/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <Container>
          {/* Search Bar */}
          <div className="mb-8">
            <MarketplaceSearchBar 
              onSearch={handleSearch} 
              defaultQuery={query}
              loading={loading}
            />
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {totalResults > 0 ? (
                  <>
                    Found <span className="text-primary">{totalResults}</span> verified {totalResults === 1 ? 'business' : 'businesses'}
                    {query && <> for "{query}"</>}
                  </>
                ) : (
                  <>No results found{query && <> for "{query}"</>}</>
                )}
              </h2>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Searching for verified businesses...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && businesses.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No verified businesses found matching your search. Try different keywords or expand your search area.
              </AlertDescription>
            </Alert>
          )}

          {/* Results Grid */}
          {!loading && businesses.length > 0 && (
            <div className="space-y-4">
              {businesses.map((business, index) => (
                <MarketplaceBusinessCard
                  key={business.businessId}
                  {...business}
                  index={index}
                />
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default MarketplaceSearch;
