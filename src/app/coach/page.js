"use client";

import { BarChart3, BookOpenCheck, ClipboardList, MessageSquareText, Users } from "lucide-react";
import RoleDashboard from "@/components/RoleDashboard";

export default function CoachDashboard() {
  return <RoleDashboard role="coach" title="Coach Dashboard" subtitle="Create learning material, manage classrooms, and understand student progress." features={[
    { title: "Puzzle Studio", description: "Create and organize instructional chess puzzles.", href: "/coach/puzzles", icon: BookOpenCheck },
    { title: "Classrooms", description: "Manage students and classroom invite codes.", href: "/coach/classes", icon: Users },
    { title: "Homework", description: "Build puzzle sets and assign work with due dates.", href: "/coach/homework", icon: ClipboardList },
    { title: "Analytics", description: "Review accuracy, solving time, and tactical weaknesses.", href: "/coach/analytics", icon: BarChart3 },
    { title: "Feedback", description: "Send personalized coaching notes to enrolled students.", href: "/coach/feedback", icon: MessageSquareText },
  ]} />;
}
