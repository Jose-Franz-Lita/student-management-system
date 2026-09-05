import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Download,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  TrendingUp,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Page = "overview" | "students" | "attendance" | "grades";
type StudentStatus = "active" | "on-leave" | "inactive";

type Student = {
  id: number;
  studentNumber: string;
  name: string;
  email: string;
  program: string;
  year: string;
  status: StudentStatus;
  avatarColor: string;
  attendance: number;
  gpa: number;
  lastActivity: string;
};

const initialStudents: Student[] = [
  { id: 1, studentNumber: "STU-24018", name: "Maya Chen", email: "maya.chen@campusflow.edu", program: "Computer Science", year: "Year 3", status: "active", avatarColor: "#0f766e", attendance: 96, gpa: 3.82, lastActivity: "Today, 9:42 AM" },
  { id: 2, studentNumber: "STU-24027", name: "Ethan Williams", email: "ethan.williams@campusflow.edu", program: "Business Analytics", year: "Year 2", status: "active", avatarColor: "#2563eb", attendance: 91, gpa: 3.54, lastActivity: "Today, 8:15 AM" },
  { id: 3, studentNumber: "STU-24031", name: "Sofia Martinez", email: "sofia.martinez@campusflow.edu", program: "Design & Media", year: "Year 4", status: "active", avatarColor: "#db2777", attendance: 88, gpa: 3.68, lastActivity: "Yesterday, 3:28 PM" },
  { id: 4, studentNumber: "STU-24044", name: "Noah Patel", email: "noah.patel@campusflow.edu", program: "Computer Science", year: "Year 1", status: "on-leave", avatarColor: "#7c3aed", attendance: 79, gpa: 3.12, lastActivity: "Aug 28, 11:06 AM" },
  { id: 5, studentNumber: "STU-24052", name: "Amelia Johnson", email: "amelia.johnson@campusflow.edu", program: "Psychology", year: "Year 3", status: "active", avatarColor: "#ea580c", attendance: 94, gpa: 3.91, lastActivity: "Today, 10:04 AM" },
  { id: 6, studentNumber: "STU-24066", name: "Lucas Thompson", email: "lucas.thompson@campusflow.edu", program: "Engineering", year: "Year 2", status: "active", avatarColor: "#0891b2", attendance: 86, gpa: 3.27, lastActivity: "Yesterday, 1:12 PM" },
];

const weekAttendance = [
  { label: "Mon", value: 91 },
  { label: "Tue", value: 96 },
  { label: "Wed", value: 89 },
  { label: "Thu", value: 94 },
  { label: "Fri", value: 97 },
  { label: "Sat", value: 82 },
  { label: "Sun", value: 76 },
];

const gradeRows = [
  { subject: "Data Structures", code: "CS 301", average: 88, trend: "+4.2%", color: "#2563eb" },
  { subject: "Business Intelligence", code: "BA 205", average: 84, trend: "+2.8%", color: "#0f766e" },
  { subject: "Interaction Design", code: "DM 310", average: 92, trend: "+6.1%", color: "#db2777" },
  { subject: "Research Methods", code: "PSY 220", average: 81, trend: "-1.4%", color: "#f59e0b" },
];

const attendanceRows = [
  { id: 1, name: "Maya Chen", program: "Computer Science", time: "8:58 AM", status: "Present" },
  { id: 2, name: "Ethan Williams", program: "Business Analytics", time: "9:03 AM", status: "Late" },
  { id: 3, name: "Sofia Martinez", program: "Design & Media", time: "8:54 AM", status: "Present" },
  { id: 4, name: "Amelia Johnson", program: "Psychology", time: "9:01 AM", status: "Present" },
  { id: 5, name: "Lucas Thompson", program: "Engineering", time: "—", status: "Absent" },
];

const navItems: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "grades", label: "Grades & reports", icon: BarChart3 },
];

