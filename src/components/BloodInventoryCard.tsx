import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, AlertTriangle, Plus, Minus } from 'lucide-react';
import { BloodBankInventory, BloodType } from '@/lib/bloodData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useBlood } from '@/context/BloodContext';
import { useToast } from '@/hooks/use-toast';

interface BloodInventoryCardProps {
  inventory: BloodBankInventory;
  index: number;
  showManagement?: boolean;
}

export function BloodInventoryCard({ inventory, index, showManagement = false }: BloodInventoryCardProps) {
  const { bloodType, units, reserved } = inventory;
  const { addBloodUnits, removeBloodUnits, updateReservedUnits } = useBlood();
  const { toast } = useToast();
  const [unitAmount, setUnitAmount] = useState(1);
  const [newReserved, setNewReserved] = useState(reserved);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const available = units - reserved;
  const isLow = available <= 5;
  const isCritical = available <= 2;

  const handleAddUnits = () => {
    addBloodUnits(bloodType as BloodType, unitAmount);
    toast({
      title: "Units Added",
      description: `Added ${unitAmount} unit(s) of ${bloodType} blood`,
    });
    setUnitAmount(1);
  };

  const handleRemoveUnits = () => {
    if (unitAmount > units) {
      toast({
        title: "Error",
        description: "Cannot remove more units than available",
        variant: "destructive",
      });
      return;
    }
    removeBloodUnits(bloodType as BloodType, unitAmount);
    toast({
      title: "Units Removed",
      description: `Removed ${unitAmount} unit(s) of ${bloodType} blood`,
    });
    setUnitAmount(1);
  };

  const handleUpdateReserved = () => {
    updateReservedUnits(bloodType as BloodType, newReserved);
    toast({
      title: "Reserved Updated",
      description: `Reserved units for ${bloodType} updated to ${newReserved}`,
    });
    setIsDialogOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="blood-card group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg shrink-0
            ${isCritical ? 'bg-destructive/10 text-destructive' : 
              isLow ? 'bg-urgent/10 text-urgent' : 
              'bg-primary/10 text-primary'}
          `}>
            {bloodType}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">Type {bloodType}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {bloodType === 'O-' ? 'Universal Donor' : 
               bloodType === 'AB+' ? 'Universal Recipient' : 'Standard Type'}
            </p>
          </div>
        </div>
        {(isLow || isCritical) && (
          <AlertTriangle className={`w-5 h-5 shrink-0 ${isCritical ? 'text-destructive' : 'text-urgent'} animate-pulse-soft`} />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Available Units</span>
          <span className="font-semibold text-foreground">{available}</span>
        </div>
        
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((available / 20) * 100, 100)}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 }}
            className={`h-full rounded-full ${
              isCritical ? 'bg-destructive' : 
              isLow ? 'bg-urgent' : 
              'bg-accent'
            }`}
          />
        </div>

        {reserved > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Droplets className="w-3 h-3 shrink-0" />
            <span>{reserved} units reserved for emergencies</span>
          </div>
        )}

        {showManagement && (
          <div className="pt-3 mt-3 border-t border-border space-y-3">
            {/* Single Input with Add/Remove Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="urgent" 
                onClick={handleRemoveUnits} 
                className="h-9 px-3 shrink-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                min={1}
                value={unitAmount}
                onChange={(e) => setUnitAmount(parseInt(e.target.value) || 1)}
                className="h-9 text-center text-sm flex-1 min-w-0"
              />
              <Button 
                size="sm" 
                variant="success" 
                onClick={handleAddUnits} 
                className="h-9 px-3 shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Edit Reserved */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  Edit Reserved Units
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Reserved Units for {bloodType}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Reserved Units (for emergencies)</label>
                    <Input
                      type="number"
                      min={0}
                      max={units}
                      value={newReserved}
                      onChange={(e) => setNewReserved(parseInt(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Current total: {units} units. Available after reserve: {units - newReserved} units.
                    </p>
                  </div>
                  <Button onClick={handleUpdateReserved} className="w-full">
                    Update Reserved
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </motion.div>
  );
}
