import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Droplets, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  donor_name: string;
  donor_id: string;
  blood_type: string;
  total_units: number;
  donation_count: number;
}

export function DonorLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('donor_name, donor_id, blood_type, units');

      if (error) throw error;

      // Aggregate by donor
      const aggregated: Record<string, LeaderboardEntry> = {};
      data?.forEach((donation) => {
        const key = donation.donor_id;
        if (!aggregated[key]) {
          aggregated[key] = {
            donor_name: donation.donor_name,
            donor_id: donation.donor_id,
            blood_type: donation.blood_type,
            total_units: 0,
            donation_count: 0,
          };
        }
        aggregated[key].total_units += donation.units;
        aggregated[key].donation_count += 1;
      });

      const sorted = Object.values(aggregated)
        .sort((a, b) => b.total_units - a.total_units)
        .slice(0, 10);

      setLeaderboard(sorted);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30';
      case 1:
        return 'bg-gradient-to-r from-gray-300/10 to-gray-400/10 border-gray-400/30';
      case 2:
        return 'bg-gradient-to-r from-amber-600/10 to-orange-500/10 border-amber-600/30';
      default:
        return 'bg-card border-border';
    }
  };

  if (loading) {
    return (
      <div className="blood-card">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-foreground">Top Donors</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="blood-card">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-foreground">Top Donors</h3>
        </div>
        <div className="text-center py-8">
          <Droplets className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No donations recorded yet</p>
          <p className="text-muted-foreground text-xs mt-1">Be the first to donate!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blood-card">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold text-foreground">Top Donors</h3>
      </div>
      
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <motion.div
            key={entry.donor_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-lg border ${getRankBg(index)}`}
          >
            <div className="w-8 flex items-center justify-center">
              {getRankIcon(index)}
            </div>
            
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{entry.donor_name}</p>
              <p className="text-xs text-muted-foreground">
                {entry.donation_count} donation{entry.donation_count > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">
                {entry.blood_type}
              </span>
              <div className="text-right">
                <span className="font-bold text-primary">{entry.total_units}</span>
                <span className="text-xs text-muted-foreground ml-1">units</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
