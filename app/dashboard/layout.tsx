"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  BarChart2,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarItem } from "@/components/ui/sidebar-item";
import Image from "next/image";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to access the dashboard");
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleNavigation = (path: string) => {
    setActiveTab(path || "dashboard");
    router.push(path ? `/dashboard/${path}` : "/dashboard");
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not logged in.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("https://lms.mathlab.lk/api/v1/logout/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch {
      toast.error("An error occurred during logout");
    }
  };

  if (loading) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header with Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
          <Image
            src="/MachmaLogo.png"
            alt="Machma Logo"
            width={50}
            height={50}
            className="object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-[18px] font-bold">Machma College</h1>
            <h2 className="text-[1px]">Institute Management System</h2>
          </div>
        </div>


        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {/* Dashboard */}
          <SidebarItem
            title="Dashboard"
            icon={LayoutDashboard}
            active={activeTab === "dashboard"}
            onClick={() => handleNavigation("")}
          />

          {/* Attendance */}
          <SidebarItem
            title="Attendance"
            icon={CalendarCheck}
            expandable
            expanded={attendanceOpen}
            active={activeTab.startsWith("attendance")}
            onClick={() => setAttendanceOpen((prev) => !prev)}
          >
            <AnimatePresence>
              {attendanceOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="ml-4 mt-1 space-y-0.5"
                >
                  <SidebarItem
                    title="Class Based Attendance"
                    active={activeTab === "attendance/class-based"}
                    small
                    onClick={() =>
                      handleNavigation("attendance/class-based")
                    }
                  />
                  <SidebarItem
                    title="Manual Attendance"
                    active={activeTab === "attendance/manual"}
                    small
                    onClick={() => handleNavigation("attendance/manual")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </SidebarItem>

          {/* Analysis */}
          <SidebarItem
            title="Analysis"
            icon={BarChart2}
            active={activeTab === "analysis"}
            onClick={() => handleNavigation("analysis")}
          />

          {/* Settings */}
          <SidebarItem
            title="Settings"
            icon={Settings}
            active={activeTab === "settings"}
            onClick={() => handleNavigation("settings")}
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-auto p-8"
      >
        {children}
      </motion.div>
    </div>
  );
}
