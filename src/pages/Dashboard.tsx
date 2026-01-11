import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Droplets, 
  HeartPulse,
  Filter,
  Search,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/Navbar';
import { DonorCard } from '@/components/DonorCard';
import { BloodInventoryCard } from '@/components/BloodInventoryCard';
import { RequestCard } from '@/components/RequestCard';
import { RequestDetailsDialog } from '@/components/RequestDetailsDialog';
import { StatCard } from '@/components/StatCard';
import { DonorLeaderboard } from '@/components/DonorLeaderboard';
import { useBlood } from '@/context/BloodContext';
import { BloodRequest } from '@/lib/bloodData';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { donors, bloodBank, requests, updateDonorAvailability, deleteDonor, markRequestComplete, deleteRequest } = useBlood();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterAvailable ? donor.isAvailable : true;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteDonor = (donorId: string) => {
    deleteDonor(donorId);
    toast({ title: "Donor Deleted", description: "Donor has been removed from the system" });
  };

  const handleRequestClick = (request: BloodRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleMarkComplete = async (requestId: string) => {
    await markRequestComplete(requestId);
    toast({ title: "Request Completed", description: "Blood request marked as fulfilled" });
  };

  const handleDeleteRequest = async (requestId: string) => {
    await deleteRequest(requestId);
    toast({ title: "Request Deleted", description: "Blood request has been removed" });
  };

  const availableDonors = donors.filter(d => d.isAvailable).length;
  const totalUnits = bloodBank.reduce((sum, b) => sum + b.units, 0);
  const fulfilledRequests = requests.filter(r => r.status === 'Fulfilled' || r.status === 'Matched').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Manage donors, inventory, and requests</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Donors" value={donors.length} subtitle={`${availableDonors} available`} icon={Users} color="primary" index={0} />
            <StatCard title="Blood Units" value={totalUnits} subtitle="In stock" icon={Droplets} color="accent" index={1} />
            <StatCard title="Total Requests" value={requests.length} subtitle={`${fulfilledRequests} fulfilled`} icon={HeartPulse} color="primary" index={2} />
            <StatCard title="Success Rate" value={requests.length > 0 ? `${Math.round((fulfilledRequests / requests.length) * 100)}%` : '0%'} subtitle="Requests fulfilled" icon={HeartPulse} color="accent" index={3} />
          </div>

          <Tabs defaultValue="donors" className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-4">
              <TabsTrigger value="donors" className="gap-2"><Users className="w-4 h-4" />Donors</TabsTrigger>
              <TabsTrigger value="inventory" className="gap-2"><Droplets className="w-4 h-4" />Inventory</TabsTrigger>
              <TabsTrigger value="requests" className="gap-2"><HeartPulse className="w-4 h-4" />Requests</TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-2"><Trophy className="w-4 h-4" />Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="donors" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search donors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Button variant={filterAvailable ? 'default' : 'outline'} onClick={() => setFilterAvailable(!filterAvailable)} className="gap-2">
                  <Filter className="w-4 h-4" />Available Only
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredDonors.map((donor, index) => (
                  <DonorCard 
                    key={donor.id} 
                    donor={donor} 
                    index={index} 
                    showActions 
                    onToggleAvailability={updateDonorAvailability}
                    onDelete={handleDeleteDonor}
                  />
                ))}
              </div>
              {filteredDonors.length === 0 && (
                <div className="text-center py-12"><Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No donors found</p></div>
              )}
            </TabsContent>

            <TabsContent value="inventory">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bloodBank.map((inventory, index) => (
                  <BloodInventoryCard key={inventory.bloodType} inventory={inventory} index={index} showManagement />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="requests">
              {requests.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {requests.map((request, index) => (
                    <RequestCard 
                      key={request.id} 
                      request={request} 
                      index={index} 
                      onClick={() => handleRequestClick(request)}
                      onMarkComplete={handleMarkComplete}
                      onDelete={handleDeleteRequest}
                      showActions
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12"><HeartPulse className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No blood requests yet</p></div>
              )}
            </TabsContent>

            <TabsContent value="leaderboard">
              <div className="max-w-2xl mx-auto">
                <DonorLeaderboard />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <RequestDetailsDialog request={selectedRequest} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </div>
  );
}
