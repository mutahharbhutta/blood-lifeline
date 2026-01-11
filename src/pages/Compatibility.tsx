import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, ArrowRight, ArrowLeft, Heart, CheckCircle2, GitBranch, Network, ArrowDown } from 'lucide-react';

// Compatibility: which blood types can a donor give to
const canDonateTo: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

// Compatibility: which blood types can donate to this type
const canReceiveFrom: Record<string, string[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const getBloodTypeColor = (type: string) => {
  if (type.startsWith('O')) return 'from-emerald-500 to-teal-600';
  if (type.startsWith('A')) return 'from-blue-500 to-indigo-600';
  if (type.startsWith('B')) return 'from-amber-500 to-orange-600';
  return 'from-purple-500 to-pink-600';
};

const getBloodTypeBgColor = (type: string) => {
  if (type.startsWith('O')) return 'bg-emerald-500/20 border-emerald-500/50';
  if (type.startsWith('A')) return 'bg-blue-500/20 border-blue-500/50';
  if (type.startsWith('B')) return 'bg-amber-500/20 border-amber-500/50';
  return 'bg-purple-500/20 border-purple-500/50';
};

// Graph node component for tree visualization
function GraphNode({ type, isCenter = false, delay = 0 }: { type: string; isCenter?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className={`
        ${isCenter ? 'w-20 h-20' : 'w-14 h-14'} 
        rounded-full bg-gradient-to-br ${getBloodTypeColor(type)} 
        flex items-center justify-center shadow-lg
        ${isCenter ? 'ring-4 ring-primary/30' : ''}
      `}
    >
      <span className={`font-bold text-white ${isCenter ? 'text-xl' : 'text-sm'}`}>{type}</span>
    </motion.div>
  );
}

// Connection line component
function ConnectionLine({ direction, delay = 0 }: { direction: 'up' | 'down' | 'left' | 'right'; delay?: number }) {
  const isVertical = direction === 'up' || direction === 'down';
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay }}
      className={`flex items-center justify-center ${isVertical ? 'flex-col' : 'flex-row'}`}
    >
      <div className={`${isVertical ? 'w-0.5 h-6' : 'h-0.5 w-6'} bg-gradient-to-r from-primary/50 to-primary`} />
      {direction === 'down' && <ArrowDown className="w-4 h-4 text-primary" />}
      {direction === 'up' && <ArrowDown className="w-4 h-4 text-primary rotate-180" />}
      {direction === 'right' && <ArrowRight className="w-4 h-4 text-primary" />}
      {direction === 'left' && <ArrowLeft className="w-4 h-4 text-primary" />}
    </motion.div>
  );
}

