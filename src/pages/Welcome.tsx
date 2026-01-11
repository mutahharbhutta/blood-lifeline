import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Droplets,
  Heart,
  Users,
  ArrowRight,
  Shield,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Welcome() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col justify-center">
        {/* Background Elements - Organic & Alive */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] animate-pulse-soft" />
        </div>

        <div className="relative container mx-auto px-4 z-10">
          {/* Logo Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-12"
          >
            <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 border border-white/20 shadow-lg backdrop-blur-xl bg-white/30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/25 animate-heartbeat">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                LifeFlow
              </span>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-white/40 text-primary-foreground/80 mb-8 backdrop-blur-md shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Lahore's Premier Blood Management System</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-foreground mb-8 leading-[1.1] tracking-tight"
            >
              Essential Connections,
              <span className="block bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent pb-2">
                lifesaving speed.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              The most advanced network connecting compassionate donors with critical patients.
              <span className="font-medium text-foreground"> Fast. Reliable. Secure.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            >
              <Link to="/home">
                <Button size="xl" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 bg-gradient-to-r from-primary to-rose-600 border-none">
                  <Heart className="w-5 h-5 mr-2 fill-white/20" />
                  Explore Platform
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              {user ? (
                <Link to="/home">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto h-14 px-8 rounded-full backdrop-blur-sm bg-white/40 border-white/60 hover:bg-white/60 text-foreground shadow-sm">
                    <Users className="w-5 h-5 mr-2" />
                    Go to Home
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto h-14 px-8 rounded-full backdrop-blur-sm bg-white/40 border-white/60 hover:bg-white/60 text-foreground shadow-sm">
                    <Users className="w-5 h-5 mr-2" />
                    Sign In / Register
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Feature Cards - Glass Panel Style */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              <div className="group p-6 rounded-2xl bg-white/40 border border-white/50 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Smart Matching</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Precision algorithms locate the nearest compatible donors instantly.
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-white/40 border border-white/50 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Real-time Sync</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Live status tracking maintains constant connection between hospitals and donors.
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-white/40 border border-white/50 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Secure & Verified</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rigorous verification ensures safety for every drop exchanged.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Blood Type Floating Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="hidden md:flex justify-center gap-4 mt-20 opacity-60"
          >
            {['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'].map((type, i) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="px-4 py-2 rounded-xl bg-white/30 border border-white/40 backdrop-blur-sm text-sm font-bold text-primary/70 shadow-sm"
              >
                {type}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative border-t border-border">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            <span className="font-semibold">Team:</span> Mutahhar Ahmad Bhutta (BSDSF24M028) • Muhammad Mohid (BSDSF24M042) • Muhammad Ahmad Muavia (BSDSF24M043)
          </p>
          <p>
            Discrete Structures Project • Prof. Qamar u Zaman
          </p>
        </div>
      </div>
    </div>
  );
}
