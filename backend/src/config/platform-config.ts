// ═══════════════════════════════════════════════════════════════════════════════
// Platform Configuration — single source of truth for dropdowns & options
// Admin-managed via DB (config_values table) or environment defaults.
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlatformConfig {
  companies: string[];
  professions: string[];
  careerLevels: string[];
  resumeStyles: string[];
  chatSuggestions: string[];
  coverLetterModes: string[];
  coverLetterTones: string[];
  coverLetterLengths: string[];
  coverLetterTypes: string[];
  atsRoles: string[];
  atsRoleIcons: Record<string, string>;
  careerTargetRoles: string[];
  careerTimelines: string[];
}

const DEFAULT_CONFIG: PlatformConfig = {
  companies: [
    "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Uber", "Tesla",
    "Spotify", "Adobe", "Stripe", "LinkedIn", "Nvidia", "Salesforce", "Oracle",
    "IBM", "Cisco", "Morgan Stanley", "Goldman Sachs", "Deloitte", "Accenture",
    "TCS", "Infosys", "Wipro", "Samsung", "Atlassian", "Palantir", "Databricks",
    "Snowflake", "Cloudflare", "Other",
  ],
  professions: [
    "Software Engineer", "ML Engineer", "Data Scientist", "Full Stack Developer",
    "Frontend Developer", "Backend Developer", "DevOps Engineer", "Cloud Engineer",
    "AI Engineer", "Product Manager", "UI/UX Designer", "Data Analyst", "SDE",
    "SRE", "Systems Engineer", "Research Scientist", "Mobile Developer",
    "Cybersecurity Engineer", "QA Engineer", "Other",
  ],
  careerLevels: [
    "Fresher", "Junior (1-2 yrs)", "Mid-Level (3-5 yrs)",
    "Senior (6-8 yrs)", "Lead (8+ yrs)",
  ],
  resumeStyles: [
    "ATS Modern", "ATS Professional", "ATS Minimal", "ATS Developer", "ATS Student",
  ],
  chatSuggestions: [
    "Optimize for Amazon", "Reduce to one page", "Improve summary",
    "Improve project descriptions", "Add stronger action verbs", "Rewrite achievements",
  ],
  coverLetterModes: [
    "Software Engineer", "Machine Learning Engineer", "Data Scientist",
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "DevOps Engineer", "Cloud Engineer", "AI Engineer", "Product Manager",
    "Data Analyst", "UX Designer", "Mobile Developer", "Cybersecurity Analyst",
  ],
  coverLetterTones: [
    "Professional", "Friendly", "Formal", "Confident",
    "Creative", "Enthusiastic", "Humble", "Bold",
  ],
  coverLetterLengths: ["Short", "Standard", "Detailed"],
  coverLetterTypes: [
    "Full-Time", "Internship", "Referral", "Career Switch", "General Application",
  ],
  atsRoles: [
    "General ATS", "Software Engineer", "Data Analyst", "Data Scientist",
    "Backend Developer", "Frontend Developer", "Full Stack Developer", "AI Engineer",
  ],
  atsRoleIcons: {
    "General ATS": "\u{1F3AF}",
    "Software Engineer": "\u{1F4BB}",
    "Data Analyst": "\u{1F4CA}",
    "Data Scientist": "\u{1F9E0}",
    "Backend Developer": "\u{2699}\u{FE0F}",
    "Frontend Developer": "\u{1F3A8}",
    "Full Stack Developer": "\u{1F680}",
    "AI Engineer": "\u{1F916}",
  },
  careerTargetRoles: [
    "Software Engineer", "Backend Developer", "Frontend Developer",
    "Full Stack Developer", "AI Engineer", "Machine Learning Engineer",
    "Data Scientist", "Data Analyst", "Cloud Engineer", "DevOps Engineer",
    "QA Engineer", "Cybersecurity Engineer", "Custom Goal",
  ],
  careerTimelines: [
    "30 Days", "60 Days", "90 Days", "6 Months", "12 Months", "Custom",
  ],
};

let cachedConfig: PlatformConfig | null = null;

export function getPlatformConfig(): PlatformConfig {
  if (!cachedConfig) {
    cachedConfig = { ...DEFAULT_CONFIG };
  }
  return cachedConfig;
}

export function updatePlatformConfig(partial: Partial<PlatformConfig>): PlatformConfig {
  const current = getPlatformConfig();
  cachedConfig = { ...current, ...partial };
  return cachedConfig;
}
