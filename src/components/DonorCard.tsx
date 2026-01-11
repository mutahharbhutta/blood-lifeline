import { motion } from 'framer-motion';
import { Phone, MapPin, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Donor, getAreaName } from '@/lib/bloodData';
import { Button } from '@/components/ui/button';

interface DonorCardProps {
  donor: Donor;
  index: number;
  onToggleAvailability?: (donorId: string, isAvailable: boolean) => void;
  onDelete?: (donorId: string) => void;
  showActions?: boolean;
}

export function DonorCard({ donor, index, onToggleAvailability, onDelete, showActions = false }: DonorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="blood-card"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left section: Blood type badge and donor info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg shrink-0
            ${donor.isAvailable ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}
          `}>
            {donor.bloodType}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{donor.name}</h3>
              {donor.isAvailable ? (
                <span className="blood-badge blood-badge-success text-xs shrink-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Available
                </span>
              ) : (
                <span className="blood-badge bg-muted text-muted-foreground text-xs shrink-0">
                  <XCircle className="w-3 h-3 mr-1" />
                  Unavailable
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{getAreaName(donor.area)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{donor.phone}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right section: Action buttons */}
        {showActions && (
          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
            {onToggleAvailability && (
              <Button
                variant={donor.isAvailable ? 'outline' : 'success'}
                size="sm"
                onClick={() => onToggleAvailability(donor.id, !donor.isAvailable)}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                {donor.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(donor.id)}
                className="px-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
