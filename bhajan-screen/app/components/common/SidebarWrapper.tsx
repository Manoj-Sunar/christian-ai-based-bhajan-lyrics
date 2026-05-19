"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { View } from "@/app/types";

export default function SidebarWrapper() {
  const [currentView, setCurrentView] = useState<View>("/admin/dashboard");

  return (
    <Sidebar
      currentView={currentView}
      onViewChange={setCurrentView}
    />
  );
}