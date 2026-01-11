import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Route, 
  User, 
  Phone, 
  Building2,
  Droplets,
  Users,
  Calendar
} from 'lucide-react';
import { BloodRequest, getAreaName } from '@/lib/bloodData';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface RequestDetailsDialogProps {
  request: BloodRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestDetailsDialog({ request, open, onOpenChange }: RequestDetailsDialogProps) {
  if (!request) return null;

  const statusColors = {
    Pending: 'bg-urgent/10 text-urgent border-urgent/20',
    Matched: 'bg-accent/10 text-accent border-accent/20',
    Fulfilled: 'bg-accent/10 text-accent border-accent/20',
    Cancelled: 'bg-muted text-muted-foreground border-border',
  };

  const priorityColors = {
    Emergency: 'bg-urgent/10 text-urgent border-urgent/20',
    Urgent: 'bg-primary/10 text-primary border-primary/20',
    Scheduled: 'bg-secondary text-secondary-foreground border-border',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
              {request.bloodType}
            </div>
            <div>
              <span>Blood Request Details</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Request ID: {request.id}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Status & Priority */}
          <div className="flex gap-3">
            <Badge className={`${statusColors[request.status]} px-3 py-1`}>
              {request.status === 'Fulfilled' && <CheckCircle className="w-3 h-3 mr-1" />}
              {request.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
              {request.status}
            </Badge>
            <Badge className={`${priorityColors[request.priority]} px-3 py-1`}>
              {request.priority === 'Emergency' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {request.priority}
            </Badge>
            {request.source && (
              <Badge variant="outline" className="px-3 py-1">
                Source: {request.source}
              </Badge>
            )}
          </div>

          {/* Requester Information */}
          <div className="blood-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Requester Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name</span>
                <p className="font-medium text-foreground">{request.requesterName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone</span>
                <p className="font-medium text-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {request.requesterPhone}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Relation with Patient</span>
                <p className="font-medium text-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {request.relationWithPatient}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Request Date</span>
                <p className="font-medium text-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(request.createdAt, 'PPp')}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="blood-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-primary" />
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Patient Name</span>
                <p className="font-medium text-foreground">{request.patientName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Blood Type Required</span>
                <p className="font-bold text-primary text-lg">{request.bloodType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Units Required</span>
                <p className="font-medium text-foreground">{request.units} unit(s)</p>
              </div>
              <div>
                <span className="text-muted-foreground">Hospital</span>
                <p className="font-medium text-foreground flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {request.hospital}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Hospital Area</span>
                <p className="font-medium text-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {getAreaName(request.hospitalArea)}
                </p>
              </div>
            </div>
          </div>

          {/* Matched Donor Information */}
          {request.matchedDonor && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="blood-card bg-accent/5 border-accent/20"
            >
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                Matched Donor Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Donor Name</span>
                  <p className="font-medium text-foreground">{request.matchedDonor.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Donor Blood Type</span>
                  <p className="font-bold text-accent">{request.matchedDonor.bloodType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Donor Phone</span>
                  <p className="font-medium text-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {request.matchedDonor.phone}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Donor Area</span>
                  <p className="font-medium text-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {getAreaName(request.matchedDonor.area)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Route Information */}
          {request.route && request.route.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="blood-card"
            >
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Route className="w-4 h-4 text-primary" />
                Dijkstra's Shortest Path
              </h3>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {request.route.map((area, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                        {area}
                      </span>
                      {idx < request.route!.length - 1 && (
                        <span className="text-muted-foreground">→</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-foreground">
                  Total Distance: <span className="text-primary">{request.distance} km</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* Timeline */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            Created {formatDistanceToNow(request.createdAt, { addSuffix: true })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}