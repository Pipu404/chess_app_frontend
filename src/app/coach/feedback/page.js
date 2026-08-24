"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MessageSquareText, Send } from "lucide-react";
import CoachSection from "@/components/CoachSection";
import { getJson, postJson } from "@/lib/api";

const FOCUS_AREAS = ["General", "Fork", "Pin", "Skewer", "Mate", "Endgame", "Discovery", "Deflection"];

export default function CoachFeedbackPage() {
  const [classrooms, setClassrooms] = useState([]); const [items, setItems] = useState([]); const [form, setForm] = useState({ studentId: "", focusArea: "General", message: "" }); const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [sending, setSending] = useState(false);
  useEffect(() => { Promise.all([getJson("/api/classrooms/coach"), getJson("/api/feedback/coach")]).then(([roomData, feedbackData]) => { setClassrooms(roomData.classrooms); setItems(feedbackData.feedback); }).catch(requestError => setError(requestError.message)); }, []);
  const students = [...new Map(classrooms.flatMap(room => room.students.map(student => [student._id, { ...student, classroom: room.name }]))).values()];
  const submit = async event => {
    event.preventDefault(); setSending(true); setError(""); setSuccess("");
    try { const response = await postJson("/api/feedback/coach", form); setItems(current => [response.feedback, ...current]); setForm(current => ({ ...current, message: "" })); setSuccess("Feedback sent successfully."); }
    catch (requestError) { setError(requestError.message); } finally { setSending(false); }
  };
  return <CoachSection title="Student Feedback" description="Send private, personalized guidance to students enrolled in your classrooms.">
    <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><form onSubmit={submit} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><MessageSquareText/><h2 className="text-xl font-black">New feedback</h2></div>
      <div><label className="text-xs font-bold">Student</label><select required value={form.studentId} onChange={event => setForm({ ...form, studentId: event.target.value })} className="mt-1 w-full rounded-xl border p-3"><option value="">Select a student</option>{students.map(student => <option key={student._id} value={student._id}>{student.name} — {student.classroom}</option>)}</select></div>
      <div><label className="text-xs font-bold">Focus area</label><select value={form.focusArea} onChange={event => setForm({ ...form, focusArea: event.target.value })} className="mt-1 w-full rounded-xl border p-3">{FOCUS_AREAS.map(area => <option key={area}>{area}</option>)}</select></div>
      <div><label className="text-xs font-bold">Coaching message</label><textarea required maxLength={1500} rows={7} placeholder="Explain what the student did well and what to practice next…" value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} className="mt-1 w-full rounded-xl border p-3"/></div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{success && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700"><CheckCircle2 size={17}/>{success}</p>}
      <button disabled={sending || !students.length} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 p-3 font-bold text-white disabled:opacity-40"><Send size={18}/>{sending ? "Sending…" : "Send feedback"}</button>{!students.length && <p className="text-center text-xs text-zinc-500">Add students to a classroom before sending feedback.</p>}
    </form>
    <section className="rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Sent feedback</h2><div className="mt-5 space-y-3">{items.map(item => <article key={item._id} className="rounded-2xl bg-zinc-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black">{item.studentId?.name}</p><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${item.readAt ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.readAt ? "Read" : "Unread"}</span></div><p className="mt-1 text-xs font-bold text-amber-700">{item.focusArea}</p><p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{item.message}</p><time className="mt-3 block text-xs text-zinc-400">{new Date(item.createdAt).toLocaleString()}</time></article>)}{!items.length && <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-zinc-500">No feedback sent yet.</p>}</div></section></div>
  </CoachSection>;
}
