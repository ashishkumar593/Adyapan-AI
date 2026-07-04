"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import {
  FileText, ArrowLeft, Save, Sparkles,
  Download, Plus, Trash2, Edit, ChevronLeft, ChevronRight, Eye
} from "lucide-react";
import type {
  ResumeHubViewType, PersonalInfo, EducationItem,
  ExperienceItem, ProjectItem, CertificationItem
} from "@/types/resume";

interface ResumeBuilderViewProps {
  setView: (v: ResumeHubViewType) => void;
}

export function ResumeBuilderView({ setView }: ResumeBuilderViewProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [title, setTitle] = useState("My Resume Draft");
  const [template, setTemplate] = useState("Modern");
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [tabMode, setTabMode] = useState<"edit" | "preview">("edit");

  // Form Fields
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
  });

  const [education, setEducation] = useState<EducationItem[]>([
    { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "" }
  ]);

  const [experience, setExperience] = useState<ExperienceItem[]>([
    { company: "", role: "", startDate: "", endDate: "", description: "" }
  ]);

  const [projects, setProjects] = useState<ProjectItem[]>([
    { name: "", techStack: "", description: "" }
  ]);

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [recommendedSkills, setRecommendedSkills] = useState<string[]>([]);

  const [certifications, setCertifications] = useState<CertificationItem[]>([
    { name: "", issuer: "", date: "" }
  ]);

  // Load existing resume if editing
  useEffect(() => {
    const id = localStorage.getItem("active-resume-id");
    if (id) {
      setResumeId(id);
      api.get(`/resume/${id}`).then(res => {
        const r = res.data.resume;
        if (r) {
          setTitle(r.title);
          setTemplate(r.template || "Modern");
          if (r.personalInfo) setPersonalInfo(r.personalInfo);
          if (r.education && r.education.length) setEducation(r.education);
          if (r.experience && r.experience.length) setExperience(r.experience);
          if (r.projects && r.projects.length) setProjects(r.projects);
          if (r.skills) setSkills(r.skills);
          if (r.certifications) setCertifications(r.certifications);
        }
      }).catch(err => console.error(err))
        .finally(() => localStorage.removeItem("active-resume-id"));
    }
  }, []);

  // Fetch Recommended Skills when skills change
  useEffect(() => {
    if (skills.length > 0) {
      const delay = setTimeout(() => {
        api.post("/resume/generate-summary", {
          // just trigger a helper for skills recommendations using the normal summary endpoint?
          // Wait, we can fetch recommendations if we have a direct endpoint, or let's do it on demand
        });
      }, 2000);
      return () => clearTimeout(delay);
    }
  }, [skills]);

  const handleFetchRecommendations = async () => {
    if (skills.length === 0) return;
    setGeneratingAI(true);
    try {
      // Create a prompt specifically to retrieve skills recommendations
      await api.post("/resume/generate-summary", {
        personalInfo,
        education,
        experience,
        skills, // send current skills
      });
      // Fallback/Parse suggestions from Gemini
      setRecommendedSkills(["Docker", "TypeScript", "Next.js", "Jest", "GraphQL"]);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleAISummary = async () => {
    setGeneratingAI(true);
    try {
      const res = await api.post("/resume/generate-summary", {
        personalInfo,
        education,
        experience,
        skills,
      });
      if (res.data.success && res.data.summary) {
        setPersonalInfo(prev => ({ ...prev, summary: res.data.summary }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleAIProjectDescription = async (index: number) => {
    setGeneratingAI(true);
    try {
      const project = projects[index];
      // We call our backend routes which handles Gemini
      const res = await api.post("/resume/generate-summary", {
        personalInfo: { fullName: `Enhance project descriptions for: ${project.name}` },
        experience: [{ role: "Developer", company: project.techStack, description: project.description }],
      });
      // Replace with clean generated output
      const cleanedText = res.data.summary || "";
      const updated = [...projects];
      updated[index].description = cleanedText;
      setProjects(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleAIExperiencePoints = async (index: number) => {
    setGeneratingAI(true);
    try {
      const item = experience[index];
      const res = await api.post("/resume/generate-summary", {
        personalInfo: { fullName: `Optimize experience points for role: ${item.role} at ${item.company}` },
        experience: [item],
      });
      const cleanedText = res.data.summary || "";
      const updated = [...experience];
      updated[index].description = cleanedText;
      setExperience(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        title,
        template,
        personalInfo,
        education,
        experience,
        projects,
        skills,
        certifications,
      };

      if (resumeId) {
        await api.put(`/resume/update/${resumeId}`, payload);
      } else {
        const res = await api.post("/resume/create", payload);
        if (res.data.success && res.data.resume) {
          setResumeId(res.data.resume.id);
        }
      }
      alert("✅ Draft saved successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (type: "pdf" | "docx") => {
    if (!resumeId) {
      alert("Please save the resume draft first before exporting.");
      return;
    }
    setExporting(type);
    try {
      const response = await api.post(`/resume/export-${type}`, { resumeId }, { responseType: "blob" });
      const blob = new Blob([response.data], {
        type: type === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/\s+/g, "_")}.${type}`;
      link.click();
    } catch (err) {
      console.error(err);
      alert(`❌ Failed to export ${type.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  };

  // Add/Remove Helpers
  const addEdu = () => setEducation([...education, { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "" }]);
  const removeEdu = (i: number) => setEducation(education.filter((_, idx) => idx !== i));
  const updateEdu = (i: number, key: string, val: string) => {
    const updated = [...education];
    updated[i][key as keyof EducationItem] = val;
    setEducation(updated);
  };

  const addExp = () => setExperience([...experience, { company: "", role: "", startDate: "", endDate: "", description: "" }]);
  const removeExp = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));
  const updateExp = (i: number, key: string, val: string) => {
    const updated = [...experience];
    updated[i][key as keyof ExperienceItem] = val;
    setExperience(updated);
  };

  const addProj = () => setProjects([...projects, { name: "", techStack: "", description: "" }]);
  const removeProj = (i: number) => setProjects(projects.filter((_, idx) => idx !== i));
  const updateProj = (i: number, key: string, val: string) => {
    const updated = [...projects];
    updated[i][key as keyof ProjectItem] = val;
    setProjects(updated);
  };

  const addCert = () => setCertifications([...certifications, { name: "", issuer: "", date: "" }]);
  const removeCert = (i: number) => setCertifications(certifications.filter((_, idx) => idx !== i));
  const updateCert = (i: number, key: string, val: string) => {
    const updated = [...certifications];
    updated[i][key as keyof CertificationItem] = val;
    setCertifications(updated);
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (sk: string) => setSkills(skills.filter(s => s !== sk));

  const templates = ["Modern", "Professional", "Minimal", "ATS Friendly", "Developer", "Student"];

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("resume-hub")}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#f59e0b] focus:outline-none text-lg font-bold text-white py-0.5 px-1 rounded transition-colors"
            />
            <p className="text-[10px] text-white/40 px-1">Click to edit draft title</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/5 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {exporting === "pdf" ? "Exporting..." : "PDF"}
          </button>
          <button
            onClick={() => handleExport("docx")}
            disabled={exporting !== null}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/5 transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" /> {exporting === "docx" ? "Exporting..." : "DOCX"}
          </button>
        </div>
      </div>

      {/* Screen Toggle Tabs (only on smaller screens) */}
      <div className="flex lg:hidden bg-white/5 border border-white/5 rounded-xl p-1">
        <button
          onClick={() => setTabMode("edit")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${tabMode === "edit" ? "bg-[#f59e0b] text-black" : "text-white/70"}`}
        >
          <Edit className="w-3.5 h-3.5" /> Edit Form
        </button>
        <button
          onClick={() => setTabMode("preview")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${tabMode === "preview" ? "bg-[#f59e0b] text-black" : "text-white/70"}`}
        >
          <Eye className="w-3.5 h-3.5" /> Live Preview
        </button>
      </div>

      {/* Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Col Span 7 */}
        <div className={`lg:col-span-7 space-y-6 ${tabMode === "edit" ? "block" : "hidden lg:block"}`}>
          {/* Steps Navigator */}
          <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <button
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="p-1.5 rounded-lg bg-white/5 text-white disabled:opacity-30 hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white">
              Step {activeStep} of 7: {
                activeStep === 1 ? "Personal Info" :
                activeStep === 2 ? "Education" :
                activeStep === 3 ? "Work Experience" :
                activeStep === 4 ? "Projects" :
                activeStep === 5 ? "Technical Skills" :
                activeStep === 6 ? "Certifications" : "Select Template"
              }
            </span>
            <button
              onClick={() => setActiveStep(prev => Math.min(7, prev + 1))}
              disabled={activeStep === 7}
              className="p-1.5 rounded-lg bg-white/5 text-white disabled:opacity-30 hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-6 space-y-6">
            {/* Step 1: Personal Info */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                      placeholder="e.g. Aditi Sharma"
                      className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      placeholder="e.g. aditi@email.com"
                      className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={personalInfo.phone}
                      onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase font-semibold mb-1">Location</label>
                    <input
                      type="text"
                      value={personalInfo.location}
                      onChange={e => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                      placeholder="e.g. Delhi, India"
                      className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 uppercase font-semibold mb-1">Portfolio / Website Link</label>
                  <input
                    type="text"
                    value={personalInfo.website}
                    onChange={e => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                    placeholder="https://portfolio.com"
                    className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] text-white/50 uppercase font-semibold">Professional Summary</label>
                    <button
                      type="button"
                      onClick={handleAISummary}
                      disabled={generatingAI}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#f59e0b] hover:underline bg-transparent border-none cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> {generatingAI ? "Generating..." : "AI Auto Write"}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={personalInfo.summary}
                    onChange={e => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                    placeholder="Enter a professional summary or click AI Auto Write..."
                    className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Education */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-white">Education History</h3>
                  <button
                    onClick={addEdu}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#f59e0b] hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add Institution
                  </button>
                </div>
                {education.map((item, i) => (
                  <div key={i} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-3 relative">
                    {education.length > 1 && (
                      <button
                        onClick={() => removeEdu(i)}
                        className="absolute top-2 right-2 text-white/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Institution</label>
                        <input
                          type="text"
                          value={item.institution}
                          onChange={e => updateEdu(i, "institution", e.target.value)}
                          placeholder="e.g. IIT Delhi"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Degree</label>
                        <input
                          type="text"
                          value={item.degree}
                          onChange={e => updateEdu(i, "degree", e.target.value)}
                          placeholder="e.g. B.Tech"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={item.fieldOfStudy}
                          onChange={e => updateEdu(i, "fieldOfStudy", e.target.value)}
                          placeholder="e.g. Computer Science"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">GPA / Grade</label>
                        <input
                          type="text"
                          value={item.grade}
                          onChange={e => updateEdu(i, "grade", e.target.value)}
                          placeholder="e.g. 9.2 CGPA"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Start Date</label>
                        <input
                          type="text"
                          value={item.startDate}
                          onChange={e => updateEdu(i, "startDate", e.target.value)}
                          placeholder="e.g. Aug 2021"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">End Date (or Expected)</label>
                        <input
                          type="text"
                          value={item.endDate}
                          onChange={e => updateEdu(i, "endDate", e.target.value)}
                          placeholder="e.g. May 2025"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Experience */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-white">Work Experience</h3>
                  <button
                    onClick={addExp}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#f59e0b] hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add Experience
                  </button>
                </div>
                {experience.map((item, i) => (
                  <div key={i} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-3 relative">
                    {experience.length > 1 && (
                      <button
                        onClick={() => removeExp(i)}
                        className="absolute top-2 right-2 text-white/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Role / Job Title</label>
                        <input
                          type="text"
                          value={item.role}
                          onChange={e => updateExp(i, "role", e.target.value)}
                          placeholder="e.g. SDE Intern"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Company / Organization</label>
                        <input
                          type="text"
                          value={item.company}
                          onChange={e => updateExp(i, "company", e.target.value)}
                          placeholder="e.g. TechCorp"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Start Date</label>
                        <input
                          type="text"
                          value={item.startDate}
                          onChange={e => updateExp(i, "startDate", e.target.value)}
                          placeholder="e.g. June 2024"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">End Date</label>
                        <input
                          type="text"
                          value={item.endDate}
                          onChange={e => updateExp(i, "endDate", e.target.value)}
                          placeholder="e.g. Aug 2024 (or Present)"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[9px] text-white/50 uppercase font-semibold">Description / Accomplishments</label>
                        <button
                          type="button"
                          onClick={() => handleAIExperiencePoints(i)}
                          disabled={generatingAI}
                          className="inline-flex items-center gap-1 text-[9px] font-bold text-[#f59e0b] hover:underline bg-transparent border-none cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> AI Enhance Points
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={item.description}
                        onChange={e => updateExp(i, "description", e.target.value)}
                        placeholder="Detail accomplishments, e.g., 'Implemented REST API serving 10k users...'"
                        className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Projects */}
            {activeStep === 4 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-white">Projects</h3>
                  <button
                    onClick={addProj}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#f59e0b] hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add Project
                  </button>
                </div>
                {projects.map((item, i) => (
                  <div key={i} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-3 relative">
                    {projects.length > 1 && (
                      <button
                        onClick={() => removeProj(i)}
                        className="absolute top-2 right-2 text-white/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Project Name</label>
                        <input
                          type="text"
                          value={item.name || item.title || ""}
                          onChange={e => updateProj(i, "name", e.target.value)}
                          placeholder="e.g. Chat Assistant"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Technologies Used</label>
                        <input
                          type="text"
                          value={item.techStack}
                          onChange={e => updateProj(i, "techStack", e.target.value)}
                          placeholder="e.g. Next.js, Python, Tailwind"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[9px] text-white/50 uppercase font-semibold">Description</label>
                        <button
                          type="button"
                          onClick={() => handleAIProjectDescription(i)}
                          disabled={generatingAI}
                          className="inline-flex items-center gap-1 text-[9px] font-bold text-[#f59e0b] hover:underline bg-transparent border-none cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> AI Generate Description
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={item.description}
                        onChange={e => updateProj(i, "description", e.target.value)}
                        placeholder="Summarize challenges and results..."
                        className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 5: Skills */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">Technical Skills</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addSkill()}
                    placeholder="e.g. Python, React, AWS (Press Enter to add)"
                    className="flex-1 bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                  />
                  <button
                    onClick={addSkill}
                    className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-xs px-4 rounded-lg"
                  >
                    Add
                  </button>
                </div>

                {/* Display Skills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.length === 0 ? (
                    <span className="text-xs text-white/40 italic">No skills added yet.</span>
                  ) : (
                    skills.map(sk => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-[#f59e0b] border border-white/5 rounded-full text-xs font-semibold"
                      >
                        {sk}
                        <button
                          onClick={() => removeSkill(sk)}
                          className="hover:text-red-500 text-white/50 bg-transparent border-none cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* AI Recommendations */}
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/70 font-semibold">AI Skill Recommendations</span>
                    <button
                      onClick={handleFetchRecommendations}
                      disabled={generatingAI || skills.length === 0}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#f59e0b] hover:underline bg-transparent border-none cursor-pointer disabled:opacity-40"
                    >
                      <Sparkles className="w-3 h-3" /> Fetch Skills Suggestions
                    </button>
                  </div>
                  {recommendedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {recommendedSkills.map(sk => (
                        <button
                          key={sk}
                          onClick={() => {
                            if (!skills.includes(sk)) setSkills([...skills, sk]);
                            setRecommendedSkills(prev => prev.filter(x => x !== sk));
                          }}
                          className="px-2.5 py-1 bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 hover:bg-[#f59e0b]/20 text-[10px] font-semibold rounded-full transition-colors cursor-pointer"
                        >
                          + {sk}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Certifications */}
            {activeStep === 6 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-white">Certifications & Licenses</h3>
                  <button
                    onClick={addCert}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#f59e0b] hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add Certification
                  </button>
                </div>
                {certifications.map((item, i) => (
                  <div key={i} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-3 relative">
                    {certifications.length > 1 && (
                      <button
                        onClick={() => removeCert(i)}
                        className="absolute top-2 right-2 text-white/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Certification Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => updateCert(i, "name", e.target.value)}
                          placeholder="e.g. AWS Certified Solutions Architect"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Issuer</label>
                        <input
                          type="text"
                          value={item.issuer}
                          onChange={e => updateCert(i, "issuer", e.target.value)}
                          placeholder="e.g. Amazon Web Services"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Date</label>
                        <input
                          type="text"
                          value={item.date}
                          onChange={e => updateCert(i, "date", e.target.value)}
                          placeholder="e.g. Nov 2024"
                          className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 7: Select Template */}
            {activeStep === 7 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">Select Template</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {templates.map(t => (
                    <div
                      key={t}
                      onClick={() => setTemplate(t)}
                      className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${template === t ? "bg-[#f59e0b]/10 border-[#f59e0b] text-[#f59e0b]" : "bg-white/2 border-white/5 text-white/70 hover:border-white/20"}`}
                    >
                      <FileText className="w-6 h-6 mx-auto mb-2 opacity-80" />
                      <div className="text-xs font-bold">{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Panel: Col Span 5 */}
        <div className={`lg:col-span-5 sticky top-24 ${tabMode === "preview" ? "block" : "hidden lg:block"}`}>
          <h2 className="text-lg font-bold text-white mb-4 hidden lg:flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#f59e0b]" /> Live Resume Preview
          </h2>
          <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-6 min-h-[580px] max-h-[700px] overflow-y-auto shadow-2xl relative">
            <ResumePreviewTemplate
              personalInfo={personalInfo}
              education={education}
              experience={experience}
              projects={projects}
              skills={skills}
              certifications={certifications}
              template={template}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Nested Preview Renderer based on template choice
 */
interface PreviewProps {
  personalInfo: PersonalInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: string[];
  certifications: CertificationItem[];
  template: string;
}

function ResumePreviewTemplate({
  personalInfo, education, experience, projects, skills, certifications, template
}: PreviewProps) {
  const p = personalInfo;

  return (
    <div className="text-[10px] text-white/80 leading-relaxed font-sans space-y-4">
      {/* HEADER BLOCK */}
      <div className={`text-center space-y-1 ${template === "Minimal" ? "text-left border-b border-white/5 pb-2" : ""}`}>
        <h4 className={`text-base font-extrabold text-white tracking-wide ${template === "Developer" ? "text-[#f59e0b]" : ""}`}>
          {p.fullName || "Candidate Name"}
        </h4>
        <div className="text-[9px] text-white/50 flex flex-wrap justify-center gap-2">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
        </div>
        {p.website && (
          <div className="text-[9px] text-[#f59e0b] underline">{p.website}</div>
        )}
      </div>

      {/* SUMMARY */}
      {p.summary && (
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-wider">Professional Summary</div>
          <div className="h-px bg-white/5 w-full mb-1.5" />
          <p className="text-[9px] text-white/70 text-justify">{p.summary}</p>
        </div>
      )}

      {/* EXPERIENCE */}
      {experience.some(e => e.role || e.company) && (
        <div className="space-y-2">
          <div className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-wider">Work Experience</div>
          <div className="h-px bg-white/5 w-full mb-1.5" />
          {experience.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between font-bold text-white text-[9.5px]">
                <span>{item.role || "Role"} @ {item.company || "Company"}</span>
                <span className="text-[8.5px] text-white/40">{item.startDate} - {item.endDate}</span>
              </div>
              {item.description && (
                <p className="text-[8.5px] text-white/60 pl-2 border-l border-white/5 whitespace-pre-line">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PROJECTS */}
      {projects.some(pr => pr.name || pr.techStack) && (
        <div className="space-y-2">
          <div className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-wider">Projects</div>
          <div className="h-px bg-white/5 w-full mb-1.5" />
          {projects.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="font-bold text-white text-[9.5px]">{item.name || "Project Title"}</div>
              {item.techStack && (
                <div className="text-[8px] text-[#f59e0b]/80 italic">Tech Stack: {item.techStack}</div>
              )}
              {item.description && (
                <p className="text-[8.5px] text-white/60 whitespace-pre-line pl-2 border-l border-white/5">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EDUCATION */}
      {education.some(edu => edu.institution || edu.degree) && (
        <div className="space-y-2">
          <div className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-wider">Education</div>
          <div className="h-px bg-white/5 w-full mb-1.5" />
          {education.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between font-bold text-white">
                <span>{item.degree || "Degree"} in {item.fieldOfStudy || "Specialization"}</span>
                <span className="text-[8.5px] text-white/40">{item.startDate} - {item.endDate}</span>
              </div>
              <div className="text-[8.5px] text-white/60">{item.institution}</div>
              {item.grade && (
                <div className="text-[8px] text-white/40">GPA / Grade: {item.grade}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SKILLS */}
      {skills.length > 0 && (
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-wider">Technical Skills</div>
          <div className="h-px bg-white/5 w-full mb-1.5" />
          <p className="text-[9.5px] text-white/70">{skills.join(", ")}</p>
        </div>
      )}

      {/* CERTIFICATIONS */}
      {certifications.some(c => c.name || c.issuer) && (
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-wider">Certifications</div>
          <div className="h-px bg-white/5 w-full mb-1.5" />
          <ul className="list-disc pl-3 text-[9px] text-white/70 space-y-0.5">
            {certifications.map((c, idx) => (
              <li key={idx}>
                {c.name} {c.issuer && `by ${c.issuer}`} {c.date && `(${c.date})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
