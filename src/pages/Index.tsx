import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  MapPin, 
  Users, 
  HeartPulse, 
  ArrowRight, 
  Zap,
  Route,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LahoreMap } from '@/components/LahoreMap';
import { StatCard } from '@/components/StatCard';
import { BloodInventoryCard } from '@/components/BloodInventoryCard';
import { useBlood } from '@/context/BloodContext';
import { Navbar } from '@/components/Navbar';

const Index = () => {
  const { donors, bloodBank, requests } = useBlood();
  const [selectedArea, setSelectedArea] = useState<string>();
  
  const availableDonors = donors.filter(d => d.isAvailable).length;
  const totalUnits = bloodBank.reduce((sum, b) => sum + b.units, 0);
  const activeRequests = requests.filter(r => r.status === 'Pending' || r.status === 'Matched').length;

  const features = [
    {
      icon: MapPin,
      title: '10 Lahore Areas',
      description: 'Complete coverage across Gulberg, DHA, Model Town, and more',
    },
    {
      icon: Route,
      title: 'Dijkstra Routing',
      description: 'Find the nearest donor using optimized shortest path algorithm',
    },
    {
      icon: Shield,
      title: 'Smart Blood Bank',
      description: 'O- preserved for emergencies, intelligent inventory management',
    },
    {
      icon: Zap,
      title: 'Real-time Matching',
      description: 'Instant donor matching based on blood compatibility',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-5" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 blood-badge blood-badge-primary mb-6"
            >
              <Droplets className="w-4 h-4" />
              Lahore Blood Management System
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 leading-tight"
            >
              Connecting Lives Through
              <span className="text-primary block">Smart Blood Donation</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Using Dijkstra's algorithm to find the nearest blood donors across Lahore. 
              Smart inventory management preserves O- blood for critical emergencies.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/request">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  <HeartPulse className="w-5 h-5" />
                  Request Blood
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Users className="w-5 h-5" />
                  Register as Donor
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard
              title="Available Donors"
              value={availableDonors}
              subtitle="Across Lahore"
              icon={Users}
              color="accent"
              index={0}
            />
            <StatCard
              title="Blood Units"
              value={totalUnits}
              subtitle="In Blood Bank"
              icon={Droplets}
              color="primary"
              index={1}
            />
            <StatCard
              title="Active Requests"
              value={activeRequests}
              subtitle="Being Processed"
              icon={HeartPulse}
              color="urgent"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Interactive Lahore Map
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Click on any area to see available donors. Green markers indicate areas with available donors.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="h-[500px] rounded-2xl overflow-hidden shadow-2xl"
          >
            <LahoreMap 
              selectedArea={selectedArea} 
              onAreaSelect={setSelectedArea} 
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Powered by Discrete Mathematics
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Graph theory, set theory, and optimization algorithms working together
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="blood-card text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Bank Inventory */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Blood Bank Inventory
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time stock levels. O- blood is reserved for extreme emergencies only.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bloodBank.map((inventory, index) => (
              <BloodInventoryCard key={inventory.bloodType} inventory={inventory} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center blood-card glow-effect"
          >
            <Droplets className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Every Drop Counts
            </h2>
            <p className="text-muted-foreground mb-8">
              Join our network of donors and help save lives in Lahore. 
              Your donation today could be someone's lifeline tomorrow.
            </p>
            <Link to="/register">
              <Button variant="hero" size="xl">
                Become a Donor Today
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            <span className="font-semibold">Team:</span> Mutahhar Ahmad Bhutta (BSDSF24M028) • Muhammad Mohid (BSDSF24M042) • Muhammad Ahmad Muavia (BSDSF24M043)
          </p>
          <p>
            Discrete Structures Project • Prof. Qamar u Zaman
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
