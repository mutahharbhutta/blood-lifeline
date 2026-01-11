import { motion } from 'framer-motion';
import { Droplets, Info, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BloodInventoryCard } from '@/components/BloodInventoryCard';
import { useBlood } from '@/context/BloodContext';
import { bloodCompatibility, BloodType } from '@/lib/bloodData';

export default function BloodAvailability() {
  const { bloodBank } = useBlood();

  const getCompatibilityInfo = (bloodType: BloodType) => {
    const canReceiveFrom = bloodCompatibility[bloodType];
    return canReceiveFrom.join(', ');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Blood Availability
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time blood inventory levels. Check availability before making a request.
            </p>
          </motion.div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <div className="blood-card bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">How Blood Matching Works</h3>
                  <p className="text-sm text-muted-foreground">
                    If your required blood type is not available, we'll show you compatible alternatives. 
                    Our system uses Dijkstra's algorithm to find the nearest compatible donor for you.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Blood Inventory Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {bloodBank.map((inventory, index) => (
                <motion.div
                  key={inventory.bloodType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BloodInventoryCard inventory={inventory} index={index} />
                  <div className="mt-2 p-3 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Can receive from:</span>{' '}
                      {getCompatibilityInfo(inventory.bloodType)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* O- Warning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="blood-card bg-urgent/5 border-urgent/20"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-urgent mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">O- Blood (Universal Donor)</h3>
                  <p className="text-sm text-muted-foreground">
                    O- blood is reserved for extreme emergencies only. If you request O- blood for a scheduled 
                    procedure, our system will try to find an O- donor instead of using blood bank reserves.
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
