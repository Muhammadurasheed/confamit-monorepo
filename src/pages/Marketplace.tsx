import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Search, Store, CheckCircle2, Lock, TrendingUp, MapPin, Award, ArrowRight, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import MarketplaceSearchBar from "@/components/features/marketplace/MarketplaceSearchBar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Marketplace = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSearch = (query: string, location?: { lat: number; lng: number }) => {
    setLoading(true);
    const params = new URLSearchParams({ q: query });
    if (location) {
      params.append('lat', location.lat.toString());
      params.append('lng', location.lng.toString());
    }
    navigate(`/marketplace/search?${params.toString()}`);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } // Apple-like spring ease
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Header />
      
      <main className="flex-1">
        
        {/* Elite Apple-like Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48 bg-slate-50 dark:bg-[#0a0a0a]">
          {/* Subtle mesh gradient background */}
          <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-primary/5 via-white to-transparent dark:from-primary/10 dark:via-[#0a0a0a] dark:to-transparent opacity-80 pointer-events-none" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

          <Container className="relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="initial"
              animate="animate"
              variants={staggerChildren}
            >
              
              
              {/* Typography focusing on massive impact */}
              <motion.h1 variants={fadeInUp} className="text-[3rem] md:text-[5rem] lg:text-[6.5rem] font-extrabold tracking-[-0.03em] leading-[1.05] text-foreground mb-8">
                Find exactly what <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">you trust.</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-[1.15rem] md:text-[1.5rem] font-medium text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed tracking-tight">
                Every store is KYC-verified and cryptographically secured on the Hedera blockchain. No scams. Just authentic business.
              </motion.p>

              {/* Glassmorphic Search Container (Material You style) */}
              <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-3 md:p-4 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/10 ring-1 ring-white/50 dark:ring-white/5">
                  <MarketplaceSearchBar onSearch={handleSearch} loading={loading} />
                </div>
              </motion.div>
            </motion.div>
          </Container>
        </section>

        {/* The Standard of Trust - Google Material Layout */}
        <section className="py-24 md:py-32 bg-white dark:bg-[#0f0f0f] relative z-20 -mt-10 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] border-t border-black/5 dark:border-white/5">
          <Container>
            <div className="max-w-3xl mx-auto text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Built on absolute certainty</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We combine AI forensics with decentralized architecture to eliminate fraud before you even click "Buy".
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: "KYC Verified",
                  description: "Government IDs, live selfies, and official business registration documents are rigorously analyzed.",
                  color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                },
                {
                  icon: Lock,
                  title: "Hedera Anchored",
                  description: "Businesses hold immutable Trust IDs minted as NFTs. It is mathematically impossible to forge.",
                  color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                },
                {
                  icon: TrendingUp,
                  title: "Trust Scored",
                  description: "Every vendor maintains a dynamic trust score driven by on-chain activity and real community feedback.",
                  color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                },
                {
                  icon: MapPin,
                  title: "Hyper-Local",
                  description: "Instantly discover the highest-rated businesses right in your immediate vicinity, accurately.",
                  color: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <div className="group h-full p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-transparent hover:border-black/5 dark:hover:border-white/10 hover:shadow-xl transition-all duration-300">
                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-xl tracking-tight mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-[15px]">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Consumer Journey - Apple Editorial Style */}
        <section className="py-24 md:py-32 bg-slate-50 dark:bg-[#0a0a0a]">
          <Container>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                className="order-2 lg:order-1 relative"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="aspect-square md:aspect-[4/3] rounded-[2.5rem] bg-gradient-to-tr from-primary/20 via-primary/5 to-accent/20 border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-xl transition-opacity group-hover:opacity-0" />
                  <div className="absolute inset-0 flex items-center justify-center p-12">
                     <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 flex flex-col p-8 transform rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500">
                        <div className="w-20 h-20 bg-primary/10 rounded-full mb-6 mx-auto flex items-center justify-center">
                          <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={2.5} />
                        </div>
                        <h4 className="text-2xl font-bold text-center mb-2">Vendor Verified</h4>
                        <p className="text-center text-muted-foreground max-w-[250px] mx-auto">This business holds a valid Hedera Trust ID. Proceed safely.</p>
                     </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="order-1 lg:order-2"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-6">
                  <Store className="h-4 w-4" /> Three Steps to Trust
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-[1.1]">
                  Radically simple. <br/> Phenomenally secure.
                </h2>
                
                <div className="space-y-10">
                  {[
                    { num: "01", title: "Search your intent", desc: "Need a laptop? A plumber? Type it in. We query our verified database." },
                    { num: "02", title: "Analyze the stats", desc: "View their Hedera trust score, KYC level, and authentic customer reviews." },
                    { num: "03", title: "Trade with confidence", desc: "Route your payments through our Escrow Vault for a Zero-Risk experience." }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-6 group cursor-default">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        {step.num}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 tracking-tight">{step.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Massive CTA */}
        <section className="py-32 relative overflow-hidden bg-white dark:bg-[#0f0f0f]">
          <Container className="relative z-10 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">Ready to grow?</h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Join thousands of merchants who have upgraded their credibility. Get verified, mint your Trust ID, and meet your customers where they feel safe.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-16 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-all w-full sm:w-auto" onClick={() => navigate('/business/register')}>
                  Register Your Business
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full border-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <Search className="mr-2 h-5 w-5" /> Back to Search
                </Button>
              </div>
            </motion.div>
          </Container>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Marketplace;
