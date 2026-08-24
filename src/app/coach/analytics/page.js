"use client";

import { useEffect, useState } from "react";
import { Activity, BarChart3, Clock3, Target, Users } from "lucide-react";
import CoachSection from "@/components/CoachSection";
import { getJson } from "@/lib/api";

const Metric = ({ icon: Icon, label, value, detail }) => <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center gap-3 text-zinc-500"><Icon size={18}/><span className="text-xs font-black uppercase tracking-wide">{label}</span></div><p className="mt-3 text-3xl font-black">{value}</p><p className="mt-1 text-xs text-zinc-500">{detail}</p></div>;
const Progress = ({ value, color = "bg-emerald-500" }) => <div className="h-2 overflow-hidden rounded-full bg-zinc-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }}/></div>;

export default function CoachAnalyticsPage() {
  const [data, setData] = useState(null); const [classroom, setClassroom] = useState("all"); const [error, setError] = useState("");
  useEffect(() => { getJson("/api/analytics").then(setData).catch(requestError => setError(requestError.message)); }, []);
  const students = data?.students.filter(student => classroom === "all" || student.classrooms.some(room => room._id === classroom)) || [];
  return <CoachSection title="Student Analytics" description="Track homework completion, solving accuracy, speed, and tactical weaknesses using students’ best puzzle results.">
    {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
    {!data && !error && <div className="rounded-3xl border bg-white p-10 text-center text-zinc-500">Loading analytics…</div>}
    {data && <>
      <div className="mb-6 flex justify-end"><select aria-label="Filter by classroom" value={classroom} onChange={event => setClassroom(event.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm font-bold"><option value="all">All classrooms</option>{data.classrooms.map(room => <option key={room._id} value={room._id}>{room.name}</option>)}</select></div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Users} label="Students" value={data.summary.totalStudents} detail={`${data.summary.activeStudents} submitted work`}/>
        <Metric icon={Activity} label="Completed" value={data.summary.completedPuzzles} detail="Unique assigned puzzles"/>
        <Metric icon={Target} label="Accuracy" value={`${data.summary.averageAccuracy}%`} detail="Average best score"/>
        <Metric icon={Clock3} label="Solve time" value={`${data.summary.averageTime}s`} detail="Average completion time"/>
        <Metric icon={BarChart3} label="Engagement" value={data.summary.totalStudents ? `${Math.round((data.summary.activeStudents / data.summary.totalStudents) * 100)}%` : "0%"} detail="Students with submissions"/>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="border-b p-6"><h2 className="text-xl font-black">Student progress</h2><p className="mt-1 text-sm text-zinc-500">Best performance across assigned homework puzzles.</p></div>
        {!students.length ? <div className="p-10 text-center text-zinc-500">No students are available for this classroom.</div> : <div className="divide-y">{students.map(student => <article key={student._id} className="grid gap-5 p-6 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr] lg:items-center">
          <div><h3 className="font-black">{student.name}</h3><p className="text-xs text-zinc-500">{student.email}</p><p className="mt-2 text-xs font-bold text-zinc-600">{student.classrooms.map(room => room.name).join(", ")}</p></div>
          <div><div className="mb-2 flex justify-between text-xs font-bold"><span>Completion</span><span>{student.completedPuzzles}/{student.assignedPuzzles} ({student.completionRate}%)</span></div><Progress value={student.completionRate} color="bg-blue-500"/></div>
          <div><div className="mb-2 flex justify-between text-xs font-bold"><span>Accuracy</span><span>{student.averageAccuracy}%</span></div><Progress value={student.averageAccuracy}/><p className="mt-2 text-xs text-zinc-500">Avg. {student.averageTime}s • {student.totalMistakes} mistakes • {student.hintsUsed} hints</p></div>
          <div>{student.tacticalAreas.length ? <div className="space-y-2">{student.tacticalAreas.slice(0, 4).map(area => <div key={area.tag}><div className="mb-1 flex justify-between text-xs"><span className={area.accuracy < 70 ? "font-bold text-red-600" : "font-bold"}>{area.tag}</span><span>{area.accuracy}%</span></div><Progress value={area.accuracy} color={area.accuracy < 70 ? "bg-red-400" : "bg-amber-400"}/></div>)}</div> : <p className="text-xs text-zinc-400">No tactical data yet</p>}{student.weakAreas.length > 0 && <p className="mt-3 text-xs font-bold text-red-600">Needs practice: {student.weakAreas.join(", ")}</p>}</div>
        </article>)}</div>}
      </section>
    </>}
  </CoachSection>;
}