function initials(name: string) {
  return name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function StatusBadge({ status }: { status: StudentStatus }) {
  const labels: Record<StudentStatus, string> = { active: "Active", "on-leave": "On leave", inactive: "Inactive" };
  return <Badge className={`border-0 px-2.5 py-1 text-[11px] font-semibold ${status === "active" ? "bg-emerald-50 text-emerald-700" : status === "on-leave" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{labels[status]}</Badge>;
}

function AttendanceBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styles = normalized === "present" ? "bg-emerald-50 text-emerald-700" : normalized === "late" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700";
  return <Badge className={`border-0 px-2.5 py-1 text-[11px] font-semibold ${styles}`}>{status}</Badge>;
}

function Avatar({ student, size = "md" }: { student: Pick<Student, "name" | "avatarColor">; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-[10px]", md: "h-9 w-9 text-[11px]", lg: "h-11 w-11 text-xs" };
  return <div className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm`} style={{ backgroundColor: student.avatarColor }}>{initials(student.name)}</div>;
}

function StatCard({ label, value, note, trend, icon: Icon, tint }: { label: string; value: string; note: string; trend: string; icon: LucideIcon; tint: string }) {
  const positive = trend.startsWith("+");
  return <Card className="border-0 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}><Icon className="h-[18px] w-[18px]" /></div>
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{trend}
        </div>
      </div>
      <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
      <div className="mt-1 flex items-end gap-2"><p className="font-display text-[27px] font-extrabold tracking-[-0.04em] text-slate-900">{value}</p><p className="mb-1 text-xs text-slate-400">{note}</p></div>
    </CardContent>
  </Card>;
}

function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">{eyebrow}</p><h1 className="font-display mt-1 text-[28px] font-extrabold tracking-[-0.04em] text-slate-900">{title}</h1>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>
    {action}
  </div>;
}

