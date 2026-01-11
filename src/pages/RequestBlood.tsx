import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  User, 
  MapPin, 
  Droplets, 
  Building2,
  AlertTriangle,
  Clock,
  Calendar,
  Check,
  Route,
  CheckCircle,
  Phone,
  Users,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { AnimatedRouteMap } from '@/components/AnimatedRouteMap';
import { NearbyDonorsList } from '@/components/NearbyDonorsList';
import { useBlood } from '@/context/BloodContext';
import { lahoreAreas, bloodTypes, BloodType, getAreaName, relationTypes, RelationType, Donor } from '@/lib/bloodData';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface DonorWithDistance {
  donor: Donor;
  route: string[];
  distance: number;
}

export default function RequestBlood() {
  const navigate = useNavigate();
  const { createRequest, processRequest, requests, confirmMatch, findAllDonorsSorted } = useBlood();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    patientName: '',
    bloodType: '' as BloodType | '',
    units: '' as number | '',
    hospital: '',
    hospitalArea: '',
    priority: '' as 'Emergency' | 'Urgent' | 'Scheduled' | '',
    requesterName: '',
    requesterPhone: '',
    relationWithPatient: '' as RelationType | '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<typeof requests[0] | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [availableDonors, setAvailableDonors] = useState<DonorWithDistance[]>([]);
  const [selectedDonorInfo, setSelectedDonorInfo] = useState<DonorWithDistance | null>(null);
  const [showDonorSearch, setShowDonorSearch] = useState(false);

  // Search for donors when blood type and hospital area are selected
  useEffect(() => {
    if (formData.bloodType && formData.hospitalArea) {
      const donors = findAllDonorsSorted(formData.bloodType as BloodType, formData.hospitalArea);
      setAvailableDonors(donors);
      setShowDonorSearch(true);
      if (donors.length > 0) {
        setSelectedDonorInfo(donors[0]); // Auto-select nearest
      }
    } else {
      setAvailableDonors([]);
      setShowDonorSearch(false);
      setSelectedDonorInfo(null);
    }
  }, [formData.bloodType, formData.hospitalArea, findAllDonorsSorted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const unitsValue = typeof formData.units === 'string' ? parseInt(formData.units) || 1 : formData.units || 1;
    
    if (!formData.patientName || !formData.bloodType || !formData.hospital || !formData.hospitalArea || !formData.priority || !formData.requesterName || !formData.requesterPhone || !formData.relationWithPatient || !unitsValue) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const submitRequest = async () => {
      const request = await createRequest({
        patientName: formData.patientName,
        bloodType: formData.bloodType as BloodType,
        units: unitsValue,
        hospital: formData.hospital,
        hospitalArea: formData.hospitalArea,
        priority: formData.priority as 'Emergency' | 'Urgent' | 'Scheduled',
        requesterName: formData.requesterName,
        requesterPhone: formData.requesterPhone,
        relationWithPatient: formData.relationWithPatient as RelationType,
      });

      const processedRequest = processRequest(request.id) || request;
      setResult(processedRequest);
      setIsSubmitting(false);

      if (processedRequest.status === 'Fulfilled') {
        toast({ title: "Blood Available!", description: `${unitsValue} unit(s) fulfilled from Blood Bank` });
      } else if (processedRequest.status === 'Matched') {
        toast({ title: "Donor Found!", description: `Matched with ${processedRequest.matchedDonor?.name}` });
      } else {
        toast({ title: "Request Submitted", description: "Your request has been saved.", variant: "destructive" });
      }
    };
    
    submitRequest();
  };

  const handleConfirmMatch = async () => {
    if (!result) return;
    setIsConfirming(true);
    try {
      await confirmMatch(result.id);
      toast({
        title: "Donation Confirmed!",
        description: "The donation has been recorded and the donor notified.",
      });
      // Update local result
      setResult(prev => prev ? { ...prev, status: 'Fulfilled' } : null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm match",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const priorityOptions = [
    { value: 'Emergency', label: 'Emergency', icon: AlertTriangle, description: 'Immediate need (uses blood bank)' },
    { value: 'Urgent', label: 'Urgent', icon: Clock, description: 'Within 24 hours' },
    { value: 'Scheduled', label: 'Scheduled', icon: Calendar, description: 'Planned transfusion (finds donor)' },
  ];
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
              <HeartPulse className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Request Blood
            </h1>
            <p className="text-muted-foreground">
              Smart matching using Dijkstra's algorithm to find the nearest donor
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="blood-card"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Requester Name */}
                <div className="space-y-2">
                  <Label htmlFor="requesterName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Your Name (Requester)
                  </Label>
                  <Input
                    id="requesterName"
                    placeholder="Enter your full name"
                    value={formData.requesterName}
                    onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  />
                </div>

                {/* Requester Phone & Relation */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requesterPhone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone Number
                    </Label>
                    <Input
                      id="requesterPhone"
                      placeholder="03XX-XXXXXXX"
                      value={formData.requesterPhone}
                      onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Relation with Patient
                    </Label>
                    <Select
                      value={formData.relationWithPatient}
                      onValueChange={(value) => setFormData({ ...formData, relationWithPatient: value as RelationType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationTypes.map((relation) => (
                          <SelectItem key={relation} value={relation}>{relation}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Patient Name */}
                <div className="space-y-2">
                  <Label htmlFor="patientName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Patient Name
                  </Label>
                  <Input
                    id="patientName"
                    placeholder="Enter patient's full name"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  />
                </div>

                {/* Blood Type & Units */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-muted-foreground" />
                      Blood Type
                    </Label>
                    <Select
                      value={formData.bloodType}
                      onValueChange={(value) => setFormData({ ...formData, bloodType: value as BloodType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="units">Units Required</Label>
                    <Input
                      id="units"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.units === '' ? '' : formData.units}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setFormData({ ...formData, units: '' });
                        } else {
                          const num = parseInt(val);
                          setFormData({ ...formData, units: isNaN(num) ? '' : Math.min(10, Math.max(1, num)) });
                        }
                      }}
                      placeholder="Enter units needed"
                    />
                  </div>
                </div>

                {/* Hospital */}
                <div className="space-y-2">
                  <Label htmlFor="hospital" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Hospital Name
                  </Label>
                  <Input
                    id="hospital"
                    placeholder="Enter hospital name"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  />
                </div>

                {/* Hospital Area */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Hospital Area
                  </Label>
                  <Select
                    value={formData.hospitalArea}
                    onValueChange={(value) => setFormData({ ...formData, hospitalArea: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select area in Lahore" />
                    </SelectTrigger>
                    <SelectContent>
                      {lahoreAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-3">
                  <Label>Priority Level</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {priorityOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.priority === option.value;
                      
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: option.value as typeof formData.priority })}
                          className={`
                            p-4 rounded-xl border-2 text-center transition-all
                            ${isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50 bg-background'}
                          `}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <p className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {option.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                      />
                      Processing Request...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-4 rounded-xl border ${
                    result.status === 'Fulfilled' || result.status === 'Matched'
                      ? 'bg-accent/10 border-accent/20'
                      : 'bg-primary/10 border-primary/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className={`w-6 h-6 ${
                      result.status === 'Fulfilled' || result.status === 'Matched' ? 'text-accent' : 'text-primary'
                    }`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {result.status === 'Fulfilled' && 'Blood Available from Bank!'}
                        {result.status === 'Matched' && 'Donor Found!'}
                        {result.status === 'Pending' && 'Request Submitted Successfully!'}
                      </h3>
                      
                      {result.status === 'Pending' && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Your request is being processed. We'll find a suitable donor soon.
                        </p>
                      )}
                      
                      {result.source === 'Blood Bank' && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {result.units} unit(s) of {result.bloodType} blood reserved from Blood Bank
                        </p>
                      )}
                      
                      {result.matchedDonor && (
                        <div className="mt-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                          <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Matched Donor Details
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-foreground font-medium">{result.matchedDonor.name}</p>
                            <p className="text-muted-foreground">
                              Blood Type: <span className="font-bold text-primary">{result.matchedDonor.bloodType}</span>
                            </p>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {getAreaName(result.matchedDonor.area)}
                            </p>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {result.matchedDonor.phone}
                            </p>
                          </div>
                          
                          {result.status === 'Matched' && (
                            <Button
                              className="w-full mt-3"
                              onClick={handleConfirmMatch}
                              disabled={isConfirming}
                            >
                              {isConfirming ? 'Confirming...' : 'Confirm & Record Donation'}
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {result.route && result.route.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-2 text-primary mb-1">
                            <Route className="w-4 h-4" />
                            <span className="font-medium text-sm">Dijkstra's Shortest Path</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.route.join(' → ')}
                          </p>
                          <p className="text-sm font-medium text-foreground mt-1">
                            Total Distance: {result.distance} km
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="h-[500px] rounded-2xl overflow-hidden">
                <AnimatedRouteMap 
                  selectedArea={formData.hospitalArea} 
                  highlightedRoute={result?.route}
                  animateRoute={true}
                  matchedDonor={result?.matchedDonor}
                  hospitalArea={formData.hospitalArea}
                />
              </div>
              
              {/* Nearby Donors List */}
              <AnimatePresence>
                {showDonorSearch && availableDonors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="blood-card">
                      <CardContent className="p-4">
                        <NearbyDonorsList
                          donors={availableDonors}
                          selectedDonor={selectedDonorInfo?.donor || null}
                          onSelectDonor={setSelectedDonorInfo}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Info */}
              <div className="blood-card">
                <h3 className="font-semibold text-foreground mb-2">How It Works</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-urgent/20 text-urgent text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
                    <span><strong>Emergency</strong> requests are fulfilled from Blood Bank</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
                    <span><strong>Scheduled</strong> requests find donors using Dijkstra's algorithm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
                    <span><strong>Nearest donors</strong> are shown first (sorted by distance)</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
