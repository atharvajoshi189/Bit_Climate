"use client";
export const dynamic = "force-dynamic";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import useSWR from "swr";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// === ICONS (Naye icons add kiye gaye hain) ===
import {
  LayoutDashboard,
  History,
  Settings,
  Wind,
  Droplets,
  Mountain,
  ChevronRight,
  BrainCircuit,
  CheckCircle,
  FileText,
  RefreshCw,
  Award,
  BarChart3,
  Target,      // Naya
  CalendarDays, // Naya
  TrendingUp,  // Naya
  Filter,      // Naya
  Sprout,      // Naya (Rank) - Changed from Seedling
  Shield,      // Naya (Rank)
  Trees,       // Naya (Rank)
  Crown,       // Naya (Rank)
  Trophy,      // Naya (Leaderboard)
  Sparkles,    // Naya (Quest)
} from "lucide-react";

// === RECHARTS (Naye charts add kiye gaye hain) ===
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  RadialBarChart, // Naya
  RadialBar,      // Naya
  Legend,         // Naya
  PolarAngleAxis, // Naya
} from "recharts";

// =============================================
//  TYPES
// =============================================
interface Activity {
  id: number;
  type: string;
  details: string | null;
  createdAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  points: number;
}

// NAYA TYPE: Leaderboard ke liye
interface LeaderboardEntry {
  id: string;
  fullName: string; // Clerk se
  imageUrl: string; // Clerk se
  points: number;   // Aapke DB se
}

// =============================================
//  SWR FETCHER (UNCHANGED)
// =============================================
const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => {
    if (!res.ok) throw new Error("Fetch error");
    return res.json();
  });

// =============================================
//  SUPABASE HELPER (UNCHANGED)
// =============================================
function getSupabaseClient(): SupabaseClient | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase env vars missing - realtime disabled");
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// =============================================
//  NAYE UI COMPONENTS
// =============================================

// Naya StatCard
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg shadow-lg">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-neutral-400">{title}</p>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
  </div>
);

// Naya TimelineItem
const TimelineItem = ({
  activity,
  isLast,
}: {
  activity: Activity;
  isLast: boolean;
}) => {
  const getIcon = () => {
    if (activity.type.includes("Air")) return <Wind size={16} className="text-blue-300" />;
    if (activity.type.includes("Water")) return <Droplets size={16} className="text-cyan-300" />;
    if (activity.type.includes("Land")) return <Mountain size={16} className="text-green-300" />;
    if (activity.type.includes("Quiz")) return <Award size={16} className="text-yellow-300" />;
    return <CheckCircle size={16} className="text-neutral-400" />;
  };

  return (
    <motion.div
      className="flex gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center">
        <div className="flex-shrink-0 w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center ring-4 ring-black">
          {getIcon()}
        </div>
        {!isLast && <div className="w-px h-full bg-neutral-700 mt-2"></div>}
      </div>
      <div className="pb-8 -mt-1.5">
        <p className="font-medium text-neutral-200">{activity.type}</p>
        <p className="text-sm text-neutral-400">{activity.details}</p>
        <time className="text-xs text-neutral-500 mt-1">
          {new Date(activity.createdAt).toLocaleString()}
        </time>
      </div>
    </motion.div>
  );
};

// Naya Component: Leaderboard Item
const LeaderboardItem = ({
  user,
  rank,
}: {
  user: LeaderboardEntry;
  rank: number;
}) => (
  <div className="flex items-center justify-between gap-4 py-2">
    <div className="flex items-center gap-3">
      <span className={`text-lg font-bold ${
        rank === 1 ? "text-yellow-400" :
        rank === 2 ? "text-neutral-300" :
        rank === 3 ? "text-yellow-600" : "text-neutral-500"
      }`}>
        {rank}
      </span>
      <img
        src={user.imageUrl}
        alt={user.fullName}
        className="w-8 h-8 rounded-full object-cover"
      />
      <span className="text-sm font-medium text-neutral-200 truncate">{user.fullName}</span>
    </div>
    <span className="text-sm font-bold text-green-400">{user.points} pts</span>
  </div>
);


