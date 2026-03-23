import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Confirmit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered trust verification for African commerce. Protecting millions from fraud.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/quick-scan" className="transition-smooth hover:text-foreground">
                  QuickScan
                </Link>
              </li>
              <li>
                <Link to="/account-check" className="transition-smooth hover:text-foreground">
                  Account Check
                </Link>
              </li>
              <li>
                <Link to="/report-fraud" className="transition-smooth hover:text-foreground">
                  Report Fraud
                </Link>
              </li>
              <li>
                <Link to="/business" className="transition-smooth hover:text-foreground">
                  Business Directory
                </Link>
              </li>
              <li>
                <Link to="/api" className="transition-smooth hover:text-foreground">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="transition-smooth hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-smooth hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blog" className="transition-smooth hover:text-foreground">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="transition-smooth hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition-smooth hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/security" className="transition-smooth hover:text-foreground">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} ConfirmIT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
