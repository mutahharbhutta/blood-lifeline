import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Droplets, Calendar, MapPin, Clock, History, HeartPulse, CheckCircle, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useBlood } from '@/context/BloodContext';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
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

interface Donation {
  id: string;
  blood_type: string;
  units: number;
  hospital: string | null;
  recipient_name: string | null;
  donated_at: string;
  notes: string | null;
}

interface BloodRequest {
  id: string;
  patient_name: string;
  blood_type: string;
  units: number;
  hospital: string;
  hospital_area: string;
  priority: string;
  status: string;
  created_at: string;
  requester_phone: string;
}

export default function DonorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { markRequestComplete, deleteRequest } = useBlood();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      fetchDonations();
      fetchRequests();
      setDonorInfo({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
      });
    }
  }, [user]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('donor_email', user?.email)
        .order('donated_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error: any) {
      console.error('Error fetching donations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load donation history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const phone = user?.user_metadata?.phone || user?.phone;
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .or(`requester_phone.eq.${phone},requester_email.eq.${user?.email}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleMarkComplete = async (requestId: string) => {
    try {
      await supabase
        .from('blood_requests')
        .update({ status: 'Fulfilled' })
        .eq('id', requestId);
      
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'Fulfilled' } : r
      ));
      
      toast({
        title: 'Request Completed',
        description: 'The blood request has been marked as fulfilled.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update request status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await supabase
        .from('blood_requests')
        .delete()
        .eq('id', requestId);
      
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      toast({
        title: 'Request Deleted',
        description: 'The blood request has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete request',
        variant: 'destructive',
      });
    }
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-primary/20 text-primary',
      'A-': 'bg-primary/20 text-primary',
      'B+': 'bg-accent/20 text-accent',
      'B-': 'bg-accent/20 text-accent',
      'AB+': 'bg-purple-500/20 text-purple-400',
      'AB-': 'bg-purple-500/20 text-purple-400',
      'O+': 'bg-urgent/20 text-urgent',
      'O-': 'bg-urgent/20 text-urgent',
    };
    return colors[bloodType] || 'bg-muted text-muted-foreground';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fulfilled':
        return 'bg-accent/20 text-accent';
      case 'Matched':
        return 'bg-primary/20 text-primary';
      case 'Pending':
        return 'bg-urgent/20 text-urgent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const totalUnits = donations.reduce((sum, d) => sum + d.units, 0);
  const uniqueHospitals = new Set(donations.map(d => d.hospital).filter(Boolean)).size;
  const activeRequests = requests.filter(r => r.status === 'Pending' || r.status === 'Matched').length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="text-muted-foreground mb-4">You need to be signed in to view your profile.</p>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              My Profile
            </h1>
            <p className="text-muted-foreground">
              View your donation history and blood requests
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="blood-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={donorInfo.name} readOnly className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={donorInfo.email} readOnly className="bg-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <Card className="blood-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Droplets className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{donations.length}</p>
                      <p className="text-sm text-muted-foreground">Donations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="blood-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{totalUnits}</p>
                      <p className="text-sm text-muted-foreground">Units</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="blood-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-urgent/10 flex items-center justify-center">
                      <HeartPulse className="w-6 h-6 text-urgent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{requests.length}</p>
                      <p className="text-sm text-muted-foreground">Requests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="blood-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{uniqueHospitals}</p>
                      <p className="text-sm text-muted-foreground">Hospitals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Tabs defaultValue="requests" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="requests" className="gap-2">
                    <HeartPulse className="w-4 h-4" />
                    My Requests
                  </TabsTrigger>
                  <TabsTrigger value="donations" className="gap-2">
                    <History className="w-4 h-4" />
                    Donation History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="requests">
                  <Card className="blood-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 text-primary" />
                        Blood Request History
                        {activeRequests > 0 && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-urgent/20 text-urgent">
                            {activeRequests} active
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {requestsLoading ? (
                        <div className="flex justify-center py-8">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                          />
                        </div>
                      ) : requests.length === 0 ? (
                        <div className="text-center py-8">
                          <HeartPulse className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No blood requests found</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your requests will appear here
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {requests.map((request, index) => (
                            <motion.div
                              key={request.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border"
                            >
                              <div className={`px-3 py-1.5 rounded-lg font-bold ${getBloodTypeColor(request.blood_type)}`}>
                                {request.blood_type}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-semibold text-foreground">
                                    {request.patient_name}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(request.status)}`}>
                                    {request.status}
                                  </span>
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                                    {request.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {request.hospital}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {request.status !== 'Fulfilled' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-accent hover:text-accent"
                                    onClick={() => handleMarkComplete(request.id)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Complete
                                  </Button>
                                )}
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
                                        onClick={() => handleDeleteRequest(request.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="donations">
                  <Card className="blood-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Donation History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                          />
                        </div>
                      ) : donations.length === 0 ? (
                        <div className="text-center py-8">
                          <Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No donations recorded yet</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your donations will appear here once recorded
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {donations.map((donation, index) => (
                            <motion.div
                              key={donation.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border"
                            >
                              <div className={`px-3 py-1.5 rounded-lg font-bold ${getBloodTypeColor(donation.blood_type)}`}>
                                {donation.blood_type}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-foreground">
                                    {donation.units} unit{donation.units > 1 ? 's' : ''}
                                  </span>
                                  {donation.hospital && (
                                    <>
                                      <span className="text-muted-foreground">•</span>
                                      <span className="text-muted-foreground flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {donation.hospital}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {donation.recipient_name && (
                                  <p className="text-sm text-muted-foreground">
                                    Recipient: {donation.recipient_name}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(donation.donated_at), 'PPP')}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