function Sidebar({ activePage, setActivePage, onAdd }: { activePage: Page; setActivePage: (page: Page) => void; onAdd: () => void }) {
  return <aside className="hidden min-h-screen w-[252px] shrink-0 flex-col bg-[#101828] px-4 py-5 text-white md:flex">
    <div className="flex items-center gap-3 px-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2dd4bf] font-display text-lg font-extrabold text-[#0f2e3c]">C</div><div><p className="font-display text-[16px] font-extrabold tracking-[-0.03em]">CampusFlow</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Academic operations</p></div></div>
    <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Workspace</div>
    <nav className="mt-3 flex flex-col gap-1">
      {navItems.map(item => { const Icon = item.icon; const active = activePage === item.id; return <button key={item.id} onClick={() => setActivePage(item.id)} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-all ${active ? "bg-white text-slate-900 shadow-lg shadow-slate-950/20" : "text-slate-400 hover:bg-white/8 hover:text-white"}`}><Icon className={`h-[17px] w-[17px] ${active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-300"}`} /><span>{item.label}</span>{item.id === "students" && <span className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] ${active ? "bg-blue-50 text-blue-700" : "bg-white/8 text-slate-500"}`}>248</span>}</button>; })}
    </nav>
    <div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Manage</div>
    <nav className="mt-3 flex flex-col gap-1">
      <button onClick={() => toast.info("Classes view is coming next to CampusFlow.")} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-400 transition hover:bg-white/8 hover:text-white"><BookOpen className="h-[17px] w-[17px] text-slate-500" />Classes</button>
      <button onClick={() => toast.info("Settings are ready for your school policy configuration.")} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-400 transition hover:bg-white/8 hover:text-white"><Settings2 className="h-[17px] w-[17px] text-slate-500" />Settings</button>
    </nav>
    <div className="mt-auto rounded-2xl border border-white/8 bg-white/5 p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300 text-xs font-extrabold text-amber-950">AM</div><div className="min-w-0"><p className="truncate text-sm font-bold">Alex Morgan</p><p className="truncate text-[11px] text-slate-400">Administrator</p></div><ChevronDown className="ml-auto h-4 w-4 text-slate-500" /></div><div className="mt-4 border-t border-white/8 pt-3 text-[11px] leading-5 text-slate-400">Spring term · 2025–26</div></div>
  </aside>;
}

function MobileNav({ activePage, setActivePage }: { activePage: Page; setActivePage: (page: Page) => void }) {
  return <div className="sticky top-0 z-30 flex items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">{navItems.map(item => { const Icon = item.icon; const active = activePage === item.id; return <button key={item.id} onClick={() => setActivePage(item.id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}><Icon className="h-3.5 w-3.5" />{item.label}</button>; })}</div>;
}

function Topbar({ activePage, onAdd }: { activePage: Page; onAdd: () => void }) {
  const title = navItems.find(item => item.id === activePage)?.label ?? "Overview";
  return <header className="flex min-h-[82px] items-center justify-between border-b border-slate-200/80 bg-white px-5 py-4 md:px-9"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#101828] font-display text-lg font-extrabold text-[#2dd4bf] md:hidden">C</div><div><div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400"><span>CampusFlow</span><span>/</span><span className="text-slate-600">{title}</span></div><p className="mt-1 text-xs font-medium text-slate-500">Tuesday, September 5, 2026</p></div></div><div className="flex items-center gap-2 sm:gap-3"><button onClick={() => toast.info("No new notifications.")} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"><Bell className="h-[17px] w-[17px]" /><span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" /></button><Button onClick={onAdd} className="hidden h-10 rounded-xl bg-blue-600 px-4 text-xs font-bold shadow-lg shadow-blue-600/15 hover:bg-blue-700 sm:flex"><Plus className="mr-1.5 h-4 w-4" /> Add student</Button><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300 text-[11px] font-extrabold text-amber-950">AM</div></div></header>;
}

function Overview({ students, setActivePage }: { students: Student[]; setActivePage: (page: Page) => void }) {
  const activeCount = students.filter(student => student.status === "active").length;
  return <div className="space-y-7">
    <SectionHeading eyebrow="Good morning, Alex" title="Your campus at a glance" description="A focused view of what needs your attention today." action={<div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 sm:flex"><CalendarDays className="h-4 w-4 text-blue-600" /> Spring term · Week 6 <ChevronDown className="h-3.5 w-3.5" /></div>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total students" value={formatNumber(students.length === initialStudents.length ? 248 : students.length)} note="enrolled" trend="+8.4%" icon={Users} tint="bg-blue-50 text-blue-600" /><StatCard label="Average attendance" value="92.4%" note="this week" trend="+2.1%" icon={ClipboardCheck} tint="bg-emerald-50 text-emerald-600" /><StatCard label="Average GPA" value="3.46" note="out of 4.0" trend="+0.18" icon={TrendingUp} tint="bg-violet-50 text-violet-600" /><StatCard label="Needs attention" value="12" note="students" trend="-3" icon={Activity} tint="bg-amber-50 text-amber-600" /></div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <Card className="border-0 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]"><CardHeader className="flex-row items-start justify-between space-y-0 pb-1"><div><CardTitle className="font-display text-base font-extrabold tracking-[-0.02em]">Attendance pulse</CardTitle><p className="mt-1 text-xs text-slate-400">Average check-ins across all classes</p></div><button onClick={() => setActivePage("attendance")} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">View report <ArrowUpRight className="h-3.5 w-3.5" /></button></CardHeader><CardContent className="pt-6"><div className="flex h-[192px] items-end gap-2 sm:gap-4">{weekAttendance.map((day, index) => <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="flex w-full flex-1 items-end justify-center"><div className={`w-full max-w-[40px] rounded-t-lg transition-all ${index === 4 ? "bg-blue-600" : "bg-blue-100"}`} style={{ height: `${day.value * 1.48}px` }} /></div><span className={`text-[11px] font-semibold ${index === 4 ? "text-blue-600" : "text-slate-400"}`}>{day.label}</span></div>)}</div><div className="mt-4 flex items-center gap-5 border-t border-slate-100 pt-4 text-[11px] font-semibold text-slate-500"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-600" />Today</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-100" />Previous days</span><span className="ml-auto font-bold text-slate-900">92.4% avg.</span></div></CardContent></Card>
      <Card className="border-0 bg-[#101828] text-white shadow-[0_4px_24px_rgba(15,23,42,0.1)]"><CardHeader className="pb-1"><div className="flex items-center justify-between"><CardTitle className="font-display text-base font-extrabold tracking-[-0.02em]">Today’s focus</CardTitle><span className="rounded-full bg-amber-300 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-950">4 items</span></div><p className="mt-1 text-xs text-slate-400">Keep your campus moving forward.</p></CardHeader><CardContent className="pt-5"><div className="space-y-3">{[{ icon: UserPlus, label: "Review 3 new enrollments", time: "Due today", color: "text-blue-300" }, { icon: Clock3, label: "Approve attendance edits", time: "2 pending", color: "text-amber-300" }, { icon: BarChart3, label: "Publish midterm report", time: "Due Fri", color: "text-teal-300" }].map(item => <button key={item.label} onClick={() => toast.success(`${item.label} opened`)} className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/5 p-3 text-left transition hover:bg-white/10"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8"><item.icon className={`h-4 w-4 ${item.color}`} /></div><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-200">{item.label}</span><span className="mt-0.5 block text-[10px] text-slate-500">{item.time}</span></span><ArrowUpRight className="h-3.5 w-3.5 text-slate-500" /></button>)}</div><button onClick={() => toast.info("All tasks are up to date.")} className="mt-5 flex items-center gap-1 text-xs font-bold text-teal-300 hover:text-teal-200">View all tasks <ArrowUpRight className="h-3.5 w-3.5" /></button></CardContent></Card>
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <Card className="border-0 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="font-display text-base font-extrabold tracking-[-0.02em]">Recent student activity</CardTitle><p className="mt-1 text-xs text-slate-400">Latest updates from your directory</p></div><button onClick={() => setActivePage("students")} className="text-xs font-bold text-blue-600 hover:text-blue-700">Open directory</button></CardHeader><CardContent className="pt-1"><div className="divide-y divide-slate-100">{students.slice(0, 4).map(student => <div key={student.id} className="flex items-center gap-3 py-3"><Avatar student={student} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{student.name}</p><p className="mt-0.5 truncate text-xs text-slate-400">{student.program} · {student.lastActivity}</p></div><StatusBadge status={student.status} /></div>)}</div></CardContent></Card>
      <Card className="border-0 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]"><CardHeader className="pb-1"><CardTitle className="font-display text-base font-extrabold tracking-[-0.02em]">Students at risk</CardTitle><p className="mt-1 text-xs text-slate-400">Attendance below 85%</p></CardHeader><CardContent className="pt-4"><div className="space-y-3">{students.filter(student => student.attendance < 90).slice(0, 3).map(student => <div key={student.id} className="flex items-center gap-3"><Avatar student={student} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{student.name}</p><p className="text-[11px] text-slate-400">{student.program}</p></div><span className="text-xs font-extrabold text-rose-600">{student.attendance}%</span></div>)}</div><button onClick={() => setActivePage("attendance")} className="mt-5 flex items-center gap-1 text-xs font-bold text-blue-600">Review attendance <ArrowUpRight className="h-3.5 w-3.5" /></button></CardContent></Card>
    </div>
  </div>;
}

function StudentsPage({ students, setStudents, onAdd }: { students: Student[]; setStudents: React.Dispatch<React.SetStateAction<Student[]>>; onAdd: () => void }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = useMemo(() => students.filter(student => { const matchesQuery = `${student.name} ${student.studentNumber} ${student.program}`.toLowerCase().includes(query.toLowerCase()); const matchesStatus = statusFilter === "all" || student.status === statusFilter; return matchesQuery && matchesStatus; }), [students, query, statusFilter]);
  const removeMutation = trpc.students.remove.useMutation();
  const removeStudent = (student: Student) => { setStudents(current => current.filter(item => item.id !== student.id)); removeMutation.mutate({ id: student.id }, { onError: () => undefined }); toast.success(`${student.name} removed from the local view.`); };
  return <div className="space-y-6"><SectionHeading eyebrow="Directory" title="Students" description="Manage enrollment, profiles, and academic standing." action={<div className="flex gap-2"><Button onClick={() => toast.info("CSV export is prepared for the next release.")} variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-3 text-xs font-bold"><Download className="mr-1.5 h-4 w-4" /> Export</Button><Button onClick={onAdd} className="h-10 rounded-xl bg-blue-600 px-3 text-xs font-bold hover:bg-blue-700"><Plus className="mr-1.5 h-4 w-4" /> Add student</Button></div>} /><Card className="border-0 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]"><CardContent className="p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full lg:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name, ID, or program" className="h-10 rounded-xl border-slate-200 pl-9 text-xs shadow-none focus-visible:ring-blue-500" /></div><div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-slate-400" /><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500"><option value="all">All statuses</option><option value="active">Active</option><option value="on-leave">On leave</option><option value="inactive">Inactive</option></select><span className="hidden text-xs font-medium text-slate-400 sm:block">{filtered.length} of {students.length} students</span></div></div></CardContent></Card><Card className="overflow-hidden border-0 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="border-b border-slate-100 bg-slate-50/70"><tr className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400"><th className="px-5 py-3.5">Student</th><th className="px-4 py-3.5">Program</th><th className="px-4 py-3.5">Year</th><th className="px-4 py-3.5">Attendance</th><th className="px-4 py-3.5">GPA</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(student => <tr key={student.id} className="group transition hover:bg-slate-50/60"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><Avatar student={student} /><div><p className="text-sm font-bold text-slate-800">{student.name}</p><p className="mt-0.5 text-[11px] text-slate-400">{student.studentNumber}</p></div></div></td><td className="px-4 py-3.5 text-xs font-semibold text-slate-600">{student.program}</td><td className="px-4 py-3.5 text-xs text-slate-500">{student.year}</td><td className="px-4 py-3.5"><span className={`text-xs font-extrabold ${student.attendance < 85 ? "text-rose-600" : "text-slate-700"}`}>{student.attendance}%</span></td><td className="px-4 py-3.5 text-xs font-extrabold text-slate-700">{student.gpa.toFixed(2)}</td><td className="px-4 py-3.5"><StatusBadge status={student.status} /></td><td className="px-4 py-3.5 text-right"><div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100"><button onClick={() => toast.info(`${student.name}'s profile is ready for editing.`)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" aria-label={`Edit ${student.name}`}><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => removeStudent(student)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${student.name}`}><X className="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody></table></div>{filtered.length === 0 && <div className="px-6 py-12 text-center"><Users className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">No students found</p><p className="mt-1 text-xs text-slate-400">Try a different search or filter.</p></div>}</Card></div>;
}

function AttendancePage({ students }: { students: Student[] }) {
  const [rows, setRows] = useState(attendanceRows);
  const [selectedDay, setSelectedDay] = useState("Today");
  return <div className="space-y-6"><SectionHeading eyebrow="Daily operations" title="Attendance" description="Track check-ins, spot patterns, and follow up early." action={<div className="flex gap-2"><Button onClick={() => toast.success("Attendance report downloaded.")} variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-3 text-xs font-bold"><Download className="mr-1.5 h-4 w-4" /> Report</Button><Button onClick={() => toast.success("Attendance session started for today.")} className="h-10 rounded-xl bg-blue-600 px-3 text-xs font-bold hover:bg-blue-700"><ClipboardCheck className="mr-1.5 h-4 w-4" /> Take attendance</Button></div>} /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Present today" value="218" note={`of ${formatNumber(students.length === initialStudents.length ? 248 : students.length)}`} trend="+3.2%" icon={Check} tint="bg-emerald-50 text-emerald-600" /><StatCard label="Late arrivals" value="14" note="today" trend="-8.1%" icon={Clock3} tint="bg-amber-50 text-amber-600" /><StatCard label="Absent" value="16" note="needs follow-up" trend="-4.0%" icon={X} tint="bg-rose-50 text-rose-600" /></div><div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]"><Card className="border-0 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="font-display text-base font-extrabold">Daily check-ins</CardTitle><p className="mt-1 text-xs text-slate-400">{selectedDay} · September 5, 2026</p></div><div className="flex gap-1 rounded-xl bg-slate-100 p-1">{["Mon", "Tue", "Wed", "Thu", "Today"].map(day => <button key={day} onClick={() => setSelectedDay(day)} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${selectedDay === day ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>{day}</button>)}</div></CardHeader><CardContent className="pt-2"><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead className="border-b border-slate-100"><tr className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400"><th className="py-3">Student</th><th className="py-3">Program</th><th className="py-3">Check-in</th><th className="py-3">Status</th><th className="py-3 text-right">Change</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(row => { const student = students.find(item => item.id === row.id) ?? students[0]; return <tr key={row.id}><td className="py-3"><div className="flex items-center gap-2.5"><Avatar student={student} size="sm" /><span className="text-xs font-bold text-slate-800">{row.name}</span></div></td><td className="py-3 text-[11px] text-slate-500">{row.program}</td><td className="py-3 text-[11px] font-semibold text-slate-500">{row.time}</td><td className="py-3"><AttendanceBadge status={row.status} /></td><td className="py-3 text-right"><button onClick={() => setRows(current => current.map(item => item.id === row.id ? { ...item, status: item.status === "Present" ? "Absent" : "Present", time: item.status === "Present" ? "—" : "9:00 AM" } : item))} className="text-[11px] font-bold text-blue-600 hover:text-blue-700">Toggle</button></td></tr>; })}</tbody></table></div></CardContent></Card><Card className="border-0 bg-[#101828] text-white shadow-[0_4px_24px_rgba(15,23,42,0.1)]"><CardHeader><CardTitle className="font-display text-base font-extrabold">Attendance insights</CardTitle><p className="mt-1 text-xs text-slate-400">Small signals, early action.</p></CardHeader><CardContent><div className="space-y-5"><div><div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-300">On-time arrival</span><span className="font-extrabold text-teal-300">94%</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-teal-400" style={{ width: "94%" }} /></div></div><div><div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-300">Weekly consistency</span><span className="font-extrabold text-blue-300">88%</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-blue-400" style={{ width: "88%" }} /></div></div><div className="rounded-xl border border-amber-300/15 bg-amber-300/10 p-3"><p className="text-xs font-bold text-amber-200">12 students need a check-in</p><p className="mt-1 text-[11px] leading-4 text-slate-400">Their attendance dropped below 85% this month.</p></div><button onClick={() => toast.success("Follow-up list copied to clipboard.")} className="flex items-center gap-1 text-xs font-bold text-teal-300">Create follow-up list <ArrowUpRight className="h-3.5 w-3.5" /></button></div></CardContent></Card></div></div>;
}

function GradesPage({ students }: { students: Student[] }) {
  return <div className="space-y-6"><SectionHeading eyebrow="Academic performance" title="Grades & reports" description="See performance by subject and identify where support matters most." action={<div className="flex gap-2"><Button onClick={() => toast.info("Grade import is available in the next release.")} variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-3 text-xs font-bold"><Download className="mr-1.5 h-4 w-4" /> Import grades</Button><Button onClick={() => toast.success("Midterm report generated.")} className="h-10 rounded-xl bg-blue-600 px-3 text-xs font-bold hover:bg-blue-700"><BarChart3 className="mr-1.5 h-4 w-4" /> Generate report</Button></div>} /><div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><Card className="border-0 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="font-display text-base font-extrabold">Subject performance</CardTitle><p className="mt-1 text-xs text-slate-400">Average scores · Midterm 1</p></div><button onClick={() => toast.info("Subject filters are ready for your next report.")} className="flex items-center gap-1 text-xs font-bold text-slate-500"><SlidersHorizontal className="h-3.5 w-3.5" /> Filter</button></CardHeader><CardContent className="space-y-5 pt-4">{gradeRows.map(row => <div key={row.code}><div className="mb-2 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-extrabold text-white" style={{ backgroundColor: row.color }}>{row.code.split(" ")[0]}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{row.subject}</p><p className="text-[10px] text-slate-400">{row.code}</p></div><span className="text-xs font-extrabold text-slate-800">{row.average}%</span><span className={`w-12 text-right text-[10px] font-bold ${row.trend.startsWith("+") ? "text-emerald-600" : "text-rose-600"}`}>{row.trend}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full" style={{ width: `${row.average}%`, backgroundColor: row.color }} /></div></div>)}</CardContent></Card><Card className="border-0 bg-[#101828] text-white shadow-[0_4px_24px_rgba(15,23,42,0.1)]"><CardHeader><CardTitle className="font-display text-base font-extrabold">Academic snapshot</CardTitle><p className="mt-1 text-xs text-slate-400">Compared with last term.</p></CardHeader><CardContent><div className="grid grid-cols-2 gap-3">{[{ value: "3.46", label: "Average GPA", color: "text-teal-300" }, { value: "87%", label: "Pass rate", color: "text-blue-300" }, { value: "42", label: "Honor roll", color: "text-amber-300" }, { value: "8", label: "At risk", color: "text-rose-300" }].map(item => <div key={item.label} className="rounded-xl border border-white/8 bg-white/5 p-3"><p className={`font-display text-2xl font-extrabold tracking-[-0.04em] ${item.color}`}>{item.value}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{item.label}</p></div>)}</div><div className="mt-5 flex items-center gap-2 rounded-xl bg-teal-400/10 p-3"><TrendingUp className="h-4 w-4 text-teal-300" /><p className="text-[11px] font-semibold leading-4 text-slate-300">Overall performance is <span className="text-teal-300">trending up</span> by 4.8%.</p></div></CardContent></Card></div><Card className="border-0 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="font-display text-base font-extrabold">Students to follow up</CardTitle><p className="mt-1 text-xs text-slate-400">Performance or attendance needs attention</p></div><button onClick={() => toast.info("Full interventions report opened.")} className="text-xs font-bold text-blue-600">View all</button></CardHeader><CardContent className="pt-1"><div className="grid gap-2 md:grid-cols-2">{students.filter(student => student.gpa < 3.4 || student.attendance < 90).slice(0, 4).map(student => <div key={student.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><Avatar student={student} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{student.name}</p><p className="mt-0.5 text-[10px] text-slate-400">GPA {student.gpa.toFixed(2)} · Attendance {student.attendance}%</p></div><button onClick={() => toast.success(`Follow-up noted for ${student.name}.`)} className="rounded-lg bg-blue-50 px-2 py-1.5 text-[10px] font-bold text-blue-700">Follow up</button></div>)}</div></CardContent></Card></div>;
}

function AddStudentDialog({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (open: boolean) => void; onAdd: (student: Student) => void }) {
  const createMutation = trpc.students.create.useMutation();
  const [form, setForm] = useState({ name: "", studentNumber: "", email: "", program: "", year: "Year 1" });
  const submit = (event: FormEvent) => { event.preventDefault(); if (!form.name || !form.studentNumber || !form.email || !form.program) { toast.error("Please complete all required fields."); return; } const newStudent: Student = { id: Date.now(), ...form, status: "active", avatarColor: "#2563eb", attendance: 100, gpa: 0, lastActivity: "Just now" }; createMutation.mutate({ ...form, status: "active", avatarColor: "#2563eb" }, { onError: () => undefined }); onAdd(newStudent); setForm({ name: "", studentNumber: "", email: "", program: "", year: "Year 1" }); onOpenChange(false); toast.success(`${newStudent.name} added to the directory.`); };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-lg rounded-2xl border-0 p-0 shadow-2xl"><form onSubmit={submit}><DialogHeader className="border-b border-slate-100 px-6 py-5"><DialogTitle className="font-display text-xl font-extrabold tracking-[-0.03em]">Add a new student</DialogTitle><DialogDescription className="text-xs text-slate-500">Create a profile for the student directory and academic records.</DialogDescription></DialogHeader><div className="grid gap-4 px-6 py-5 sm:grid-cols-2"><label className="space-y-1.5 sm:col-span-2"><span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Full name *</span><Input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Jordan Lee" className="h-10 rounded-xl border-slate-200 text-sm" /></label><label className="space-y-1.5"><span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Student ID *</span><Input value={form.studentNumber} onChange={event => setForm({ ...form, studentNumber: event.target.value })} placeholder="STU-24072" className="h-10 rounded-xl border-slate-200 text-sm" /></label><label className="space-y-1.5"><span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Year</span><select value={form.year} onChange={event => setForm({ ...form, year: event.target.value })} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-500"><option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option></select></label><label className="space-y-1.5 sm:col-span-2"><span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Email address *</span><Input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="student@campusflow.edu" className="h-10 rounded-xl border-slate-200 text-sm" /></label><label className="space-y-1.5 sm:col-span-2"><span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Program *</span><Input value={form.program} onChange={event => setForm({ ...form, program: event.target.value })} placeholder="e.g. Computer Science" className="h-10 rounded-xl border-slate-200 text-sm" /></label></div><DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-6 py-4"><Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold">Cancel</Button><Button type="submit" className="h-10 rounded-xl bg-blue-600 text-xs font-bold hover:bg-blue-700">Add student</Button></DialogFooter></form></DialogContent></Dialog>;
}

export default function Home() {
  const { data: liveStudents = [] } = trpc.students.list.useQuery();
  const [activePage, setActivePage] = useState<Page>("overview");
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (liveStudents.length > 0) {
      setStudents(liveStudents.map(student => ({ ...student, attendance: 92, gpa: 3.4, lastActivity: "Recently added" })));
    }
  }, [liveStudents]);

  return <div className="min-h-screen bg-[#f7f8fb] text-slate-900"><div className="flex min-h-screen"><Sidebar activePage={activePage} setActivePage={setActivePage} onAdd={() => setAddOpen(true)} /><div className="min-w-0 flex-1"><MobileNav activePage={activePage} setActivePage={setActivePage} /><Topbar activePage={activePage} onAdd={() => setAddOpen(true)} /><main className="mx-auto max-w-[1440px] px-5 py-7 md:px-9 md:py-9">{activePage === "overview" && <Overview students={students} setActivePage={setActivePage} />}{activePage === "students" && <StudentsPage students={students} setStudents={setStudents} onAdd={() => setAddOpen(true)} />}{activePage === "attendance" && <AttendancePage students={students} />}{activePage === "grades" && <GradesPage students={students} />}</main></div></div><AddStudentDialog open={addOpen} onOpenChange={setAddOpen} onAdd={student => setStudents(current => [student, ...current])} /></div>;
}
