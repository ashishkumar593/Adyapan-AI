"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/services/api";
import {
  COMPANIES, PROFESSIONS, CAREER_LEVELS, RESUME_STYLES, CHAT_SUGGESTIONS,
  COVER_LETTER_MODES, COVER_LETTER_TONES, COVER_LETTER_LENGTHS, COVER_LETTER_TYPES,
  ATS_ROLES, ATS_ROLE_ICONS, CAREER_TARGET_ROLES, CAREER_TIMELINES,
} from "@/config/resume-config";

interface PlatformConfig {
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

const DEFAULTS: PlatformConfig = {
  companies: COMPANIES,
  professions: PROFESSIONS,
  careerLevels: CAREER_LEVELS,
  resumeStyles: RESUME_STYLES,
  chatSuggestions: CHAT_SUGGESTIONS,
  coverLetterModes: COVER_LETTER_MODES,
  coverLetterTones: COVER_LETTER_TONES,
  coverLetterLengths: COVER_LETTER_LENGTHS,
  coverLetterTypes: COVER_LETTER_TYPES,
  atsRoles: ATS_ROLES,
  atsRoleIcons: ATS_ROLE_ICONS,
  careerTargetRoles: CAREER_TARGET_ROLES,
  careerTimelines: CAREER_TIMELINES,
};

let sharedConfig: PlatformConfig = { ...DEFAULTS };
let fetchPromise: Promise<PlatformConfig> | null = null;

async function fetchConfig(): Promise<PlatformConfig> {
  try {
    const res = await api.get("/config");
    if (res.data?.success && res.data?.config) {
      sharedConfig = { ...DEFAULTS, ...res.data.config };
    }
  } catch {
    // API unavailable — use static defaults
  }
  return sharedConfig;
}

export function useConfig(): PlatformConfig {
  const [config, setConfig] = useState<PlatformConfig>(sharedConfig);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!fetchPromise) {
      fetchPromise = fetchConfig();
    }
    fetchPromise.then((c) => {
      if (mountedRef.current) setConfig(c);
    });
    return () => { mountedRef.current = false; };
  }, []);

  return config;
}
