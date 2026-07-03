"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import NextImage from "next/image";
import {
  User, LogOut, Settings, CreditCard, TrendingUp, Award,
  BookOpen, Code2, Compass, FileText, Mic, Briefcase, UserCircle,
  Wand2, GraduationCap, LayoutDashboard, Sun, Moon, LineChart, Trophy,
  Upload, Download, Trash2, Search, Bell, Crown, ChevronDown,
  Phone, Mail, MapPin, Target, Globe, Edit3, Save, X,
  Zap, Star, BookMarked, BarChart3, ClipboardList,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { api } from "@/services/api";
import { clearAuthSession } from "@/hooks/useAuth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdyapanUser { name: string; email: string; role?: string; }

interface ProfileData {
  user: { id: string; name: string; email: string; role: string; };
  username?: string;
  phone?: string;
  location?: string;
  aboutMe?: string;
  college?: string;
  branch?: string;
  degree?: string;
  year?: string;
  graduationYear?: string;
  skills: string[];
  interestedDomains: string[];
  targetRole?: string;
  careerGoal?: string;
  careerObjective?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resumeUrl?: string;
  resumeName?: string;
}

const DOMAINS = [
  "Artificial Intelligence", "Machine Learning", "Data Science", "Cybersecurity",
  "Web Development", "Cloud Computing", "Digital Marketing", "UI/UX Design",
];

function calcCompletion(p: ProfileData | null): number {
  if (!p) return 0;
  const fields = [
    p.user?.name, p.user?.email, p.username, p.phone, p.location, p.aboutMe,
    p.college, p.branch, p.degree, p.graduationYear,
    p.skills?.length > 0 ? "y" : "", p.interestedDomains?.length > 0 ? "y" : "",
    p.targetRole, p.careerObjective, p.linkedin, p.github, p.resumeUrl,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999,
      background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", color:"#fff",
      padding:"12px 22px", borderRadius:12, boxShadow:"0 10px 25px rgba(0,0,0,0.35)",
      fontSize:"0.88rem", fontWeight:600 }}>
      {message}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ height:6, width:"100%", background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${value}%`, background:"var(--primary)", borderRadius:3, transition:"width 1s ease" }} />
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:16,
      padding:"1.4rem", marginBottom:"1.2rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1.1rem" }}>
        <span style={{ color:"var(--primary)" }}>{icon}</span>
        <h3 style={{ fontSize:"0.95rem", fontWeight:700, color:"var(--text-primary)", margin:0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom:"0.8rem" }}>
      <div style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--text-muted)", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</div>
      <div style={{ fontSize:"0.88rem", color: value ? "var(--text-primary)" : "var(--text-muted)", fontWeight: value ? 500 : 400 }}>
        {value || placeholder || "—"}
      </div>
    </div>
  );
}

type InputProps = { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string; };
function FormInput({ label, value, onChange, placeholder, type = "text", hint }: InputProps) {
  return (
    <div style={{ marginBottom:"0.9rem" }}>
      <label style={{ display:"block", fontSize:"0.76rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</label>
      {hint && <div style={{ fontSize:"0.71rem", color:"var(--text-muted)", marginBottom:4 }}>{hint}</div>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"0.58rem 0.85rem", background:"var(--bg-card)", border:"1px solid var(--border-color)",
          borderRadius:8, color:"var(--text-primary)", fontSize:"0.84rem", outline:"none", boxSizing:"border-box" as const }}
        onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={e => (e.currentTarget.style.borderColor = "var(--border-color)")} />
    </div>
  );
}

function FormTextarea({ label, value, onChange, placeholder, hint }: Omit<InputProps,"type">) {
  return (
    <div style={{ marginBottom:"0.9rem" }}>
      <label style={{ display:"block", fontSize:"0.76rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</label>
      {hint && <div style={{ fontSize:"0.71rem", color:"var(--text-muted)", marginBottom:4 }}>{hint}</div>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        style={{ width:"100%", padding:"0.58rem 0.85rem", background:"var(--bg-card)", border:"1px solid var(--border-color)",
          borderRadius:8, color:"var(--text-primary)", fontSize:"0.84rem", outline:"none", boxSizing:"border-box" as const, resize:"vertical" }}
        onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={e => (e.currentTarget.style.borderColor = "var(--border-color)")} />
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const sidebarItems = [
  { id:"profile", label:"My Profile", icon:<User size={18}/>, href:"/profile/user" },
  { id:"dashboard", label:"Dashboard", icon:<LayoutDashboard size={18}/>, href:"/dashboard/user" },
  { id:"learning", label:"Learning Hub", icon:<GraduationCap size={18}/>, submenu:[
    {label:"Study Assistant",href:"#"},{label:"Notes Generator",href:"#"},{label:"PPT Generator",href:"#"},
    {label:"Assignment Generator",href:"#"},{label:"MCQ Generator",href:"#"},{label:"PDF Summarizer",href:"#"},
  ]},
  { id:"coding", label:"Coding Hub", icon:<Code2 size={18}/>, submenu:[
    {label:"Coding Assistant",href:"#"},{label:"Code Generator",href:"#"},{label:"Code Debugger",href:"#"},
    {label:"DSA Practice",href:"#"},{label:"Coding Challenges",href:"#"},
  ]},
  { id:"career", label:"Career Hub", icon:<Compass size={18}/>, submenu:[
    {label:"Career Guide",href:"#"},{label:"Career Roadmap",href:"#"},{label:"Skill Gap Analysis",href:"#"},
  ]},
  { id:"resume", label:"Resume Hub", icon:<FileText size={18}/>, submenu:[
    {label:"Resume Builder",href:"#"},{label:"ATS Score Checker",href:"#"},{label:"Resume Analyzer",href:"#"},
  ]},
  { id:"interview", label:"Interview Hub", icon:<Mic size={18}/>, submenu:[
    {label:"AI HR Interview",href:"#"},{label:"AI Technical Interview",href:"#"},{label:"Mock Interviews",href:"#"},
  ]},
  { id:"internship", label:"Internship Hub", icon:<Briefcase size={18}/>, submenu:[
    {label:"Internship Finder",href:"#"},{label:"Recommendations",href:"#"},
  ]},
  { id:"job", label:"Job Hub", icon:<UserCircle size={18}/>, submenu:[
    {label:"Job Matching",href:"#"},{label:"Resume vs JD Match",href:"#"},
  ]},
  { id:"placement", label:"Placement Hub", icon:<Trophy size={18}/>, submenu:[
    {label:"Aptitude Practice",href:"#"},{label:"Logical Reasoning",href:"#"},{label:"Mock Tests",href:"#"},
  ]},
  { id:"productivity", label:"AI Productivity", icon:<Wand2 size={18}/>, submenu:[
    {label:"AI Chat Assistant",href:"#"},{label:"Email Writer",href:"#"},{label:"SOP Generator",href:"#"},
  ]},
  { id:"analytics", label:"Analytics", icon:<LineChart size={18}/>, submenu:[
    {label:"Learning Progress",href:"#"},{label:"Resume Score",href:"#"},{label:"Skill Growth",href:"#"},
  ]},
] as { id:string; label:string; icon:React.ReactNode; href?:string; submenu?:{label:string;href:string}[] }[];

function DashboardSidebar({ onComingSoon }: { onComingSoon: () => void }) {
  const [open, setOpen] = useState<string|null>(null);
  return (
    <aside className="dash-sidebar">
      {sidebarItems.map(item => {
        const isActive = item.id === "profile";
        const isOpen = open === item.id;
        if (!item.submenu) return (
          <Link key={item.id} href={item.href??""} style={{
            display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.55rem 0.5rem",
            borderRadius:12, marginBottom:2, textDecoration:"none", whiteSpace:"nowrap",
            color: isActive ? "var(--primary)" : "var(--text-secondary)",
            background: isActive ? "rgba(245,158,11,0.1)" : "transparent",
            border: isActive ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent",
            fontWeight:500, fontSize:"0.82rem",
          }}>
            <span style={{flexShrink:0}}>{item.icon}</span>
            <span className="sb-label">{item.label}</span>
          </Link>
        );
        return (
          <div key={item.id}>
            <button onClick={() => setOpen(p => p===item.id ? null : item.id)} style={{
              display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.55rem 0.5rem",
              borderRadius:12, marginBottom:2, color:"var(--text-secondary)", background:"transparent",
              border:"1px solid transparent", fontWeight:500, fontSize:"0.82rem",
              cursor:"pointer", width:"100%", whiteSpace:"nowrap",
            }}>
              <span style={{flexShrink:0}}>{item.icon}</span>
              <span className="sb-label" style={{flex:1,textAlign:"left"}}>{item.label}</span>
              <ChevronDown size={13} style={{transition:"transform 0.2s",transform:isOpen?"rotate(180deg)":"none"}} />
            </button>
            {isOpen && (
              <div style={{paddingLeft:"1.2rem"}}>
                {item.submenu?.map(sub => (
                  <a key={sub.label} href="#" onClick={e=>{e.preventDefault();onComingSoon();}} style={{
                    display:"block", padding:"0.28rem 0.5rem", fontSize:"0.76rem",
                    color:"var(--text-secondary)", borderRadius:8, marginBottom:1, textDecoration:"none",
                  }}>{sub.label}</a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

// ─── TopNav ───────────────────────────────────────────────────────────────────
function TopNav({ user, theme, onThemeToggle, onComingSoon }: {
  user: AdyapanUser|null; theme:string; onThemeToggle:()=>void; onComingSoon:()=>void;
}) {
  const isDark = theme==="dark";
  const navBg = isDark?"#060b0e":"#ffffff";
  const navBorder = isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.1)";
  const navBtnBg = isDark?"#0d151c":"rgba(0,0,0,0.04)";
  const navBtnColor = isDark?"#fff":"#0f172a";
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)??"U";
  return (
    <header style={{ position:"fixed", top:0, left:0, width:"100%", height:70, background:navBg,
      borderBottom:`1px solid ${navBorder}`, display:"flex", alignItems:"center",
      justifyContent:"space-between", padding:"0 1.5rem", zIndex:105, boxSizing:"border-box" }}>
      <div style={{display:"flex",alignItems:"center",gap:"1.5rem"}}>
        <Link href="/dashboard/user" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
          <NextImage src="/assets/logo.png" alt="Adyapan AI" width={30} height={30} style={{borderRadius:"50%"}} />
          <span style={{fontWeight:700,fontSize:"1.15rem",color:navBtnColor}}>Adyapan AI</span>
        </Link>
        <div style={{position:"relative"}}>
          <Search size={14} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}} />
          <input type="text" placeholder="Search tools..." style={{
            width:220, padding:"0.5rem 1rem 0.5rem 2rem", background:navBtnBg,
            border:`1px solid ${navBorder}`, borderRadius:8, color:navBtnColor, fontSize:"0.83rem", outline:"none" }} />
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"0.85rem"}}>
        <button onClick={onComingSoon} style={{ display:"inline-flex",alignItems:"center",gap:6,
          padding:"0.5rem 0.9rem", borderRadius:8, fontWeight:600, fontSize:"0.8rem", cursor:"pointer",
          border:`1px solid rgba(245,158,11,0.3)`, background:navBtnBg, color:"#f59e0b" }}>
          <Crown size={13}/> Premium
        </button>
        <button onClick={onThemeToggle} aria-label="Toggle theme" style={{
          background:navBtnBg, border:`1px solid ${navBorder}`, borderRadius:8,
          width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", color:"var(--text-secondary)" }}>
          {isDark ? <Sun size={15}/> : <Moon size={15}/>}
        </button>
        <div style={{position:"relative",cursor:"pointer"}}>
          <Bell size={19} style={{color:"var(--text-secondary)"}} />
          <span style={{ position:"absolute",top:-5,right:-6,background:"#ef4444",color:"#fff",
            fontSize:"0.6rem",fontWeight:800,width:14,height:14,borderRadius:"50%",
            display:"flex",alignItems:"center",justifyContent:"center" }}>2</span>
        </div>
        <div style={{ width:36,height:36,borderRadius:"50%",border:"2px solid var(--primary)",
          background:"rgba(245,158,11,0.1)",display:"flex",alignItems:"center",justifyContent:"center",
          cursor:"pointer",fontWeight:700,fontSize:"0.85rem",color:"var(--primary)" }}>
          {initials}
        </div>
      </div>
    </header>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserProfilePage() {
  useRequireAuth("USER");
  const [authUser, setAuthUser] = useState<AdyapanUser|null>(null);
  const [profile, setProfile] = useState<ProfileData|null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [toast, setToast] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [f, setF] = useState({
    username:"", phone:"", location:"", aboutMe:"",
    college:"", branch:"", degree:"", graduationYear:"",
    skills:"", interestedDomains:[] as string[],
    targetRole:"", careerObjective:"",
    linkedin:"", github:"", portfolio:"",
  });

  const setField = (key: keyof typeof f) => (val: string) => setF(p => ({...p, [key]:val}));

  const populate = (data: ProfileData) => {
    setF({
      username: data.username??"",
      phone: data.phone??"",
      location: data.location??"",
      aboutMe: data.aboutMe??"",
      college: data.college??"",
      branch: data.branch??"",
      degree: data.degree??"",
      graduationYear: data.graduationYear??"",
      skills: (data.skills??[]).join(", "),
      interestedDomains: data.interestedDomains??[],
      targetRole: data.targetRole??"",
      careerObjective: data.careerObjective??"",
      linkedin: data.linkedin??"",
      github: data.github??"",
      portfolio: data.portfolio??"",
    });
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/me");
      const data = res.data.profile as ProfileData;
      setProfile(data);
      populate(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    try { const r = localStorage.getItem("adyapan-user"); if(r) setAuthUser(JSON.parse(r)); } catch {}
    const t = localStorage.getItem("adyapan-theme")||"dark";
    setTheme(t); document.documentElement.setAttribute("data-theme", t);
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    const n = theme==="dark"?"light":"dark";
    setTheme(n); localStorage.setItem("adyapan-theme",n);
    document.documentElement.setAttribute("data-theme",n);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/profile/me", {
        ...f,
        skills: f.skills.split(",").map(s=>s.trim()).filter(Boolean),
      });
      setToast("✅ Profile updated successfully!");
      setEditMode(false);
      await fetchProfile();
    } catch { setToast("❌ Failed to save. Please try again."); }
    finally { setSaving(false); }
  };

  const handleResume = async (file: File) => {
    if (file.size > 5*1024*1024) { setToast("❌ Max file size is 5 MB."); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("resume", file);
      await api.post("/profile/upload-resume", fd, { headers:{"Content-Type":"multipart/form-data"} });
      setToast("✅ Resume uploaded!"); await fetchProfile();
    } catch { setToast("❌ Upload failed."); }
    finally { setUploading(false); }
  };

  const handleRemoveResume = async () => {
    try { await api.post("/profile/remove-resume"); setToast("🗑️ Resume removed."); await fetchProfile(); }
    catch { setToast("❌ Could not remove resume."); }
  };

  const completion = calcCompletion(profile);
  const displayName = profile?.user?.name ?? authUser?.name ?? "User";
  const initials = displayName.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0,2);
  const skills = profile?.skills??[];
  const domains = profile?.interestedDomains??[];

  const toggleDomain = (d: string) => setF(p => ({
    ...p,
    interestedDomains: p.interestedDomains.includes(d)
      ? p.interestedDomains.filter(x=>x!==d)
      : [...p.interestedDomains, d],
  }));

  const comingSoon = () => setToast("🚀 Coming Soon!");

  if (loading) return (
    <div style={{minHeight:"100vh",background:"var(--bg-dark)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-muted)"}}>
      Loading profile…
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"var(--bg-dark)",color:"var(--text-primary)"}}>
      <TopNav user={authUser} theme={theme} onThemeToggle={toggleTheme} onComingSoon={comingSoon} />
      <DashboardSidebar onComingSoon={comingSoon} />

      <main className="dash-main" style={{paddingTop:"1.5rem"}}>
        {/* Header bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem",flexWrap:"wrap",gap:"0.75rem"}}>
          <div>
            <p style={{fontSize:"0.78rem",color:"var(--primary)",fontWeight:600,marginBottom:2}}>USER PROFILE</p>
            <h1 style={{fontSize:"1.4rem",fontWeight:800,color:"var(--text-primary)",margin:0}}>{displayName}</h1>
          </div>
          <div style={{display:"flex",gap:"0.6rem"}}>
            {editMode ? (
              <>
                <button onClick={()=>setEditMode(false)} style={{
                  display:"inline-flex",alignItems:"center",gap:6,padding:"0.5rem 1rem",borderRadius:8,
                  fontSize:"0.82rem",fontWeight:600,cursor:"pointer",
                  background:"transparent",border:"1px solid var(--border-color)",color:"var(--text-secondary)" }}>
                  <X size={14}/> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  display:"inline-flex",alignItems:"center",gap:6,padding:"0.5rem 1rem",borderRadius:8,
                  fontSize:"0.82rem",fontWeight:700,cursor:"pointer",
                  background:"var(--primary)",border:"none",color:"#000",opacity:saving?0.65:1 }}>
                  <Save size={14}/> {saving?"Saving…":"Save Changes"}
                </button>
              </>
            ) : (
              <button onClick={()=>setEditMode(true)} style={{
                display:"inline-flex",alignItems:"center",gap:6,padding:"0.5rem 1rem",borderRadius:8,
                fontSize:"0.82rem",fontWeight:700,cursor:"pointer",
                background:"var(--primary)",border:"none",color:"#000" }}>
                <Edit3 size={14}/> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile card */}
        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"1.2rem",alignItems:"start"}} className="profile-grid">

          {/* LEFT COLUMN */}
          <div>
            {/* Avatar + completion */}
            <div style={{background:"var(--bg-card)",border:"1px solid var(--border-color)",borderRadius:16,padding:"1.5rem",marginBottom:"1rem",textAlign:"center"}}>
              <div style={{ width:80,height:80,borderRadius:"50%",border:"3px solid var(--primary)",
                background:"rgba(245,158,11,0.1)",display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:800,fontSize:"1.8rem",color:"var(--primary)",margin:"0 auto 0.85rem" }}>
                {initials}
              </div>
              <div style={{fontWeight:800,fontSize:"1.05rem",color:"var(--text-primary)",marginBottom:2}}>{displayName}</div>
              <div style={{fontSize:"0.78rem",color:"var(--text-muted)",marginBottom:"0.4rem"}}>{profile?.user?.email??authUser?.email}</div>
              {profile?.targetRole && <div style={{fontSize:"0.78rem",color:"var(--primary)",fontWeight:600,marginBottom:"1rem"}}>{profile.targetRole}</div>}
              <div style={{marginTop:"0.85rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.76rem",marginBottom:4}}>
                  <span style={{color:"var(--text-secondary)"}}>Profile Completion</span>
                  <span style={{color:"var(--primary)",fontWeight:700}}>{completion}%</span>
                </div>
                <ProgressBar value={completion} />
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{background:"var(--bg-card)",border:"1px solid var(--border-color)",borderRadius:16,padding:"1.1rem",marginBottom:"1rem"}}>
              <div style={{fontSize:"0.82rem",fontWeight:700,color:"var(--text-primary)",marginBottom:"0.75rem"}}>Quick Actions</div>
              {[
                { label:"Edit Profile", icon:<Edit3 size={13}/>, fn:()=>setEditMode(true) },
                { label:"Download Profile", icon:<Download size={13}/>, fn:comingSoon },
                { label:"View Activity", icon:<BarChart3 size={13}/>, fn:comingSoon },
                { label:"Add Portfolio Links", icon:<Globe size={13}/>, fn:()=>setEditMode(true) },
              ].map(a => (
                <button key={a.label} onClick={a.fn} style={{
                  display:"flex",alignItems:"center",gap:8,width:"100%",padding:"0.45rem 0.5rem",
                  borderRadius:8,background:"transparent",border:"none",color:"var(--text-secondary)",
                  fontSize:"0.81rem",cursor:"pointer",textAlign:"left",marginBottom:2 }}
                  onMouseEnter={e=>(e.currentTarget.style.color="var(--primary)")}
                  onMouseLeave={e=>(e.currentTarget.style.color="var(--text-secondary)")}>
                  <span style={{color:"var(--primary)"}}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>

            {/* Activity Overview */}
            <div style={{background:"var(--bg-card)",border:"1px solid var(--border-color)",borderRadius:16,padding:"1.1rem"}}>
              <div style={{fontSize:"0.82rem",fontWeight:700,color:"var(--text-primary)",marginBottom:"0.75rem"}}>Activity Overview</div>
              {[
                { label:"AI Agents Used", value:"0", icon:<Wand2 size={14}/>, color:"#8b5cf6" },
                { label:"Conversations", value:"0", icon:<BookMarked size={14}/>, color:"#3b82f6" },
                { label:"Projects Created", value:"0", icon:<ClipboardList size={14}/>, color:"#10b981" },
                { label:"Documents Generated", value:"0", icon:<FileText size={14}/>, color:"#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"0.4rem 0",borderBottom:"1px solid var(--border-color)",fontSize:"0.8rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,color:"var(--text-secondary)"}}>
                    <span style={{color:s.color}}>{s.icon}</span>{s.label}
                  </div>
                  <strong style={{color:"var(--text-primary)"}}>{s.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {!editMode ? (
              /* ── VIEW MODE ── */
              <>
                <SectionCard title="Personal Information" icon={<User size={16}/>}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1.5rem"}}>
                    <FieldRow label="Full Name" value={profile?.user?.name} placeholder="Not set" />
                    <FieldRow label="Username" value={profile?.username} placeholder="Not set" />
                    <FieldRow label="Email Address" value={profile?.user?.email} />
                    <FieldRow label="Phone Number" value={profile?.phone} placeholder="Not set" />
                    <FieldRow label="Location" value={profile?.location} placeholder="Not set" />
                  </div>
                  <FieldRow label="About Me" value={profile?.aboutMe} placeholder="Tell us about yourself..." />
                </SectionCard>

                <SectionCard title="Academic Information" icon={<GraduationCap size={16}/>}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1.5rem"}}>
                    <FieldRow label="College / University" value={profile?.college} placeholder="Not set" />
                    <FieldRow label="Degree & Branch" value={profile?.degree && profile?.branch ? `${profile.degree} – ${profile.branch}` : (profile?.branch||profile?.degree)} placeholder="Not set" />
                    <FieldRow label="Graduation Year" value={profile?.graduationYear} placeholder="Not set" />
                  </div>
                </SectionCard>

                <SectionCard title="Skills & Interests" icon={<Star size={16}/>}>
                  <div style={{marginBottom:"1rem"}}>
                    <div style={{fontSize:"0.72rem",fontWeight:600,color:"var(--text-muted)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Skills</div>
                    {skills.length ? (
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {skills.map(s=>(
                          <span key={s} style={{padding:"0.25rem 0.75rem",borderRadius:20,fontSize:"0.76rem",fontWeight:600,
                            background:"rgba(245,158,11,0.1)",color:"var(--primary)",border:"1px solid rgba(245,158,11,0.25)"}}>
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : <span style={{fontSize:"0.82rem",color:"var(--text-muted)"}}>No skills added yet</span>}
                  </div>
                  <div>
                    <div style={{fontSize:"0.72rem",fontWeight:600,color:"var(--text-muted)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Interested Domains</div>
                    {domains.length ? (
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {domains.map(d=>(
                          <span key={d} style={{padding:"0.25rem 0.75rem",borderRadius:20,fontSize:"0.76rem",fontWeight:600,
                            background:"rgba(59,130,246,0.1)",color:"#3b82f6",border:"1px solid rgba(59,130,246,0.25)"}}>
                            {d}
                          </span>
                        ))}
                      </div>
                    ) : <span style={{fontSize:"0.82rem",color:"var(--text-muted)"}}>No domains selected yet</span>}
                  </div>
                </SectionCard>

                <SectionCard title="Career Goals" icon={<Target size={16}/>}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1.5rem"}}>
                    <FieldRow label="Target Role" value={profile?.targetRole} placeholder="Not set" />
                  </div>
                  <FieldRow label="Career Objective" value={profile?.careerObjective} placeholder="Describe your professional goals..." />
                </SectionCard>

                <SectionCard title="Professional Links" icon={<Globe size={16}/>}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1.5rem"}}>
                    <div style={{marginBottom:"0.8rem"}}>
                      <div style={{fontSize:"0.72rem",fontWeight:600,color:"var(--text-muted)",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>LinkedIn Profile</div>
                      {profile?.linkedin
                        ? <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{color:"#3b82f6",fontSize:"0.85rem",wordBreak:"break-all"}}>{profile.linkedin}</a>
                        : <span style={{fontSize:"0.85rem",color:"var(--text-muted)"}}>Not set</span>}
                    </div>
                    <div style={{marginBottom:"0.8rem"}}>
                      <div style={{fontSize:"0.72rem",fontWeight:600,color:"var(--text-muted)",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>GitHub Profile</div>
                      {profile?.github
                        ? <a href={profile.github} target="_blank" rel="noreferrer" style={{color:"#3b82f6",fontSize:"0.85rem",wordBreak:"break-all"}}>{profile.github}</a>
                        : <span style={{fontSize:"0.85rem",color:"var(--text-muted)"}}>Not set</span>}
                    </div>
                    <div>
                      <div style={{fontSize:"0.72rem",fontWeight:600,color:"var(--text-muted)",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Portfolio Website</div>
                      {profile?.portfolio
                        ? <a href={profile.portfolio} target="_blank" rel="noreferrer" style={{color:"#3b82f6",fontSize:"0.85rem",wordBreak:"break-all"}}>{profile.portfolio}</a>
                        : <span style={{fontSize:"0.85rem",color:"var(--text-muted)"}}>Not set</span>}
                    </div>
                  </div>
                </SectionCard>

                {/* Resume */}
                <SectionCard title="Resume" icon={<FileText size={16}/>}>
                  {profile?.resumeUrl ? (
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.75rem"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <FileText size={20} color="var(--primary)" />
                        <div>
                          <div style={{fontSize:"0.85rem",fontWeight:600,color:"var(--text-primary)"}}>{profile.resumeName??"resume.pdf"}</div>
                          <div style={{fontSize:"0.74rem",color:"var(--text-muted)"}}>Uploaded</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:"0.5rem"}}>
                        <button onClick={()=>fileRef.current?.click()} style={{
                          display:"inline-flex",alignItems:"center",gap:5,padding:"0.4rem 0.8rem",borderRadius:8,
                          fontSize:"0.78rem",fontWeight:600,cursor:"pointer",
                          background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",color:"var(--primary)"}}>
                          <Upload size={13}/> Replace
                        </button>
                        <button onClick={handleRemoveResume} style={{
                          display:"inline-flex",alignItems:"center",gap:5,padding:"0.4rem 0.8rem",borderRadius:8,
                          fontSize:"0.78rem",fontWeight:600,cursor:"pointer",
                          background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444"}}>
                          <Trash2 size={13}/> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{textAlign:"center",padding:"1.5rem"}}>
                      <FileText size={32} color="var(--text-muted)" style={{marginBottom:8}} />
                      <div style={{fontSize:"0.84rem",color:"var(--text-muted)",marginBottom:"0.85rem"}}>No resume uploaded yet</div>
                      <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{
                        display:"inline-flex",alignItems:"center",gap:6,padding:"0.55rem 1.1rem",borderRadius:8,
                        fontSize:"0.84rem",fontWeight:700,cursor:"pointer",
                        background:"var(--primary)",border:"none",color:"#000",opacity:uploading?0.65:1}}>
                        <Upload size={14}/> {uploading?"Uploading…":"Upload Resume"}
                      </button>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{display:"none"}}
                    onChange={e=>{ if(e.target.files?.[0]) handleResume(e.target.files[0]); e.target.value=""; }} />
                </SectionCard>
              </>
            ) : (
              /* ── EDIT MODE ── */
              <>
                <SectionCard title="Personal Information" icon={<User size={16}/>}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
                    <FormInput label="Full Name" value={profile?.user?.name??""} onChange={()=>{}} hint="Your registered name — contact support to change" placeholder="Your name" />
                    <FormInput label="Username" value={f.username} onChange={setField("username")} hint="Your unique platform username" placeholder="e.g. john_doe" />
                    <FormInput label="Phone Number" value={f.phone} onChange={setField("phone")} type="tel" hint="For account verification and support" placeholder="9876543210" />
                    <FormInput label="Location" value={f.location} onChange={setField("location")} hint="City, State, Country" placeholder="Mumbai, Maharashtra, India" />
                  </div>
                  <FormTextarea label="About Me" value={f.aboutMe} onChange={setField("aboutMe")} hint="Tell us about yourself, your interests, and career aspirations" placeholder="I'm a passionate developer..." />
                </SectionCard>

                <SectionCard title="Academic Information" icon={<GraduationCap size={16}/>}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
                    <FormInput label="College / University" value={f.college} onChange={setField("college")} hint="Your current institution" placeholder="State University" />
                    <FormInput label="Degree" value={f.degree} onChange={setField("degree")} placeholder="B.Tech / BCA / MCA" />
                    <FormInput label="Branch / Specialization" value={f.branch} onChange={setField("branch")} placeholder="Computer Science Engineering" />
                    <FormInput label="Graduation Year" value={f.graduationYear} onChange={setField("graduationYear")} hint="Expected year of graduation" placeholder="2026" />
                  </div>
                </SectionCard>

                <SectionCard title="Skills & Interests" icon={<Star size={16}/>}>
                  <FormInput label="Skills" value={f.skills} onChange={setField("skills")} hint="Add comma-separated skills" placeholder="React, Python, Machine Learning, SQL" />
                  <div>
                    <label style={{display:"block",fontSize:"0.76rem",fontWeight:600,color:"var(--text-secondary)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.04em"}}>Interested Domains</label>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                      {DOMAINS.map(d => (
                        <button key={d} type="button" onClick={()=>toggleDomain(d)} style={{
                          padding:"0.3rem 0.85rem",borderRadius:20,fontSize:"0.78rem",fontWeight:600,cursor:"pointer",
                          border:"1px solid",transition:"all 0.15s",
                          borderColor: f.interestedDomains.includes(d) ? "rgba(245,158,11,0.4)" : "var(--border-color)",
                          background: f.interestedDomains.includes(d) ? "rgba(245,158,11,0.12)" : "transparent",
                          color: f.interestedDomains.includes(d) ? "var(--primary)" : "var(--text-secondary)",
                        }}>{d}</button>
                      ))}
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Career Goals" icon={<Target size={16}/>}>
                  <FormInput label="Target Role" value={f.targetRole} onChange={setField("targetRole")} hint="Your preferred job role or career path" placeholder="Full Stack Developer / Data Scientist" />
                  <FormTextarea label="Career Objective" value={f.careerObjective} onChange={setField("careerObjective")} hint="Describe your professional goals and aspirations" placeholder="I aim to build scalable AI-powered products..." />
                </SectionCard>

                <SectionCard title="Professional Links" icon={<Globe size={16}/>}>
                  <FormInput label="LinkedIn Profile" value={f.linkedin} onChange={setField("linkedin")} hint="Connect your professional network" placeholder="https://linkedin.com/in/username" />
                  <FormInput label="GitHub Profile" value={f.github} onChange={setField("github")} hint="Showcase your projects and code repositories" placeholder="https://github.com/username" />
                  <FormInput label="Portfolio Website" value={f.portfolio} onChange={setField("portfolio")} hint="Share your personal portfolio or work samples" placeholder="https://yourportfolio.com" />
                </SectionCard>
              </>
            )}
          </div>
        </div>
      </main>

      {toast && <Toast message={toast} onClose={()=>setToast("")} />}

      <style>{`
        @media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr !important; } }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
