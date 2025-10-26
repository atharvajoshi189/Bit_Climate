"use client";
export const dynamic = "force-dynamic";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import useSWR from "swr";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

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
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
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

// =============================================
//  Minor UI components (unchanged visually)
// =============================================
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
  <motion.div
    className="bg-gray-800/50 p-4 rounded-xl border border-white/10 flex items-center gap-4"
    whileHover={{ scale: 1.05, backgroundColor: "rgba(31,41,55,0.7)" }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </motion.div>
);

const TimelineItem = ({
  activity,
  isLast,
}: {
  activity: Activity;
  isLast: boolean;
}) => (
  <motion.div
    className="flex gap-4"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex flex-col items-center">
      <div className="flex-shrink-0 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center ring-4 ring-gray-900">
        <CheckCircle size={16} className="text-black" />
      </div>
      {!isLast && <div className="w-px h-full bg-gray-700 mt-2"></div>}
    </div>
    <div className="pb-8 -mt-1">
      <p className="font-bold text-white">{activity.type}</p>
      <p className="text-sm text-gray-400">{activity.details}</p>
      <time className="text-xs text-gray-500 mt-1">
        {new Date(activity.createdAt).toLocaleString()}
      </time>
    </div>
  </motion.div>
);

// =============================================
//  Helper: SWR fetcher
// =============================================
const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => {
    if (!res.ok) throw new Error("Fetch error");
    return res.json();
  });

