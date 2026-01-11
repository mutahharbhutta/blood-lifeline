import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, CheckCircle, AlertTriangle, MapPin, Phone, User, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface BloodRequest {
  id: string;
  patient_name: string;
  blood_type: string;
  units: number;
  hospital: string;
  hospital_area: string;
  priority: string;
  status: string;
  requester_name: string;
  requester_phone: string;
  relation_with_patient: string;
  source: string | null;
  matched_donor_name: string | null;
  matched_donor_phone: string | null;
  matched_donor_area: string | null;
  distance: number | null;
  created_at: string;
  updated_at: string;
}

export default function TrackRequest() {
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number to track requests",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('requester_phone', phone.trim())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);

      if (!data || data.length === 0) {
        toast({
          title: "No Requests Found",
          description: "No blood requests found for this phone number",
        });
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const statusConfig = {
    Pending: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock },
    Matched: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: User },
    Fulfilled: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle },
    Cancelled: { color: 'bg-muted text-muted-foreground border-border', icon: AlertTriangle },
  };

  const priorityConfig = {
    Emergency: 'blood-badge-urgent',
    Urgent: 'blood-badge-primary',
    Scheduled: 'bg-secondary text-secondary-foreground',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Track Your Request
            </h1>
            <p className="text-muted-foreground">
              Enter your phone number to check the status of your blood requests
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="blood-card mb-8"
          >
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="03XX-XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="self-end"
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Track'}
              </Button>
            </form>
          </motion.div>

          {/* Results */}
          {searched && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="blood-card text-center py-12"
                >
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No Requests Found</h3>
                  <p className="text-muted-foreground">
                    No blood requests found for this phone number
                  </p>
                </motion.div>
              ) : (
                requests.map((request, index) => {
                  const StatusIcon = statusConfig[request.status as keyof typeof statusConfig]?.icon || Clock;
                  
                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="blood-card"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                            {request.blood_type}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{request.patient_name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {request.hospital}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className={`blood-badge ${priorityConfig[request.priority as keyof typeof priorityConfig]}`}>
                            {request.priority === 'Emergency' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {request.priority}
                          </span>
                          <span className={`blood-badge border ${statusConfig[request.status as keyof typeof statusConfig]?.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {request.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Units Required</span>
                          <span className="font-medium">{request.units}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Relation</span>
                          <span className="font-medium">{request.relation_with_patient}</span>
                        </div>
                        
                        {request.source && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Source</span>
                            <span className="font-medium">{request.source}</span>
                          </div>
                        )}

                        {request.matched_donor_name && (
                          <div className="pt-3 mt-3 border-t border-border">
                            <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Matched Donor
                            </h4>
                            <div className="space-y-1 text-sm">
                              <p className="text-foreground">{request.matched_donor_name}</p>
                              {request.matched_donor_phone && (
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {request.matched_donor_phone}
                                </p>
                              )}
                              {request.matched_donor_area && (
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {request.matched_donor_area}
                                </p>
                              )}
                              {request.distance && (
                                <p className="text-muted-foreground">
                                  Distance: {request.distance} km
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 text-xs text-muted-foreground">
                          Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}