// =============================================
//  MAIN DASHBOARD
// =============================================
export default function DashboardPage() {
  const { isLoaded, user } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<string | null>(null);

  // =============================================
  //  DATA FETCHING (SWR)
  // =============================================
  const { data: profile, mutate: mutateProfile } = useSWR<UserProfile>(
    user ? "/api/user/profile" : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 0 }
  );

  const { data: activities, mutate: mutateActivities } = useSWR<Activity[]>(
    user ? "/api/activity" : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 0 }
  );
  
  // NAYA SWR HOOK: Leaderboard ke liye
  const { data: leaderboard } = useSWR<LeaderboardEntry[]>(
    "/api/leaderboard", // Ye API endpoint aapko banana padega!
    fetcher,
    { 
      refreshInterval: 60000 // Har 60 sec me refresh karega
    }
  );

  // =============================================
  //  BACKEND LOGIC (Realtime, Polling)
  // =============================================
  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient> | null>(null);
  const subscriptionRef = useRef<any>(null);
  const pollingRef = useRef<number | null>(null);

  // Manual Refresh Function (Toast dikhayega)
  const refreshAll = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([mutateProfile(), mutateActivities()]);
      toast.success("Dashboard refreshed!", {
        style: { background: "#171717", color: "#f5f5f5", border: "1px solid #34d399" },
      });
    } catch (err: any) {
      console.error("Refresh failed:", err);
      toast.error("Refresh failed", {
        style: { background: "#171717", color: "#f5f5f5", border: "1px solid #f87171" },
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [mutateProfile, mutateActivities]);

  const handleRefresh = useCallback(async () => {
    await refreshAll();
  }, [refreshAll]);

  // 1) Supabase realtime listener (UNCHANGED)
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseClient();
    supabaseRef.current = supabase;
    if (!supabase) return;

    const usersChannel = supabase
      .channel(`public:users:user-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "User", filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload?.new) {
            mutateProfile(
              (current) => ({ ...current, ...(payload.new as UserProfile) }),
              { revalidate: false }
            );
          } else {
            mutateProfile();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Activity", filter: `userId=eq.${user.id}` },
        (payload) => {
          mutateActivities();
          mutateProfile();
        }
      )
      .subscribe();

    subscriptionRef.current = usersChannel;

    return () => {
      try {
        if (subscriptionRef.current && supabaseRef.current) {
          supabaseRef.current.removeChannel(subscriptionRef.current);
        }
      } catch (e) { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mutateProfile, mutateActivities]);

  // 2) Polling fallback (FIXED: Silent)
  useEffect(() => {
    if (!user) return;
    const intervalMs = 20000; // 20 seconds
    pollingRef.current = window.setInterval(async () => {
      try {
        await Promise.all([mutateProfile(), mutateActivities()]);
      } catch (e) { /* silently ignore */ }
    }, intervalMs);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mutateProfile, mutateActivities]);

  // 3) One-time initial load
  useEffect(() => {
    if (!isLoaded || !user) return;
    mutateProfile();
    mutateActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user]);

  // =============================================
  //  FEATURE LOGIC (Ranks, Stats, Charts)
  // =============================================

  // NAYA: Rank/Stats Logic
  const { averageDailyPoints, activityStreak, rankInfo, rankProgressData } = useMemo(() => {
    if (!profile || !activities) {
      return { 
        averageDailyPoints: 0, 
        activityStreak: 0, 
        rankInfo: { title: "Eco-Beginner", Icon: Sprout, colorClass: "text-green-400", nextRankPoints: 100 },
        rankProgressData: [{ name: 'Points', value: 0, fill: '#8884d8' }]
      };
    }

    const currentPoints = profile.points;

    // --- NAYI RANK LOGIC ---
    const getRankInfo = (points: number) => {
      if (points >= 1000) return { title: "Eco-Legend", Icon: Crown, colorClass: "text-yellow-400", currentRankPoints: 1000, nextRankPoints: 5000 };
      if (points >= 500) return { title: "Eco-Guardian", Icon: Trees, colorClass: "text-teal-400", currentRankPoints: 500, nextRankPoints: 1000 };
      if (points >= 100) return { title: "Eco-Warrior", Icon: Shield, colorClass: "text-blue-400", currentRankPoints: 100, nextRankPoints: 500 };
      return { title: "Eco-Beginner", Icon: Sprout, colorClass: "text-green-400", currentRankPoints: 0, nextRankPoints: 100 };
    };
    const rInfo = getRankInfo(currentPoints);
    // --- END RANK LOGIC ---

    // --- NAYI RADIAL CHART LOGIC ---
    const progress = (currentPoints - rInfo.currentRankPoints) / (rInfo.nextRankPoints - rInfo.currentRankPoints);
    const progressPercentage = Math.max(0, Math.min(100, progress * 100));
    const rProgressData = [
      { name: 'Progress', value: progressPercentage, fill: '#34d399' }, // Green
    ];
    // --- END CHART LOGIC ---

    // Calculate Average Daily Points
    const firstActivityDate = activities.length > 0 ? new Date(activities[activities.length - 1].createdAt) : null;
    let daysSinceFirstActivity = 1;
    if (firstActivityDate) {
      const diffTime = Math.abs(new Date().getTime() - firstActivityDate.getTime());
      daysSinceFirstActivity = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }
    const avgDaily = currentPoints / daysSinceFirstActivity;

    // Calculate Activity Streak
    const sortedActivities = [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    let streak = 0;
    let lastActivityDate: Date | null = null;
    const today = new Date(); today.setHours(0, 0, 0, 0); 
    for (const activity of sortedActivities) {
      const activityDate = new Date(activity.createdAt); activityDate.setHours(0, 0, 0, 0);
      if (lastActivityDate === null) {
        const diffDays = Math.round(Math.abs((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)));
        if (diffDays <= 1) { streak = 1; lastActivityDate = activityDate; } 
        else break;
      } else {
        const diffDays = Math.round(Math.abs((lastActivityDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)));
        if (diffDays === 1) { streak++; lastActivityDate = activityDate; } 
        else if (diffDays === 0) continue;
        else break;
      }
    }

    return {
      averageDailyPoints: parseFloat(avgDaily.toFixed(2)),
      activityStreak: streak,
      rankInfo: rInfo,
      rankProgressData: rProgressData,
    };
  }, [profile, activities]);

  // Chart data (Bar Chart)
  const usageChartData = useMemo(() => {
    const counts = { Air: 0, Water: 0, Land: 0, Quiz: 0 };
    (activities || []).forEach((act) => {
      if (act.type.includes("Air")) counts.Air++;
      if (act.type.includes("Water")) counts.Water++;
      if (act.type.includes("Land") || act.type.includes("Crop")) counts.Land++;
      if (act.type.includes("Quiz")) counts.Quiz++;
    });
    return [
      { name: "Air", analyses: counts.Air, fill: "#60a5fa" },
      { name: "Water", analyses: counts.Water, fill: "#22d3ee" },
      { name: "Land", analyses: counts.Land, fill: "#4ade80" },
      { name: "Quiz", analyses: counts.Quiz, fill: "#facc15" },
    ];
  }, [activities]);

  // Filtered Activities (Timeline)
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    if (!selectedActivityType) return activities;
    return activities.filter((activity) =>
      activity.type.toLowerCase().includes(selectedActivityType.toLowerCase())
    );
  }, [activities, selectedActivityType]);

  // =============================================
  //  LOADING DISPLAY (FIXED)
  // =============================================
  const isLoading = !isLoaded || !profile || !activities; // FIX: Waits for BOTH profile and activities

  if (!isLoaded || isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // =============================================
  //  JSX RENDER
  // =============================================
  return (
    <div className="bg-black min-h-screen text-neutral-200 pt-24 pb-12 font-sans">
      <main className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === MAIN CONTENT (LEFT COLUMN) === */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* --- Header --- */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Welcome, {user?.firstName || "Explorer"}!
              </h1>
              <motion.div 
                className={`flex items-center gap-2 mt-2 ${rankInfo.colorClass}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <rankInfo.Icon className="h-5 w-5" />
                <span className="text-lg font-medium">{rankInfo.title}</span>
              </motion.div>
            </motion.div>

            {/* --- Stat Cards --- */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {},
              }}
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <StatCard title="Total Eco-Points" value={profile?.points || 0} icon={Award} color="text-yellow-400" />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <StatCard title="Total Analyses" value={(activities || []).length} icon={BrainCircuit} color="text-blue-400" />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <StatCard title="Activity Streak" value={`${activityStreak} Days`} icon={CalendarDays} color="text-purple-400" />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <StatCard title="Avg. Daily Points" value={averageDailyPoints} icon={TrendingUp} color="text-teal-400" />
              </motion.div>
            </motion.div>
            
            {/* --- Bar Chart --- */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-lg h-[400px]">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 /> Analysis Distribution
              </h2>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={usageChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#171717", border: "1px solid #404040", color: "#f5f5f5" }}
                    cursor={{ fill: "rgba(163, 163, 163, 0.1)" }}
                  />
                  <Bar dataKey="analyses" radius={[4, 4, 0, 0]}>
                    {usageChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* --- Recent Activity --- */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <History /> Recent Activity
                </h2>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedActivityType || ""}
                    onChange={(e) => setSelectedActivityType(e.target.value || null)}
                    className="bg-neutral-800 text-neutral-300 text-sm py-1.5 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border border-neutral-700"
                    aria-label="Filter activities by type"
                  >
                    <option value="">All Types</option>
                    <option value="Air">Air</option>
                    <option value="Water">Water</option>
                    <option value="Land">Land</option>
                    <option value="Quiz">Quiz</option>
                  </select>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 text-sm bg-neutral-800 px-3 py-1.5 rounded-md hover:bg-neutral-700 transition disabled:opacity-50 border border-neutral-700"
                    title="Refresh activities"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto pr-2">
                {(filteredActivities || []).length > 0 ? (
                  <div className="relative">
                    {filteredActivities.map((act: Activity, index: number) => (
                      <TimelineItem
                        key={act.id}
                        activity={act}
                        isLast={index === filteredActivities.length - 1}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-center py-4">
                    No activities found for this filter.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* === SIDEBAR (RIGHT COLUMN) === */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            
            {/* --- NAYA: Rank Progress Card --- */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Progress to Next Rank</h3>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="90%"
                    barSize={20}
                    data={rankProgressData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                      background
                      dataKey="value"
                      angleAxisId={0}
                      cornerRadius={10}
                      className="fill-green-500"
                    />
                    <Legend content={() => (
                      <div className="text-center -mt-32">
                        <p className="text-4xl font-bold text-green-400">
                          {`${Math.round(rankProgressData[0].value)}%`}
                        </p>
                        <p className="text-neutral-400 text-sm">to {rankInfo.nextRankPoints} pts</p>
                      </div>
                    )} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-neutral-300 mt-4">
                You are a <span className={`font-bold ${rankInfo.colorClass}`}>{rankInfo.title}</span>!
              </p>
            </div>
            
            {/* --- NAYA: Leaderboard Card --- */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-400" /> Leaderboard
              </h3>
              <div className="flex flex-col gap-2">
                {(leaderboard || []).length > 0 ? (
                  (leaderboard || []).map((entry, index) => (
                    <LeaderboardItem key={entry.id} user={entry} rank={index + 1} />
                  ))
                ) : (
                  <p className="text-neutral-500 text-sm text-center py-4">Leaderboard is loading...</p>
                )}
              </div>
            </div>

            {/* --- NAYA: Daily Quest Card --- */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="text-red-400" /> Daily Quest
              </h3>
              <p className="text-neutral-300 text-sm mb-4">
                Complete a **Water Quality** analysis today to earn **+25 bonus points**!
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Start Quest
              </button>
            </div>
            
            {/* --- NAYA: Smart Suggestion Card --- */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-cyan-400" /> Smart Suggestion
              </h3>
              <p className="text-neutral-300 text-sm">
                Your recent **Land** analyses show high activity. Have you considered checking the **Air Quality** in the same region?
              </p>
            </div>

            {/* --- Quick Actions Card --- */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings /> Quick Actions
              </h2>
              <div className="flex flex-col gap-3">
                <Link
                  href="/land"
                  className="flex items-center justify-between p-4 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
                >
                  <div className="flex items-center gap-3 font-medium">
                    <Mountain className="text-green-400" /> Land Analysis
                  </div>
                  <ChevronRight />
                </Link>
                <Link
                  href="/water"
                  className="flex items-center justify-between p-4 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
                >
                  <div className="flex items-center gap-3 font-medium">
                    <Droplets className="text-cyan-400" /> Water Analysis
                  </div>
                  <ChevronRight />
                </Link>
                <Link
                  href="/air"
                  className="flex items-center justify-between p-4 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
                >
                  <div className="flex items-center gap-3 font-medium">
                    <Wind className="text-blue-400" /> Air Analysis
                  </div>
                  <ChevronRight />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}