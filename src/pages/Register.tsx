import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.svg";
import authBg from "@/assets/auth-bg.png";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Register = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (!acceptTerms) {
      alert("Please accept the terms and conditions");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    if (!error) {
      navigate("/");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (!error) {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-[#007AFF]/10">
      {/* Left Column: Striking Apple-Level Visuals */}
      <div className="hidden lg:flex w-1/2 p-16 flex-col justify-between items-start bg-[#F5F5F7] relative overflow-hidden saturate-[1.1]">
        <img 
          src={authBg} 
          alt="Visual" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-[10s] hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/20 pointer-events-none" />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-10"
          >
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="bg-white/80 p-2.5 rounded-2xl backdrop-blur-xl border border-white shadow-sm ring-1 ring-black/[0.05] group-hover:scale-105 transition-transform">
                <img src={logo} alt="ConfirmIT" className="h-9 w-9" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-black/90 group-hover:opacity-80 transition-opacity">ConfirmIT</span>
            </Link>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[54px] font-bold leading-[1.05] tracking-tight text-[#1D1D1F] max-w-[500px]"
          >
            Start Your <br />
            Trust Journey.
          </motion.h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 py-6 px-8 rounded-[32px] bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03]"
        >
          <p className="text-[19px] font-medium text-[#1D1D1F]/80 leading-snug">
            Verify commerce instantly and lock funds <br /> in secure Hedera smart contracts.
          </p>
        </motion.div>
      </div>

      {/* Right Column: High-Precision Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] space-y-8"
        >
          <Link to="/" className="inline-flex items-center text-sm font-semibold text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Home
          </Link>
          <div className="text-left space-y-2">
            <h2 className="text-[34px] font-bold tracking-tight text-[#1D1D1F]">Create Account</h2>
            <p className="text-[17px] text-[#86868B] font-medium leading-relaxed">
              Step into the future of trustless commerce.
            </p>
          </div>

          <div className="space-y-6">
            <Button
              variant="outline"
              className="w-full h-[58px] rounded-2xl bg-[#F5F5F7] border-transparent hover:bg-[#E8E8ED] text-[17px] font-semibold text-[#1D1D1F] transition-all flex items-center justify-center group"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon />
              <span className="group-hover:text-[#1D1D1F]">Continue with Google</span>
            </Button>

            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#D2D2D7]/60" />
              </div>
              <span className="relative bg-white px-4 text-[#86868B] text-sm font-medium">or register with email</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[14px] font-semibold text-[#1D1D1F] opacity-90">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[58px] rounded-2xl border-none bg-[#F5F5F7] px-5 text-[17px] font-medium focus:ring-4 focus:ring-[#007AFF]/10 focus:bg-white transition-all placeholder:text-[#86868B]/40"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" title="password" className="text-[14px] font-semibold text-[#1D1D1F] opacity-90">Create Password</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    title="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-[58px] rounded-2xl border-none bg-[#F5F5F7] px-5 text-[17px] font-medium focus:ring-4 focus:ring-[#007AFF]/10 focus:bg-white transition-all placeholder:text-[#86868B]/40 pr-12"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" title="confirm-password" className="text-[14px] font-semibold text-[#1D1D1F] opacity-90">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  title="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-[58px] rounded-2xl border-none bg-[#F5F5F7] px-5 text-[17px] font-medium focus:ring-4 focus:ring-[#007AFF]/10 focus:bg-white transition-all placeholder:text-[#86868B]/40"
                  required
                />
              </div>

              <div className="flex items-start space-x-3 pt-1">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="w-5 h-5 rounded-md border-[#D2D2D7] data-[state=checked]:bg-[#007AFF] data-[state=checked]:border-[#007AFF] mt-0.5"
                />
                <Label
                  htmlFor="terms"
                  className="text-[14px] font-medium text-[#86868B] leading-tight cursor-pointer"
                >
                  By joining, you agree to our <Link to="/terms" className="text-[#007AFF] font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#007AFF] font-bold hover:underline">Privacy</Link>.
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-[62px] rounded-2xl bg-[#007AFF] hover:bg-[#0071E3] text-[18px] font-bold text-white shadow-[0_8px_24px_rgba(0,122,255,0.25)] transition-all hover:scale-[1.01] active:scale-[0.98] mt-6" 
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join ConfirmIT"}
              </Button>
            </form>

            <p className="text-center text-[16px] text-[#86868B] pt-6 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-[#007AFF] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