// =============================================
//  Supabase Realtime setup helper
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
//  MAIN DASHBOARD (UI preserved exactly)
// =============================================
export default function DashboardPage() {
  const { isLoaded, user } = useUser();

  // Local UI states (unchanged)
  const [isRefreshing, setIsRefreshing] = useState(false);

  // SWR for profile and activities (auto revalidation)
  const {
    data: profile,
    error: profileError,
    mutate: mutateProfile,
  } = useSWR<UserProfile>(user ? "/api/user/profile" : null, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 0, // we'll control polling manually to avoid double work
  });

  const {
    data: activities,
    error: activitiesError,
    mutate: mutateActivities,
  } = useSWR<Activity[]>(user ? "/api/activity" : null, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 0,
  });

  // Keep a ref to supabase client and subscription so we can cleanup
  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient> | null>(null);
  const subscriptionRef = useRef<any>(null);
  const pollingRef = useRef<number | null>(null);

  // Helper to fetch and update both endpoints
  const refreshAll = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([mutateProfile(), mutateActivities()]);
      toast.success("Dashboard refreshed!");
    } catch (err: any) {
      console.error("Refresh failed:", err);
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Manual handler for your existing button (keeps UI unchanged)
  const handleRefresh = async () => {
    await refreshAll();
  };

  // 1) Setup Supabase realtime listener (push)
  useEffect(() => {
    if (!user) return;

    const supabase = getSupabaseClient();
    supabaseRef.current = supabase;

    if (!supabase) return;

    // Listen to changes on 'users' table (for points) and 'Activity' table (for new activities)
    const usersChannel = supabase
      .channel(`public:users:user-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "User", filter: `id=eq.${user.id}` },
        (payload) => {
          // When users row changes, revalidate profile endpoint
          // payload.new contains new row
          // Use mutateProfile to update SWR cache instantly
          if (payload?.new) {
            // Replace SWR cache value immediately
            mutateProfile(
              (current) => {
                if (!current) return payload.new as UserProfile;
                return { ...current, points: (payload.new as any).points };
              },
              { revalidate: false }
            );
          } else {
            // If delete or other event, revalidate
            mutateProfile();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Activity", filter: `userId=eq.${user.id}` },
        (payload) => {
          // On activity changes, revalidate activities list and optionally profile
          mutateActivities(); // re-fetch activities
          // If this activity is 'Quiz Completed' and includes points info in details,
          // revalidate profile to fetch updated points
          mutateProfile();
        }
      )
      .subscribe(async (status) => {
        // status can be SUBSCRIBED | TIMED_OUT | etc.
        // console.log("Supabase users channel status:", status);
      });

    subscriptionRef.current = usersChannel;

    return () => {
      // cleanup
      try {
        if (subscriptionRef.current && supabaseRef.current) {
          supabaseRef.current.removeChannel(subscriptionRef.current);
        }
      } catch (e) {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mutateProfile, mutateActivities]);

  // 2) Polling fallback (B) — safe interval to ensure eventual consistency
  useEffect(() => {
    if (!user) return;

    // Poll every 8 seconds (configurable)
    const intervalMs = 8000;
    pollingRef.current = window.setInterval(async () => {
      try {
        await Promise.all([mutateProfile(), mutateActivities()]);
      } catch (e) {
        // silently ignore
      }
    }, intervalMs);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mutateProfile, mutateActivities]);

  // 3) One-time initial load (while preserving your UI layout)
  useEffect(() => {
    if (!isLoaded || !user) return;
    // On mount, ensure data is loaded
    mutateProfile();
    mutateActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user]);

  // Chart data (unchanged semantics)
  const usageChartData = useMemo(() => {
    const counts = { Air: 0, Water: 0, Land: 0, Quiz: 0 };
    (activities || []).forEach((act) => {
      if (act.type.includes("Air")) counts.Air++;
      if (act.type.includes("Water")) counts.Water++;
      if (
        act.type.includes("Land") ||
        act.type.includes("Crop") ||
        act.type.includes("Deforestation")
      )
        counts.Land++;
      if (act.type.includes("Quiz")) counts.Quiz++;
    });
    return [
      { name: "Air", analyses: counts.Air },
      { name: "Water", analyses: counts.Water },
      { name: "Land", analyses: counts.Land },
      { name: "Quiz", analyses: counts.Quiz },
    ];
  }, [activities]);

  // Loading display (keeps your original spinner behaviour)
  const isLoading = !isLoaded || (!profile && !activities);

  if (!isLoaded || isLoading) {
    return (
      <div className="bg-[#0D1117] min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  // ====== THE ORIGINAL UI (kept intact, only data sources are now SWR-driven) ======
  return (
    <div className="bg-[#0D1117] min-h-screen text-white pt-24 pb-12">
      <main className="container mx-auto px-6">
        <motion.div
          className="flex items-center gap-6 mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={user?.imageUrl}
            alt={user?.fullName || "User profile"}
            className="w-24 h-24 rounded-full border-4 border-gray-700"
          />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Welcome, {user?.firstName || "Explorer"}!
            </h1>
            <p className="text-lg text-gray-400 mt-1">
              Let's review your impact on the planet.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div
            className="lg:col-span-1 flex flex-col gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LayoutDashboard /> Overview
              </h2>
              {/* Grid 2x2 kar diya */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Total Eco-Points"
                  value={profile?.points || 0} // Data now comes from SWR (real-time)
                  icon={Award}
                  color="bg-yellow-500"
                />
                <StatCard
                  title="Total Analyses"
                  value={(activities || []).length}
                  icon={BrainCircuit}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Reports"
                  value="0"
                  icon={FileText}
                  color="bg-purple-500"
                />
              </div>
            </div>

            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings /> Quick Actions
              </h2>
              <div className="flex flex-col gap-3">
                <Link
                  href="/land"
                  className="flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-700/70 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <Mountain className="text-green-400" /> Land Analysis
                  </div>
                  <ChevronRight />
                </Link>
                <Link
                  href="/water"
                  className="flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-700/70 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <Droplets className="text-cyan-400" /> Water Analysis
                  </div>
                  <ChevronRight />
                </Link>
                <Link
                  href="/air"
                  className="flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-700/70 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <Wind className="text-blue-400" /> Air Analysis
                  </div>
                  <ChevronRight />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            className="lg:col-span-2 flex flex-col gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-2xl border border-white/10 h-[300px]">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart /> Analysis Distribution
              </h2>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={usageChartData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorLand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1} />
                    </linearGradient>
                    {/* Naya Gradient Quiz ke liye */}
                    <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#facc15" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#facc15" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30,41,59,0.9)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  />
                  <Bar dataKey="analyses" radius={[4, 4, 0, 0]}>
                    {usageChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#${
                          ["colorAir", "colorWater", "colorLand", "colorQuiz"][index]
                        })`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <History /> Recent Activity
                </h2>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 text-sm bg-gray-800 px-3 py-1 rounded-md hover:bg-gray-700 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto pr-2">
                {(activities || []).length > 0 ? (
                  <div className="relative">
                    {(activities || []).map((act, index) => (
                      <TimelineItem
                        key={act.id}
                        activity={act}
                        isLast={index === activities!.length - 1}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    You haven't performed any analysis yet.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
