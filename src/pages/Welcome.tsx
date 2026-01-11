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

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-urgent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg shadow-primary/20">
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-foreground">
                LifeFlow
              </span>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Lahore Blood Management System</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 leading-tight"
            >
              Every Drop of Blood
              <span className="block text-primary">Saves a Life</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              Join Lahore's smartest blood donation network. Using advanced algorithms 
              to connect donors with those in need - faster than ever before.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link to="/home">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  <Heart className="w-5 h-5" />
                  Explore Platform
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Users className="w-5 h-5" />
                  Sign In / Register
                </Button>
              </Link>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
            >
              <div className="blood-card text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Smart Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Dijkstra's algorithm finds the nearest compatible donor
                </p>
              </div>

              <div className="blood-card text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Real-time Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Live tracking of requests and donor availability
                </p>
              </div>

              <div className="blood-card text-center">
                <div className="w-12 h-12 rounded-xl bg-urgent/10 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-urgent" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Secure & Safe</h3>
                <p className="text-sm text-muted-foreground">
                  Protected O- reserves for emergencies only
                </p>
              </div>
            </motion.div>
          </div>

          {/* Blood Type Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3"
          >
            {['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'].map((type, i) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary/60"
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
