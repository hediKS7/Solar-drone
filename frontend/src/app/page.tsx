"use client"

import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { useEffect } from "react";
import { useSimStore } from "@/store/useSimStore";

export default function Home() {
  const { 
    runSimulation, 
    battery, solar, mission, environment, lca 
  } = useSimStore();

  // Debounced simulation run
  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [battery, solar, mission, environment, lca]);

  return (
    <main className="flex h-screen w-screen overflow-hidden dark bg-[#0a0a0a] text-foreground">
      <Sidebar />
      <Dashboard />
    </main>
  );
}
