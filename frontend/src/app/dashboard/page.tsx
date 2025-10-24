"use client";
export const dynamic = "force-dynamic";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
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

// =============================================
//  UI COMPONENTS
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
//  MAIN DASHBOARD
// =============================================
export default function DashboardPage() {
  const { isLoaded, user } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch activities
  const fetchActivities = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await fetch("/api/activity", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) fetchActivities();
  }, [user, isLoaded]);

  const usageChartData = useMemo(() => {
    const counts = { Air: 0, Water: 0, Land: 0 };
    activities.forEach((act) => {
      if (act.type.includes("Air")) counts.Air++;
      if (act.type.includes("Water")) counts.Water++;
      if (
        act.type.includes("Land") ||
        act.type.includes("Crop") ||
        act.type.includes("Deforestation")
      )
        counts.Land++;
    });
    return [
      { name: "Air", analyses: counts.Air },
      { name: "Water", analyses: counts.Water },
      { name: "Land", analyses: counts.Land },
    ];
  }, [activities]);

  if (!isLoaded || isLoading) {
    return (
      <div className="bg-[#0D1117] min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400"></div>
      </div>
    );
  }

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
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Total Analyses"
                  value={activities.length}
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
                    <linearGradient
                      id="colorAir"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#60a5fa"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#60a5fa"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorWater"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#22d3ee"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#22d3ee"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorLand"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#4ade80"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#4ade80"
                        stopOpacity={0.1}
                      />
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
                          ["colorAir", "colorWater", "colorLand"][index]
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
                  onClick={fetchActivities}
                  className="flex items-center gap-2 text-sm bg-gray-800 px-3 py-1 rounded-md hover:bg-gray-700 transition"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto pr-2">
                {activities.length > 0 ? (
                  <div className="relative">
                    {activities.map((act, index) => (
                      <TimelineItem
                        key={act.id}
                        activity={act}
                        isLast={index === activities.length - 1}
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
