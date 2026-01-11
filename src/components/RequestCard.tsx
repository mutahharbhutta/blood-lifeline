import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, MapPin, Route, User, Trash2 } from 'lucide-react';
import { BloodRequest, getAreaName } from '@/lib/bloodData';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RequestCardProps {
  request: BloodRequest;
  index: number;
  onClick?: () => void;
  onMarkComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function RequestCard({ request, index, onClick, onMarkComplete, onDelete, showActions = false }: RequestCardProps) {
  const statusColors = {
    Pending: 'bg-urgent/10 text-urgent',
    Matched: 'bg-accent/10 text-accent',
    Fulfilled: 'bg-accent/10 text-accent',
    Cancelled: 'bg-muted text-muted-foreground',
  };

  const priorityColors = {
    Emergency: 'blood-badge-urgent',
    Urgent: 'blood-badge-primary',
    Scheduled: 'bg-secondary text-secondary-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="blood-card cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
            {request.bloodType}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{request.patientName}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {request.hospital}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`blood-badge ${priorityColors[request.priority]}`}>
            {request.priority === 'Emergency' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {request.priority}
          </span>
          <span className={`blood-badge ${statusColors[request.status]}`}>
            {request.status === 'Fulfilled' && <CheckCircle className="w-3 h-3 mr-1" />}
            {request.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
            {request.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Units Required</span>
          <span className="font-medium">{request.units}</span>
        </div>
        
        {request.source && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Source</span>
            <span className="font-medium">{request.source}</span>
          </div>
        )}

        {request.matchedDonor && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-accent">
              <User className="w-4 h-4" />
              <span className="font-medium">{request.matchedDonor.name}</span>
            </div>
          </div>
        )}

        {request.route && request.route.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-start gap-2 text-muted-foreground">
              <Route className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-xs">{request.route.join(' → ')}</span>
            </div>
            {request.distance !== undefined && (
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                Distance: {request.distance} km
              </p>
            )}
          </div>
        )}

        <div className="pt-2 text-xs text-muted-foreground">
          {formatDistanceToNow(request.createdAt, { addSuffix: true })}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="pt-3 border-t border-border flex gap-2" onClick={(e) => e.stopPropagation()}>
            {request.status !== 'Fulfilled' && onMarkComplete && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1 text-accent hover:text-accent"
                onClick={() => onMarkComplete(request.id)}
              >
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </Button>
            )}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Request?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this blood request. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(request.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
