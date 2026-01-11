import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Phone, Navigation, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Donor } from '@/lib/bloodData';

interface DonorWithDistance {
  donor: Donor;
  route: string[];
  distance: number;
}

interface NearbyDonorsListProps {
  donors: DonorWithDistance[];
  selectedDonor: Donor | null;
  onSelectDonor: (donorInfo: DonorWithDistance) => void;
  isConfirming?: boolean;
  onConfirm?: () => void;
}

const getBloodTypeColor = (type: string) => {
  if (type.startsWith('O')) return 'from-emerald-500 to-teal-600';
  if (type.startsWith('A')) return 'from-blue-500 to-indigo-600';
  if (type.startsWith('B')) return 'from-amber-500 to-orange-600';
  return 'from-purple-500 to-pink-600';
};

export function NearbyDonorsList({ 
  donors, 
  selectedDonor, 
  onSelectDonor, 
  isConfirming,
  onConfirm 
}: NearbyDonorsListProps) {
  if (donors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No donors available for this blood type</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          Available Donors ({donors.length})
        </h3>
        <Badge variant="outline" className="text-xs">
          Sorted by Distance
        </Badge>
      </motion.div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        <AnimatePresence>
          {donors.map((donorInfo, index) => {
            const { donor, route, distance } = donorInfo;
            const isSelected = selectedDonor?.id === donor.id;
            const isNearest = index === 0;

            return (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ 
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 200,
                  damping: 20
                }}
              >
                <Card 
                  className={`
                    cursor-pointer transition-all duration-300 overflow-hidden
                    ${isSelected 
                      ? 'ring-2 ring-primary shadow-lg bg-primary/5' 
                      : 'hover:shadow-md hover:bg-muted/50'
                    }
                    ${isNearest ? 'border-accent' : ''}
                  `}
                  onClick={() => onSelectDonor(donorInfo)}
                >
                  {/* Nearest Badge */}
                  {isNearest && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.3 }}
                      className="h-1 bg-gradient-to-r from-accent via-primary to-accent"
                    />
                  )}
                  
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Blood Type Badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                        className={`
                          w-12 h-12 rounded-full bg-gradient-to-br ${getBloodTypeColor(donor.bloodType)}
                          flex items-center justify-center shadow-md flex-shrink-0
                        `}
                      >
                        <span className="text-white font-bold text-sm">{donor.bloodType}</span>
                      </motion.div>

                      {/* Donor Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground truncate">{donor.name}</h4>
                          {isNearest && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.4, type: 'spring' }}
                            >
                              <Badge className="bg-accent text-accent-foreground text-xs gap-1">
                                <Star className="w-3 h-3" />
                                Nearest
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{route[route.length - 1]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{donor.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Distance */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="text-right flex-shrink-0"
                      >
                        <div className={`
                          text-lg font-bold 
                          ${isNearest ? 'text-accent' : 'text-primary'}
                        `}>
                          {distance} km
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {route.length - 1} stops
                        </div>
                      </motion.div>
                    </div>

                    {/* Route Preview on Selection */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Navigation className="w-3 h-3 text-primary" />
                              <span className="font-medium">Route (Dijkstra's Algorithm)</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-xs">
                              {route.map((stop, i) => (
                                <motion.span
                                  key={i}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex items-center"
                                >
                                  <span className={`
                                    px-2 py-0.5 rounded-full
                                    ${i === 0 ? 'bg-primary/20 text-primary' : 
                                      i === route.length - 1 ? 'bg-accent/20 text-accent' : 
                                      'bg-muted text-muted-foreground'}
                                  `}>
                                    {stop}
                                  </span>
                                  {i < route.length - 1 && (
                                    <span className="mx-1 text-muted-foreground">→</span>
                                  )}
                                </motion.span>
                              ))}
                            </div>
                            
                            {onConfirm && (
                              <Button
                                className="w-full mt-3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onConfirm();
                                }}
                                disabled={isConfirming}
                              >
                                {isConfirming ? (
                                  'Confirming...'
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Confirm & Contact Donor
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
