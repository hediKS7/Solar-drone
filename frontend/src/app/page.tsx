"use client"

import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { useEffect } from "react";
import { useSimStore } from "@/store/useSimStore";

export default function Home() {
  const { runSimulation } = useSimStore();

  // Run an initial simulation on load
  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <main className="flex h-screen w-screen overflow-hidden dark bg-[#0a0a0a] text-foreground">
      <Sidebar />
      <Dashboard />
    </main>
  );
}
