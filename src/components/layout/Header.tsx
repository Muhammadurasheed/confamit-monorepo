import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/logo.svg";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CreditBalance } from "@/components/shared/CreditBalance";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40">
      <div className="container flex h-[4.5rem] items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="relative flex items-center justify-center h-10 w-10 bg-primary/10 rounded-xl border border-primary/20">
            <img src={logo} alt="ConfirmIT" className="h-6 w-6" />
          </div>
          <span className="text-[1.35rem] font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent hidden sm:inline-block">
            ConfirmIT
          </span>
        </Link>

        {/* Desktop Navigation (Apple-style Hover) */}
        <nav className="hidden md:flex items-center justify-center flex-1 ml-8">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10 px-4 bg-transparent font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 data-[state=open]:bg-accent/50 rounded-full transition-all">
                  Products
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-2 p-4 md:w-[400px] md:grid-cols-2 lg:w-[450px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-b from-primary/10 to-primary/5 p-6 no-underline outline-none focus:shadow-md"
                          to="/quick-scan"
                        >
                          <Sparkles className="h-6 w-6 text-primary mb-3" />
                          <div className="mb-2 text-lg font-medium text-foreground">
                            QuickScan
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Instantly analyze receipts & detect fake transfers with our AI computer vision.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/create-escrow" className="block select-none space-y-1 rounded-xl p-3 leading-none no-underline hover:bg-primary hover:text-white focus:bg-primary transition-colors group">
                          <div className="text-sm font-medium leading-none text-primary group-hover:text-white flex items-center gap-1.5 transition-colors">
                            <Sparkles className="h-3.5 w-3.5" /> Hedera Escrow Vault
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1.5 font-medium group-hover:text-white/80 transition-colors">Generate trustless payment links secured on-chain.</p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/account-check" className="block select-none space-y-1 rounded-xl p-3 leading-none no-underline hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors">
                          <div className="text-sm font-medium leading-none">Account Check</div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1.5">Verify vendor risk profiles</p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/report-fraud" className="block select-none space-y-1 rounded-xl p-3 leading-none no-underline hover:bg-destructive hover:text-white focus:bg-destructive transition-colors group">
                          <div className="text-sm font-medium leading-none text-destructive group-hover:text-white transition-colors">Report Fraud</div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1.5 group-hover:text-white/80 transition-colors">Protect the community network</p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10 px-4 bg-transparent font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 data-[state=open]:bg-accent/50 rounded-full transition-all">
                  Ecosystem
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[250px] gap-2 p-4">
                    <li><NavigationMenuLink asChild><Link to="/marketplace" className="block select-none space-y-1 rounded-xl p-3 leading-none no-underline transition-colors hover:bg-accent hover:text-accent-foreground"><div className="text-sm font-medium">Verified Marketplace</div></Link></NavigationMenuLink></li>
                    <li><NavigationMenuLink asChild><Link to="/business" className="block select-none space-y-1 rounded-xl p-3 leading-none no-underline transition-colors hover:bg-accent hover:text-accent-foreground"><div className="text-sm font-medium">Business Trust Registry</div></Link></NavigationMenuLink></li>
                    <li><NavigationMenuLink asChild><Link to="/activity-history" className="block select-none space-y-1 rounded-xl p-3 leading-none no-underline transition-colors hover:bg-accent hover:text-accent-foreground"><div className="text-sm font-medium">Activity History</div></Link></NavigationMenuLink></li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10 px-4 bg-transparent font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 data-[state=open]:bg-accent/50 rounded-full transition-all">
                  Blockchain
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[280px] gap-2 p-4">
                    <li><NavigationMenuLink asChild><Link to="/verify" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline transition-colors hover:bg-accent hover:text-accent-foreground"><div className="text-sm font-medium text-purple-600 dark:text-purple-400">Cross-Chain Verify</div><p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1.5">Cryptographic proofs</p></Link></NavigationMenuLink></li>
                    <li><NavigationMenuLink asChild><Link to="/impact" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline transition-colors hover:bg-accent hover:text-accent-foreground"><div className="text-sm font-medium">Network Impact</div></Link></NavigationMenuLink></li>
                    <li><NavigationMenuLink asChild><Link to="/api" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline transition-colors hover:bg-accent hover:text-accent-foreground"><div className="text-sm font-medium">API & SDKs</div></Link></NavigationMenuLink></li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user && <CreditBalance />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-offset-background transition-colors hover:ring-2 hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user.email?.[0].toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/40 shadow-xl shadow-foreground/5 p-2" sideOffset={8}>
                <div className="flex flex-col space-y-1 p-3 bg-muted/30 rounded-lg mb-2">
                  <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate w-full mt-1">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="mx-1 my-1" />
                <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg focus:bg-accent transition-colors">
                  <Link to="/my-business">
                    <User className="mr-2 h-4 w-4" />
                    My Protocol Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer p-3 rounded-lg focus:bg-destructive/10 text-destructive focus:text-destructive transition-colors mt-1">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="font-semibold h-10 px-5 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground transition-colors">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="font-semibold h-10 px-6 rounded-full shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all shadow-primary/10">
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu (FAANG-level polished) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full active:scale-95 transition-transform">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[380px] p-0 border-l border-border/40 rounded-l-[2rem]">
            <div className="flex flex-col h-full bg-background/50 backdrop-blur-3xl">
              <div className="flex items-center justify-between p-6 pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 bg-primary/10 rounded-xl border border-primary/20">
                    <img src={logo} alt="ConfirmIT" className="h-6 w-6" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    ConfirmIT
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-6 py-6 scrollbar-hide">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Products</h4>
                    <div className="flex flex-col gap-1 bg-muted/30 p-2 rounded-2xl border border-border/50">
                      <Link to="/quick-scan" onClick={() => setMobileOpen(false)} className={`flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all ${isActive("/quick-scan") ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>QuickScan</Link>
                      <Link to="/create-escrow" onClick={() => setMobileOpen(false)} className={`flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all ${isActive("/create-escrow") ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>Hedera Escrow Vault</Link>
                      <Link to="/account-check" onClick={() => setMobileOpen(false)} className={`flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all ${isActive("/account-check") ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Account Risk Check</Link>
                      <Link to="/report-fraud" onClick={() => setMobileOpen(false)} className={`flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all ${isActive("/report-fraud") ? "bg-destructive text-white" : "text-destructive hover:bg-destructive hover:text-white"}`}>Report Fraud</Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Ecosystem</h4>
                    <div className="flex flex-col gap-1 bg-muted/30 p-2 rounded-2xl border border-border/50">
                      <Link to="/marketplace" onClick={() => setMobileOpen(false)} className={`flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all ${isActive("/marketplace") ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Verified Marketplace</Link>
                      <Link to="/business" onClick={() => setMobileOpen(false)} className={`flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all ${isActive("/business") ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Trust Registry</Link>
                      <Link to="/activity-history" onClick={() => setMobileOpen(false)} className={`flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all ${isActive("/activity-history") ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Activity History</Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-purple-500/80 uppercase tracking-widest ml-1">Blockchain</h4>
                    <div className="flex flex-col gap-1 bg-purple-500/5 p-2 rounded-2xl border border-purple-500/10">
                      <Link to="/verify" onClick={() => setMobileOpen(false)} className={`flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all ${isActive("/verify") ? "bg-background shadow-sm text-purple-600" : "text-purple-600/70 hover:text-purple-600"}`}>Cross-Chain Verify</Link>
                      <Link to="/impact" onClick={() => setMobileOpen(false)} className={`flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all ${isActive("/impact") ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Network Impact</Link>
                      <Link to="/api" onClick={() => setMobileOpen(false)} className={`flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all ${isActive("/api") ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>API & SDKs</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-background/80 backdrop-blur-xl border-t border-border/40 pb-safe">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-2xl border border-border/50">
                       <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.email?.[0].toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <p className="text-base font-bold truncate">{user.displayName || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate w-full font-medium">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Trust Credits</span>
                        <span className="text-xl font-bold">{(profile?.credits || 0).toLocaleString()} <span className="text-xs opacity-60">CTT</span></span>
                      </div>
                      <CreditBalance />
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 rounded-xl h-12 font-semibold shadow-sm" asChild onClick={() => setMobileOpen(false)}>
                        <Link to="/my-business"><User className="mr-2 h-4 w-4" /> Dashboard</Link>
                      </Button>
                      <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 text-destructive bg-destructive/5 hover:bg-destructive/15" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button className="w-full rounded-xl h-12 font-bold shadow-lg shadow-primary/20 text-md" asChild onClick={() => setMobileOpen(false)}>
                      <Link to="/register">Get Started</Link>
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl h-12 font-bold bg-muted/30 text-md" asChild onClick={() => setMobileOpen(false)}>
                      <Link to="/login">Log In to Account</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
