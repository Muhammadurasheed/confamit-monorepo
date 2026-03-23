import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Award, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Business = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container className="py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Business Directory</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover verified businesses with proven track records. 
              Build trust with your customers through official verification.
            </p>
          </div>

          {/* CTA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="shadow-elegant">
              <CardHeader>
                <Building2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Register Your Business</CardTitle>
                <CardDescription className="text-base">
                  Get verified and earn customer trust. Choose from Basic (Free), 
                  Verified (₦25,000/yr), or Premium (₦75,000/yr) tiers.
                </CardDescription>
                <div className="pt-4">
                  <Button size="lg" asChild>
                    <Link to="/business/register">Register Now</Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <Award className="h-12 w-12 text-success mb-4" />
                <CardTitle>Explore Verified Businesses</CardTitle>
                <CardDescription className="text-base">
                  Browse thousands of verified businesses with trust scores, 
                  reviews, and blockchain-verified credentials.
                </CardDescription>
                <div className="pt-4">
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/business/directory">Browse Directory</Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Award className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Trust Badge</CardTitle>
                <CardDescription>
                  Display your verification status with a trusted badge
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-success mb-2" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Track profile views, verifications, and customer trust
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Building2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                  Integrate verification into your business operations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Business;
