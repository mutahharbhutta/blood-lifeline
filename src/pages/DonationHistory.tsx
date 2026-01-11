import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Droplets, Calendar, MapPin, User, Search } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface Donation {
  id: string;
  donor_name: string;
  donor_email: string;
  blood_type: string;
  units: number;
  recipient_name: string | null;
  hospital: string | null;
  donated_at: string;
  notes: string | null;
}

export default function DonationHistory() {
  const { user, isAdmin } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('donated_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(d =>
    d.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.blood_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.hospital && d.hospital.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getBloodTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-500',
      'A-': 'bg-red-600',
      'B+': 'bg-blue-500',
      'B-': 'bg-blue-600',
      'AB+': 'bg-purple-500',
      'AB-': 'bg-purple-600',
      'O+': 'bg-green-500',
      'O-': 'bg-green-600',
    };
    return colors[type] || 'bg-primary';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <History className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Donation History</h1>
                <p className="text-muted-foreground">Track all blood donations</p>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search donations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{donations.length}</p>
                    <p className="text-sm text-muted-foreground">Total Donations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {new Set(donations.map(d => d.donor_email)).size}
                    </p>
                    <p className="text-sm text-muted-foreground">Unique Donors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {donations.reduce((sum, d) => sum + d.units, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Units Donated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donations List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredDonations.length > 0 ? (
            <div className="grid gap-4">
              {filteredDonations.map((donation, index) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${getBloodTypeColor(donation.blood_type)} flex items-center justify-center text-white font-bold`}>
                            {donation.blood_type}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{donation.donor_name}</h3>
                            <p className="text-sm text-muted-foreground">{donation.donor_email}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Droplets className="w-4 h-4" />
                            <span>{donation.units} unit(s)</span>
                          </div>
                          {donation.hospital && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{donation.hospital}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(donation.donated_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>

                        {donation.recipient_name && (
                          <Badge variant="secondary">
                            Recipient: {donation.recipient_name}
                          </Badge>
                        )}
                      </div>
                      {donation.notes && (
                        <p className="mt-3 text-sm text-muted-foreground border-t border-border pt-3">
                          {donation.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No donations recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
