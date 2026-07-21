// ═══════════════════════════════════════════════════════════════════════════════
// Shared Configuration — single source of truth for all resume-hub dropdowns
// Backend API overrides these defaults when available.
// ═══════════════════════════════════════════════════════════════════════════════

export const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Uber", "Tesla",
  "Spotify", "Adobe", "Stripe", "LinkedIn", "Nvidia", "Salesforce", "Oracle",
  "IBM", "Cisco", "Morgan Stanley", "Goldman Sachs", "Deloitte", "Accenture",
  "TCS", "Infosys", "Wipro", "Samsung", "Atlassian", "Palantir", "Databricks",
  "Snowflake", "Cloudflare", "Other",
];

export const PROFESSIONS = [
  "Software Engineer", "ML Engineer", "Data Scientist", "Full Stack Developer",
  "Frontend Developer", "Backend Developer", "DevOps Engineer", "Cloud Engineer",
  "AI Engineer", "Product Manager", "UI/UX Designer", "Data Analyst", "SDE",
  "SRE", "Systems Engineer", "Research Scientist", "Mobile Developer",
  "Cybersecurity Engineer", "QA Engineer", "Other",
];

export const CAREER_LEVELS = [
  "Fresher", "Junior (1-2 yrs)", "Mid-Level (3-5 yrs)",
  "Senior (6-8 yrs)", "Lead (8+ yrs)",
];

export const RESUME_STYLES = [
  "ATS Modern", "ATS Professional", "ATS Minimal", "ATS Developer", "ATS Student",
];

export const CHAT_SUGGESTIONS = [
  "Optimize for Amazon", "Reduce to one page", "Improve summary",
  "Improve project descriptions", "Add stronger action verbs", "Rewrite achievements",
];

export const COVER_LETTER_MODES = [
  "Software Engineer", "Machine Learning Engineer", "Data Scientist",
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "DevOps Engineer", "Cloud Engineer", "AI Engineer", "Product Manager",
  "Data Analyst", "UX Designer", "Mobile Developer", "Cybersecurity Analyst",
];

export const COVER_LETTER_TONES = [
  "Professional", "Friendly", "Formal", "Confident",
  "Creative", "Enthusiastic", "Humble", "Bold",
];

export const COVER_LETTER_LENGTHS = ["Short", "Standard", "Detailed"];

export const COVER_LETTER_TYPES = [
  "Full-Time", "Internship", "Referral", "Career Switch", "General Application",
];

export const ATS_ROLES = [
  "General ATS", "Software Engineer", "Data Analyst", "Data Scientist",
  "Backend Developer", "Frontend Developer", "Full Stack Developer", "AI Engineer",
];

export const ATS_ROLE_ICONS: Record<string, string> = {
  "General ATS": "\u{1F3AF}",
  "Software Engineer": "\u{1F4BB}",
  "Data Analyst": "\u{1F4CA}",
  "Data Scientist": "\u{1F9E0}",
  "Backend Developer": "\u{2699}\u{FE0F}",
  "Frontend Developer": "\u{1F3A8}",
  "Full Stack Developer": "\u{1F680}",
  "AI Engineer": "\u{1F916}",
};

export const CAREER_TARGET_ROLES = [
  "Software Engineer", "Backend Developer", "Frontend Developer",
  "Full Stack Developer", "AI Engineer", "Machine Learning Engineer",
  "Data Scientist", "Data Analyst", "Cloud Engineer", "DevOps Engineer",
  "QA Engineer", "Cybersecurity Engineer", "Custom Goal",
];

export const CAREER_TIMELINES = [
  "30 Days", "60 Days", "90 Days", "6 Months", "12 Months", "Custom",
];
