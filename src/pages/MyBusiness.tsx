import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS } from "@/lib/constants";
import { Building2, Plus } from "lucide-react";

const MyBusiness = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBusinesses = async () => {
      if (authLoading) return;

      if (!user) {
        toast.error("Please sign in to access your business dashboard");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_ENDPOINTS.BASE}/business/my-businesses?userId=${user.uid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch businesses");
        }

        const data = await response.json();
        setBusinesses(data.data || []);

        // If user has exactly one business, redirect directly to its dashboard
        if (data.data && data.data.length === 1) {
          navigate(`/business/dashboard/${data.data[0].id}`);
        }
      } catch (error: any) {
        console.error("Error fetching businesses:", error);
        toast.error("Failed to load your businesses", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyBusinesses();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Building2 className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">No Business Registered</CardTitle>
              <CardDescription className="text-base mt-2">
                You haven't registered any business yet. Register your business to get verified and build trust with your customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <a href="/business/register">
                  <Plus className="h-4 w-4 mr-2" />
                  Register Your Business
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/business/directory">Browse Business Directory</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // If user has multiple businesses, show selection screen
  return (
    <div className="flex min-h-screen flex-col bg-gradient-subtle">
      <Header />
      <main className="flex-1 py-12">
        <Container>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Businesses</h1>
            <p className="text-muted-foreground">Select a business to manage</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Card
                key={business.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                onClick={() => navigate(`/business/dashboard/${business.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {business.name[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{business.category}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status: <span className="capitalize font-medium">{business.verification?.status || 'pending'}</span>
                    </span>
                    <Button variant="ghost" size="sm">
                      Manage →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed cursor-pointer hover:border-primary/50 transition-all flex items-center justify-center min-h-[200px]" onClick={() => navigate("/business/register")}>
              <CardContent className="text-center py-8">
                <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-lg mb-2">Register New Business</CardTitle>
                <p className="text-sm text-muted-foreground">Add another business to your account</p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default MyBusiness;