// Tree visualization component
function BloodTypeTree({ selectedType, donateTo, receiveFrom }: { 
  selectedType: string; 
  donateTo: string[]; 
  receiveFrom: string[];
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Receive From Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
          <ArrowDown className="w-3 h-3 rotate-180" />
          Can Receive From
        </div>
      </motion.div>
      
      <div className="flex flex-wrap justify-center gap-3 max-w-md">
        {receiveFrom.map((type, i) => (
          <motion.div
            key={`receive-${type}`}
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className={`blood-card overflow-hidden hover:scale-105 transition-transform ${getBloodTypeBgColor(type)}`}>
              <CardContent className="p-3 text-center">
                <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${getBloodTypeColor(type)} flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{type}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Arrows pointing down to center */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="w-0.5 h-8 bg-gradient-to-b from-accent to-primary" />
        <ArrowDown className="w-5 h-5 text-primary -mt-1" />
      </motion.div>

      {/* Center Node */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        className="relative"
      >
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getBloodTypeColor(selectedType)} flex items-center justify-center shadow-2xl ring-4 ring-primary/30`}>
          <span className="text-2xl font-bold text-white">{selectedType}</span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-primary/20 -z-10"
        />
      </motion.div>

      {/* Arrows pointing down from center */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center"
      >
        <ArrowDown className="w-5 h-5 text-primary" />
        <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-accent" />
      </motion.div>

      {/* Donate To Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <ArrowDown className="w-3 h-3" />
          Can Donate To
        </div>
      </motion.div>
      
      <div className="flex flex-wrap justify-center gap-3 max-w-md">
        {donateTo.map((type, i) => (
          <motion.div
            key={`donate-${type}`}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.05 }}
          >
            <Card className={`blood-card overflow-hidden hover:scale-105 transition-transform ${getBloodTypeBgColor(type)}`}>
              <CardContent className="p-3 text-center">
                <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${getBloodTypeColor(type)} flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{type}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Full compatibility graph visualization
function FullCompatibilityGraph() {
  // Create adjacency list representation
  const edges = useMemo(() => {
    const result: { from: string; to: string }[] = [];
    Object.entries(canDonateTo).forEach(([from, toList]) => {
      toList.forEach(to => {
        if (from !== to) {
          result.push({ from, to });
        }
      });
    });
    return result;
  }, []);

  // Position nodes in a grid
  const nodePositions: Record<string, { x: number; y: number }> = {
    'O-': { x: 0, y: 0 },
    'O+': { x: 1, y: 0 },
    'A-': { x: 0, y: 1 },
    'A+': { x: 1, y: 1 },
    'B-': { x: 2, y: 0 },
    'B+': { x: 3, y: 0 },
    'AB-': { x: 2, y: 1 },
    'AB+': { x: 3, y: 1 },
  };

  return (
    <div className="relative w-full overflow-x-auto">
      <div className="min-w-[600px] p-8">
        <div className="grid grid-cols-4 gap-8">
          {bloodTypes.map((type, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getBloodTypeColor(type)} flex items-center justify-center shadow-lg`}>
                <span className="font-bold text-white">{type}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-center">
                <p>Gives: {canDonateTo[type].length}</p>
                <p>Gets: {canReceiveFrom[type].length}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-muted-foreground">O Group - Universal Donor Base</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-muted-foreground">AB Group - Universal Receiver Base</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Compatibility matrix component
function CompatibilityMatrix() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="p-2 border-b border-border text-left">Blood Type</th>
            <th className="p-2 border-b border-border text-center" colSpan={8}>
              <span className="text-primary">Can Donate To →</span>
            </th>
          </tr>
          <tr>
            <th className="p-2 border-b border-border"></th>
            {bloodTypes.map(type => (
              <th key={type} className="p-2 border-b border-border text-center">
                <div className={`w-8 h-8 mx-auto rounded-full bg-gradient-to-br ${getBloodTypeColor(type)} flex items-center justify-center`}>
                  <span className="text-xs font-bold text-white">{type}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bloodTypes.map(fromType => (
            <tr key={fromType} className="hover:bg-muted/50">
              <td className="p-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getBloodTypeColor(fromType)} flex items-center justify-center`}>
                    <span className="text-xs font-bold text-white">{fromType}</span>
                  </div>
                </div>
              </td>
              {bloodTypes.map(toType => {
                const canDonate = canDonateTo[fromType].includes(toType);
                return (
                  <td key={toType} className="p-2 border-b border-border text-center">
                    {canDonate ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 mx-auto rounded-full bg-accent/20 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                      </motion.div>
                    ) : (
                      <div className="w-6 h-6 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">-</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Compatibility() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('checker');

  const donateTo = selectedType ? canDonateTo[selectedType] || [] : [];
  const receiveFrom = selectedType ? canReceiveFrom[selectedType] || [] : [];

  const handleCheck = () => {
    if (selectedType) {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setSelectedType('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Blood Compatibility Checker</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Check Blood Group <span className="text-primary">Compatibility</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore bidirectional blood compatibility - see who can donate to you and who you can donate to.
            </p>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="checker" className="gap-2">
                <Droplets className="w-4 h-4" />
                Checker
              </TabsTrigger>
              <TabsTrigger value="matrix" className="gap-2">
                <Network className="w-4 h-4" />
                Matrix
              </TabsTrigger>
            </TabsList>

            {/* Checker Tab */}
            <TabsContent value="checker">
              {/* Selection Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-md mx-auto mb-8"
              >
                <Card className="blood-card">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <label className="text-sm font-medium text-foreground">
                        Select Blood Group
                      </label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-full h-14 text-lg">
                          <SelectValue placeholder="Choose blood type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodTypes.map((type) => (
                            <SelectItem key={type} value={type} className="text-lg py-3">
                              <div className="flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-primary" />
                                {type}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCheck}
                          disabled={!selectedType}
                          className="flex-1 h-12"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Check Compatibility
                        </Button>
                        {showResults && (
                          <Button variant="outline" onClick={handleReset} className="h-12">
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Results - Tree Visualization */}
              <AnimatePresence mode="wait">
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-4xl mx-auto"
                  >
                    <Card className="blood-card overflow-hidden">
                      <CardContent className="p-6">
                        <BloodTypeTree 
                          selectedType={selectedType} 
                          donateTo={donateTo} 
                          receiveFrom={receiveFrom} 
                        />
                      </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <Card className="bg-accent/5 border-accent/20">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-full bg-accent/10">
                                <ArrowDown className="w-4 h-4 text-accent rotate-180" />
                              </div>
                              <h4 className="font-semibold text-foreground">Can Receive From ({receiveFrom.length} types)</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {selectedType} can safely receive blood from: <span className="font-medium text-foreground">{receiveFrom.join(', ')}</span>
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                      >
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <ArrowDown className="w-4 h-4 text-primary" />
                              </div>
                              <h4 className="font-semibold text-foreground">Can Donate To ({donateTo.length} types)</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {selectedType} can safely donate blood to: <span className="font-medium text-foreground">{donateTo.join(', ')}</span>
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Special Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className="mt-6"
                    >
                      <Card className="bg-muted/50">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Heart className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">
                                {selectedType === 'O-' ? '🌟 Universal Donor!' : 
                                 selectedType === 'AB+' ? '🌟 Universal Recipient!' :
                                 `${selectedType} Blood Type Info`}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedType === 'O-' 
                                  ? 'O- is the universal donor - can donate to ALL blood types! However, O- can only receive from O-.'
                                  : selectedType === 'AB+' 
                                  ? 'AB+ is the universal recipient - can receive from ALL blood types! However, AB+ can only donate to AB+.'
                                  : selectedType === 'O+'
                                  ? 'O+ is the most common blood type. It can donate to all positive types but can only receive from O- and O+.'
                                  : selectedType === 'AB-'
                                  ? 'AB- is a rare blood type. It can receive from all negative types and donate to AB- and AB+.'
                                  : `${selectedType} has moderate compatibility. It can donate to ${donateTo.length} types and receive from ${receiveFrom.length} types.`}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Reference */}
              {!showResults && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-4xl mx-auto mt-8"
                >
                  <h2 className="text-xl font-semibold text-foreground mb-4 text-center">
                    Quick Reference: Click to Check
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {bloodTypes.map((type) => (
                      <Card 
                        key={type} 
                        className="blood-card cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          setSelectedType(type);
                          setShowResults(true);
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${getBloodTypeColor(type)} flex items-center justify-center mb-2`}>
                            <span className="text-white font-bold">{type}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Gives: {canDonateTo[type].length} | Gets: {canReceiveFrom[type].length}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}
            </TabsContent>


            {/* Matrix Tab */}
            <TabsContent value="matrix">
              <Card className="blood-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-center mb-4">Compatibility Matrix (Adjacency Matrix)</h3>
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    Complete compatibility matrix showing all donation possibilities (Discrete Math representation)
                  </p>
                  <CompatibilityMatrix />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
