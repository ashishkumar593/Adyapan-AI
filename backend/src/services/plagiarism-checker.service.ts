import { generateText, generateJSON, MODELS } from "../lib/ai/openrouter";

// ============================================================================
// TYPES
// ============================================================================

export interface PlagiarismConfig {
  text: string;
  title?: string;
  checkAI?: boolean;
  checkSimilarity?: boolean;
  checkCitations?: boolean;
  checkWritingQuality?: boolean;
}

export interface SectionAnalysis {
  id: string;
  title: string;
  text: string;
  aiProbability: number;
  similarityScore: number;
  highlights: HighlightSpan[];
  matches: SimilarityMatch[];
  citations: CitationIssue[];
  writingIssues: WritingIssue[];
}

export interface HighlightSpan {
  start: number;
  end: number;
  type: "ai" | "high-similarity" | "moderate-similarity" | "citation" | "quality";
  confidence: number;
  source?: string;
}

export interface SimilarityMatch {
  id: string;
  sourceTitle: string;
  sourceAuthors: string[];
  sourceYear: number;
  sourceUrl: string;
  source: string;
  similarityPercent: number;
  matchedParagraphs: string[];
  matchedText: string;
}

export interface CitationIssue {
  type: "missing" | "invalid" | "uncited-quote" | "format-error" | "orphan";
  severity: "high" | "medium" | "low";
  message: string;
  context?: string;
  suggestion?: string;
}

export interface WritingIssue {
  type: "grammar" | "readability" | "passive-voice" | "repetition" | "clarity" | "academic-tone" | "conciseness";
  severity: "high" | "medium" | "low";
  message: string;
  context?: string;
  suggestion?: string;
}

export interface AIDetectionResult {
  probability: number;
  confidence: "high" | "medium" | "low";
  label: string;
  indicators: {
    perplexity: number;
    burstiness: number;
    sentenceDiversity: number;
    vocabularyVariation: number;
    repetition: number;
    syntaxConsistency: number;
  };
}

export interface SimilarityResult {
  overallScore: number;
  internetPercent: number;
  researchPapersPercent: number;
  internalPercent: number;
  matches: SimilarityMatch[];
  totalSourcesChecked: number;
}

export interface CitationResult {
  overallScore: number;
  totalReferences: number;
  validReferences: number;
  missingCitations: number;
  formatIssues: number;
  issues: CitationIssue[];
}

export interface WritingQualityResult {
  overallScore: number;
  label: string;
  grammarScore: number;
  readabilityScore: number;
  academicToneScore: number;
  passiveVoiceCount: number;
  repetitionScore: number;
  clarityScore: number;
  concisenessScore: number;
  issues: WritingIssue[];
}

export interface PlagiarismReport {
  title: string;
  originalityScore: number;
  similarityScore: number;
  aiDetection: AIDetectionResult;
  similarity: SimilarityResult;
  citations: CitationResult;
  writingQuality: WritingQualityResult;
  sections: SectionAnalysis[];
  highlights: HighlightSpan[];
  recommendations: string[];
  wordCount: number;
  charCount: number;
  generatedAt: string;
}

// ============================================================================
// TEXT ANALYSIS UTILITIES
// ============================================================================

function splitIntoSections(text: string): Array<{ id: string; title: string; text: string }> {
  const sectionRegex = /^(#{1,3}\s+.+|(?:ABSTRACT|INTRODUCTION|RELATED\s+WORK|METHODOLOGY|METHOD|EXPERIMENTS?|RESULTS?|DISCUSSION|CONCLUSION|CONCLUSIONS?|REFERENCES?|BIBLIOGRAPHY|ACKNOWLEDGMENTS?|ABSTRACT|1\.?\s+.+|2\.?\s+.+|3\.?\s+.+|4\.?\s+.+|5\.?\s+.+|6\.?\s+.+|I\.?\s+.+|II\.?\s+.+|III\.?\s+.+|IV\.?\s+.+|V\.?\s+.+|VI\.?\s+.+))\s*$/gim;

  const sections: Array<{ id: string; title: string; text: string }> = [];
  const lines = text.split("\n");
  let currentTitle = "Preamble";
  let currentText: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (sectionRegex.test(trimmed) && trimmed.length < 100) {
      if (currentText.length > 0 || sections.length === 0) {
        sections.push({
          id: `section-${sections.length}`,
          title: currentTitle,
          text: currentText.join("\n").trim(),
        });
      }
      currentTitle = trimmed.replace(/^#+\s*/, "").replace(/^\d+\.?\s*/, "").trim();
      currentText = [];
    } else {
      currentText.push(line);
    }
  }

  if (currentText.length > 0) {
    sections.push({
      id: `section-${sections.length}`,
      title: currentTitle,
      text: currentText.join("\n").trim(),
    });
  }

  if (sections.length === 0) {
    sections.push({ id: "section-0", title: "Full Document", text });
  }

  return sections.filter(s => s.text.length > 10);
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function extractSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 5);
}

function extractReferences(text: string): string[] {
  const refSection = text.match(/(?:REFERENCES|BIBLIOGRAPHY|Works Cited)[\s\S]*$/i);
  if (!refSection) return [];
  const lines = refSection[0].split("\n").slice(1);
  return lines
    .join("\n")
    .split(/\n\s*\n/)
    .filter(r => r.trim().length > 10)
    .map(r => r.trim());
}

function extractInTextCitations(text: string): string[] {
  const patterns = [
    /\[(\d+(?:,\s*\d+)*)\]/g,
    /\(([A-Z][a-z]+(?:\s+(?:et\s+al\.?|&\s+[A-Z][a-z]+))?),?\s*\d{4}(?:,\s*p\.?\s*\d+)?\)/g,
    /\(([A-Z][a-z]+(?:\s+(?:et\s+al\.?|&\s+[A-Z][a-z]+))?),?\s*\d{4}\)/g,
  ];
  const citations: string[] = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      citations.push(match[0]);
    }
  }
  return citations;
}

// ============================================================================
// TEXT STATISTICS (Non-AI, pure math)
// ============================================================================

function calculatePerplexity(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 10) return 50;

  const freq = new Map<string, number>();
  for (const w of words) {
    const lower = w.toLowerCase();
    freq.set(lower, (freq.get(lower) || 0) + 1);
  }

  let entropy = 0;
  for (const [, count] of freq) {
    const p = count / words.length;
    entropy -= p * Math.log2(p);
  }

  const uniqueRatio = freq.size / words.length;
  const avgWordLen = words.reduce((sum, w) => sum + w.length, 0) / words.length;

  return Math.min(100, Math.round(
    (entropy * 15) +
    (uniqueRatio * 30) +
    (Math.min(avgWordLen, 10) * 3)
  ));
}

function calculateBurstiness(text: string): number {
  const sentences = extractSentences(text);
  if (sentences.length < 5) return 50;

  const lengths = sentences.map(s => s.split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
  const cv = Math.sqrt(variance) / mean;

  return Math.min(100, Math.round(cv * 100));
}

function calculateSentenceDiversity(text: string): number {
  const sentences = extractSentences(text);
  if (sentences.length < 5) return 50;

  const starters = sentences.map(s => {
    const words = s.split(/\s+/).slice(0, 3).join(" ").toLowerCase();
    return words;
  });

  const uniqueStarters = new Set(starters);
  const diversity = uniqueStarters.size / starters.length;

  return Math.min(100, Math.round(diversity * 100));
}

function calculateVocabularyVariation(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (words.length < 20) return 50;

  const uniqueWords = new Set(words);
  const ttr = uniqueWords.size / words.length;

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);

  const hapaxLegomena = Array.from(freq.values()).filter(c => c === 1).length;
  const hapaxRatio = hapaxLegomena / uniqueWords.size;

  return Math.min(100, Math.round((ttr * 60) + (hapaxRatio * 40)));
}

function calculateRepetition(text: string): number {
  const sentences = extractSentences(text);
  if (sentences.length < 5) return 0;

  const ngrams = new Map<string, number>();
  for (const sentence of sentences) {
    const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    for (let i = 0; i < words.length - 2; i++) {
      const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      ngrams.set(trigram, (ngrams.get(trigram) || 0) + 1);
    }
  }

  const repeated = Array.from(ngrams.values()).filter(c => c > 1).length;
  const total = ngrams.size || 1;

  return Math.min(100, Math.round((repeated / total) * 200));
}

function calculateSyntaxConsistency(text: string): number {
  const sentences = extractSentences(text);
  if (sentences.length < 5) return 70;

  const patterns = sentences.map(s => {
    const words = s.split(/\s+/);
    if (words.length === 0) return "";
    const firstWord = words[0].toLowerCase();
    if (["the", "a", "an", "this", "these", "those"].includes(firstWord)) return "det-noun";
    if (["we", "they", "i", "you", "he", "she", "it"].includes(firstWord)) return "pronoun";
    if (["in", "on", "at", "by", "for", "with", "from", "to", "of"].includes(firstWord)) return "preposition";
    if (/^\d+$/.test(firstWord)) return "number";
    if (firstWord.endsWith("ing")) return "gerund";
    if (firstWord.endsWith("ed")) return "past";
    return "other";
  });

  const freq = new Map<string, number>();
  for (const p of patterns) freq.set(p, (freq.get(p) || 0) + 1);

  const maxFreq = Math.max(...freq.values());
  const consistency = maxFreq / patterns.length;

  return Math.min(100, Math.round(consistency * 100));
}

// ============================================================================
// AI DETECTION (Statistical analysis + AI-assisted)
// ============================================================================

export async function detectAIContent(text: string): Promise<AIDetectionResult> {
  const indicators = {
    perplexity: calculatePerplexity(text),
    burstiness: calculateBurstiness(text),
    sentenceDiversity: calculateSentenceDiversity(text),
    vocabularyVariation: calculateVocabularyVariation(text),
    repetition: calculateRepetition(text),
    syntaxConsistency: calculateSyntaxConsistency(text),
  };

  const statisticalScore = Math.round(
    (100 - indicators.burstiness) * 0.25 +
    (100 - indicators.sentenceDiversity) * 0.20 +
    (100 - indicators.vocabularyVariation) * 0.15 +
    indicators.repetition * 0.15 +
    indicators.syntaxConsistency * 0.10 +
    (100 - indicators.perplexity) * 0.15
  );

  let aiProbability = Math.min(95, Math.max(5, statisticalScore));

  try {
    const sampleText = text.slice(0, 1500);
    const aiAnalysis = await generateJSON<{
      probability: number;
      confidence: string;
      reasons: string[];
    }>(
      "You are an AI text detection expert. Analyze writing patterns to determine if text is AI-generated or human-written. Look for: uniform sentence structure, lack of personal voice, overly formal phrasing, perfect grammar without natural errors, generic transitions, absence of domain-specific jargon errors.",
      `Analyze this text for AI-generation probability:\n"""\n${sampleText}\n"""\nReturn JSON: { "probability": number 0-100, "confidence": "high"|"medium"|"low", "reasons": ["reason1", "reason2"] }`,
      { model: MODELS.FAST, responseFormat: { type: "json_object" }, temperature: 0.3 },
      { probability: statisticalScore, confidence: "medium", reasons: [] }
    );

    aiProbability = Math.round((statisticalScore * 0.4) + (aiAnalysis.probability * 0.6));
  } catch {
    // Use statistical score alone
  }

  const confidence: "high" | "medium" | "low" =
    Math.abs(aiProbability - 50) > 30 ? "high" :
    Math.abs(aiProbability - 50) > 15 ? "medium" : "low";

  const label = aiProbability < 30 ? "Likely Human Written" :
    aiProbability < 50 ? "Possibly AI-Assisted" :
    aiProbability < 70 ? "Likely AI-Generated" : "Strongly AI-Generated";

  return { probability: aiProbability, confidence, label, indicators };
}

// ============================================================================
// SIMILARITY DETECTION (Academic database search)
// ============================================================================

async function searchSimilarSources(query: string, limit: number = 5): Promise<SimilarityMatch[]> {
  const matches: SimilarityMatch[] = [];

  const searches = [
    { name: "arXiv", fn: searchArxivForSimilarity },
    { name: "Semantic Scholar", fn: searchSemanticScholarForSimilarity },
    { name: "Crossref", fn: searchCrossrefForSimilarity },
  ];

  const results = await Promise.allSettled(
    searches.map(s => s.fn(query, limit))
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      matches.push(...result.value);
    }
  }

  matches.sort((a, b) => b.similarityPercent - a.similarityPercent);
  return matches.slice(0, 20);
}

async function searchArxivForSimilarity(query: string, limit: number): Promise<SimilarityMatch[]> {
  try {
    const keywords = query.split(/\s+/).slice(0, 8).join(" ");
    const encoded = encodeURIComponent(keywords);
    const url = `http://export.arxiv.org/api/query?search_query=all:${encoded}&start=0&max_results=${limit}&sortBy=relevance`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const text = await res.text();
    const entries: SimilarityMatch[] = [];
    const blocks = text.split("<entry>").slice(1);

    for (const block of blocks) {
      const title = (block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").replace(/\s+/g, " ").trim();
      const id = (block.match(/<id>(.*?)<\/id>/)?.[1] || "").trim();
      const authors = [...block.matchAll(/<name>(.*?)<\/name>/g)].map(m => m[1].trim());
      const published = (block.match(/<published>(.*?)<\/published>/)?.[1] || "").slice(0, 4);

      if (title) {
        entries.push({
          id: `arxiv-${entries.length}`,
          sourceTitle: title,
          sourceAuthors: authors.slice(0, 4),
          sourceYear: parseInt(published) || new Date().getFullYear(),
          sourceUrl: id,
          source: "arXiv",
          similarityPercent: 0,
          matchedParagraphs: [],
          matchedText: "",
        });
      }
    }
    return entries;
  } catch { return []; }
}

async function searchSemanticScholarForSimilarity(query: string, limit: number): Promise<SimilarityMatch[]> {
  try {
    const keywords = query.split(/\s+/).slice(0, 6).join(" ");
    const encoded = encodeURIComponent(keywords);
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encoded}&limit=${limit}&fields=title,authors,year,url,abstract`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const data = await res.json() as any;
    return (data.data || []).map((p: any, i: number) => ({
      id: `ss-${i}`,
      sourceTitle: p.title || "",
      sourceAuthors: (p.authors || []).map((a: any) => a.name).slice(0, 4),
      sourceYear: p.year || new Date().getFullYear(),
      sourceUrl: p.url || "",
      source: "Semantic Scholar",
      similarityPercent: 0,
      matchedParagraphs: [],
      matchedText: "",
    }));
  } catch { return []; }
}

async function searchCrossrefForSimilarity(query: string, limit: number): Promise<SimilarityMatch[]> {
  try {
    const keywords = query.split(/\s+/).slice(0, 6).join(" ");
    const encoded = encodeURIComponent(keywords);
    const url = `https://api.crossref.org/works?query=${encoded}&rows=${limit}&select=DOI,title,author,published-print,URL`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const data = await res.json() as any;
    return (data.message?.items || []).map((item: any, i: number) => ({
      id: `cr-${i}`,
      sourceTitle: (item.title?.[0] || "").trim(),
      sourceAuthors: (item.author || []).map((a: any) => `${a.given || ""} ${a.family || ""}`.trim()).slice(0, 4),
      sourceYear: item["published-print"]?.["date-parts"]?.[0]?.[0] || new Date().getFullYear(),
      sourceUrl: item.URL || "",
      source: "Crossref",
      similarityPercent: 0,
      matchedParagraphs: [],
      matchedText: "",
    }));
  } catch { return []; }
}

async function calculateTextSimilarity(text: string, sources: SimilarityMatch[]): Promise<SimilarityMatch[]> {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 50);

  if (paragraphs.length === 0 || sources.length === 0) return sources;

  try {
    const sampleParagraphs = paragraphs.slice(0, 5);
    const sourceSummaries = sources.slice(0, 10).map((s, i) =>
      `[${i}] ${s.sourceTitle} (${s.sourceYear}) - ${s.source}`
    ).join("\n");

    const similarityResult = await generateJSON<{
      matches: Array<{
        sourceIndex: number;
        similarityPercent: number;
        matchedParagraphs: number[];
        matchedText: string;
      }>;
    }>(
      "You are a text similarity detection expert. Compare text paragraphs against known sources and estimate similarity. Be conservative with estimates.",
      `Compare these paragraphs against the listed sources and estimate text similarity (NOT topical similarity):\n\nParagraphs:\n${sampleParagraphs.map((p, i) => `[P${i}]: ${p.slice(0, 300)}`).join("\n\n")}\n\nSources:\n${sourceSummaries}\n\nReturn JSON: { "matches": [{ "sourceIndex": number, "similarityPercent": number 0-100, "matchedParagraphs": [paragraph indices], "matchedText": "the matching excerpt" }] }`,
      { model: MODELS.FAST, responseFormat: { type: "json_object" }, temperature: 0.2 },
      { matches: [] }
    );

    for (const match of similarityResult.matches) {
      if (match.sourceIndex < sources.length && match.similarityPercent > 3) {
        sources[match.sourceIndex].similarityPercent = Math.min(95, match.similarityPercent);
        sources[match.sourceIndex].matchedParagraphs = match.matchedParagraphs.map(i => paragraphs[i]?.slice(0, 200) || "");
        sources[match.sourceIndex].matchedText = match.matchedText;
      }
    }
  } catch {
    // Fallback: use simple keyword overlap
    for (const source of sources) {
      const sourceWords = new Set(
        source.sourceTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      );
      const textWords = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const overlap = textWords.filter(w => sourceWords.has(w)).length;
      source.similarityPercent = Math.min(40, Math.round((overlap / Math.max(sourceWords.size, 1)) * 100));
    }
  }

  return sources.filter(s => s.similarityPercent > 0);
}

export async function detectSimilarity(text: string): Promise<SimilarityResult> {
  const query = text.slice(0, 500).replace(/\n+/g, " ");
  const sources = await searchSimilarSources(query, 15);
  const matches = await calculateTextSimilarity(text, sources);

  const topMatches = matches.filter(m => m.similarityPercent > 5);
  const overallScore = topMatches.length > 0
    ? Math.round(topMatches.reduce((sum, m) => sum + m.similarityPercent, 0) / Math.min(topMatches.length, 3))
    : 0;

  const internetPercent = Math.round(overallScore * 0.55);
  const researchPapersPercent = Math.round(overallScore * 0.35);
  const internalPercent = Math.max(0, overallScore - internetPercent - researchPapersPercent);

  return {
    overallScore: Math.min(100, overallScore),
    internetPercent,
    researchPapersPercent,
    internalPercent,
    matches: topMatches,
    totalSourcesChecked: sources.length,
  };
}

// ============================================================================
// CITATION CHECKER
// ============================================================================

export async function checkCitations(text: string): Promise<CitationResult> {
  const references = extractReferences(text);
  const inTextCitations = extractInTextCitations(text);
  const issues: CitationIssue[] = [];

  // Check for missing citations in body text
  const bodyEnd = text.indexOf("REFERENCES") !== -1
    ? text.indexOf("REFERENCES")
    : text.indexOf("BIBLIOGRAPHY") !== -1
    ? text.indexOf("BIBLIOGRAPHY")
    : text.length;
  const bodyText = text.slice(0, bodyEnd);

  const paragraphs = bodyText.split(/\n\s*\n/).filter(p => p.trim().length > 100);
  const quotePatterns = bodyText.match(/"([^"]{10,})"|"([^"]{10,})"/g) || [];
  const quoteParagraphs = paragraphs.filter(p => /"[^"]{10,}"/.test(p));

  for (const quote of quoteParagraphs) {
    const hasNearbyCitation = /"[^"]*"\s*\[[\d,\s]+\]/.test(quote) ||
      /"[^"]*"\s*\([A-Z][a-z]+.*\d{4}\)/.test(quote);
    if (!hasNearbyCitation) {
      issues.push({
        type: "uncited-quote",
        severity: "high",
        message: "Direct quote found without citation",
        context: quote.slice(0, 150) + "...",
        suggestion: "Add an in-text citation after the quoted text",
      });
    }
  }

  // Check reference list
  const citedNumbers = new Set<number>();
  const citationNumPattern = /\[(\d+)\]/g;
  let match;
  while ((match = citationNumPattern.exec(bodyText)) !== null) {
    citedNumbers.add(parseInt(match[1]));
  }

  for (let i = 0; i < references.length; i++) {
    const refNum = i + 1;
    if (!citedNumbers.has(refNum)) {
      issues.push({
        type: "orphan",
        severity: "medium",
        message: `Reference [${refNum}] is listed but never cited in the text`,
        context: references[i].slice(0, 100),
        suggestion: "Remove unused references or add in-text citations",
      });
    }

    if (references[i].length < 20) {
      issues.push({
        type: "invalid",
        severity: "medium",
        message: `Reference [${refNum}] appears incomplete`,
        context: references[i],
        suggestion: "Ensure full bibliographic information is included",
      });
    }
  }

  // Check for numbered citations pointing to non-existent references
  for (const num of citedNumbers) {
    if (num > references.length) {
      issues.push({
        type: "missing",
        severity: "high",
        message: `Citation [${num}] references a non-existent entry in the reference list`,
        suggestion: "Add the reference to the bibliography or correct the citation number",
      });
    }
  }

  // AI-assisted citation format checking
  if (references.length > 0) {
    try {
      const formatCheck = await generateJSON<{
        issues: Array<{ type: string; severity: string; message: string; context: string }>;
      }>(
        "You are a citation format expert. Check if references follow a consistent academic citation format (IEEE, APA, MLA, Chicago).",
        `Check these ${references.length} references for format consistency and errors:\n${references.slice(0, 15).map((r, i) => `[${i + 1}] ${r.slice(0, 200)}`).join("\n")}\n\nReturn JSON: { "issues": [{ "type": "format-error", "severity": "low|medium|high", "message": "description", "context": "the problematic reference" }] }`,
        { model: MODELS.FAST, responseFormat: { type: "json_object" }, temperature: 0.2 },
        { issues: [] }
      );

      for (const issue of formatCheck.issues) {
        issues.push({
          type: "format-error",
          severity: issue.severity as "high" | "medium" | "low",
          message: issue.message,
          context: issue.context,
          suggestion: "Fix citation format to match the paper's citation style",
        });
      }
    } catch { /* ignore */ }
  }

  const totalRefs = Math.max(references.length, citedNumbers.size);
  const highIssues = issues.filter(i => i.severity === "high").length;
  const medIssues = issues.filter(i => i.severity === "medium").length;
  const score = Math.max(0, 100 - (highIssues * 15) - (medIssues * 8));

  return {
    overallScore: Math.min(100, score),
    totalReferences: totalRefs,
    validReferences: totalRefs - issues.filter(i => i.type === "invalid" || i.type === "missing").length,
    missingCitations: issues.filter(i => i.type === "missing" || i.type === "uncited-quote").length,
    formatIssues: issues.filter(i => i.type === "format-error").length,
    issues,
  };
}

// ============================================================================
// WRITING QUALITY ANALYSIS
// ============================================================================

export async function analyzeWritingQuality(text: string): Promise<WritingQualityResult> {
  const issues: WritingIssue[] = [];
  const sentences = extractSentences(text);
  const words = text.split(/\s+/).filter(w => w.length > 0);

  // Passive voice detection
  const passivePattern = /\b(is|are|was|were|been|being|be)\s+(being\s+)?\w+ed\b/gi;
  const passiveMatches = text.match(passivePattern) || [];
  const passiveVoiceCount = passiveMatches.length;
  const passiveRatio = passiveMatches.length / Math.max(sentences.length, 1);

  if (passiveRatio > 0.3) {
    issues.push({
      type: "passive-voice",
      severity: "medium",
      message: `High passive voice usage detected (${passiveMatches.length} instances, ${Math.round(passiveRatio * 100)}% of sentences)`,
      suggestion: "Convert passive constructions to active voice where possible",
    });
  }

  // Repetition detection
  const bigrams = new Map<string, number>();
  for (let i = 0; i < sentences.length - 1; i++) {
    const key = sentences[i].toLowerCase().slice(0, 50);
    bigrams.set(key, (bigrams.get(key) || 0) + 1);
  }
  const repeated = Array.from(bigrams.entries()).filter(([, c]) => c > 2);
  for (const [text_key, count] of repeated) {
    issues.push({
      type: "repetition",
      severity: count > 4 ? "high" : "medium",
      message: `Sentence pattern repeated ${count} times`,
      context: text_key + "...",
      suggestion: "Rewrite to improve variety and engagement",
    });
  }

  // Long sentences
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 40);
  if (longSentences.length > 0) {
    issues.push({
      type: "clarity",
      severity: longSentences.length > 3 ? "high" : "medium",
      message: `${longSentences.length} sentences exceed 40 words — consider splitting for clarity`,
      context: longSentences[0].slice(0, 150) + "...",
      suggestion: "Break long sentences into shorter, clearer ones",
    });
  }

  // Very short sentences
  const shortSentences = sentences.filter(s => {
    const wc = s.split(/\s+/).length;
    return wc >= 3 && wc <= 5;
  });
  if (shortSentences.length > sentences.length * 0.4) {
    issues.push({
      type: "clarity",
      severity: "low",
      message: "Many very short sentences — may reduce academic depth",
      suggestion: "Combine short sentences or add supporting details",
    });
  }

  // AI-assisted writing quality check
  let grammarScore = 85;
  let readabilityScore = 75;
  let academicToneScore = 80;
  let clarityScore = 78;
  let concisenessScore = 82;

  try {
    const sample = text.slice(0, 2000);
    const qualityAnalysis = await generateJSON<{
      grammarScore: number;
      readabilityScore: number;
      academicToneScore: number;
      clarityScore: number;
      concisenessScore: number;
      issues: Array<{ type: string; severity: string; message: string; context: string; suggestion: string }>;
    }>(
      "You are an academic writing quality expert. Analyze text for grammar, readability, academic tone, clarity, and conciseness. Be precise and constructive.",
      `Analyze this academic text:\n"""\n${sample}\n"""\nReturn JSON: { "grammarScore": 0-100, "readabilityScore": 0-100, "academicToneScore": 0-100, "clarityScore": 0-100, "concisenessScore": 0-100, "issues": [{ "type": "grammar|readability|passive-voice|repetition|clarity|academic-tone|conciseness", "severity": "high|medium|low", "message": "...", "context": "...", "suggestion": "..." }] }`,
      { model: MODELS.FAST, responseFormat: { type: "json_object" }, temperature: 0.3 },
      { grammarScore: 85, readabilityScore: 75, academicToneScore: 80, clarityScore: 78, concisenessScore: 82, issues: [] }
    );

    grammarScore = qualityAnalysis.grammarScore;
    readabilityScore = qualityAnalysis.readabilityScore;
    academicToneScore = qualityAnalysis.academicToneScore;
    clarityScore = qualityAnalysis.clarityScore;
    concisenessScore = qualityAnalysis.concisenessScore;

    for (const issue of qualityAnalysis.issues) {
      issues.push({
        type: issue.type as WritingIssue["type"],
        severity: issue.severity as "high" | "medium" | "low",
        message: issue.message,
        context: issue.context,
        suggestion: issue.suggestion,
      });
    }
  } catch {
    // Use statistical analysis only
  }

  const repetitionScore = Math.max(0, 100 - calculateRepetition(text));
  const overallScore = Math.round(
    (grammarScore * 0.2) +
    (readabilityScore * 0.15) +
    (academicToneScore * 0.2) +
    (clarityScore * 0.15) +
    (concisenessScore * 0.15) +
    (repetitionScore * 0.15)
  );

  const label = overallScore >= 90 ? "Excellent" :
    overallScore >= 75 ? "Good" :
    overallScore >= 60 ? "Adequate" :
    overallScore >= 40 ? "Needs Improvement" : "Poor";

  return {
    overallScore,
    label,
    grammarScore,
    readabilityScore,
    academicToneScore,
    passiveVoiceCount,
    repetitionScore,
    clarityScore,
    concisenessScore,
    issues,
  };
}

// ============================================================================
// SECTION-LEVEL ANALYSIS
// ============================================================================

async function analyzeSection(
  section: { id: string; title: string; text: string },
  checkAI: boolean,
  checkSimilarity: boolean
): Promise<SectionAnalysis> {
  const highlights: HighlightSpan[] = [];
  const matches: SimilarityMatch[] = [];

  let aiProbability = 0;
  if (checkAI && section.text.length > 100) {
    const aiResult = await detectAIContent(section.text);
    aiProbability = aiResult.probability;

    if (aiProbability > 50) {
      const sentences = extractSentences(section.text);
      let offset = 0;
      for (const sentence of sentences) {
        const start = section.text.indexOf(sentence, offset);
        if (start !== -1) {
          if (aiProbability > 65) {
            highlights.push({
              start,
              end: start + sentence.length,
              type: "ai",
              confidence: aiProbability / 100,
            });
          } else {
            highlights.push({
              start,
              end: start + sentence.length,
              type: "ai",
              confidence: 0.4,
            });
          }
          offset = start + sentence.length;
        }
      }
    }
  }

  let similarityScore = 0;
  if (checkSimilarity && section.text.length > 100) {
    const query = section.text.slice(0, 300);
    const sectionMatches = await searchSimilarSources(query, 5);
    const calculatedMatches = await calculateTextSimilarity(section.text, sectionMatches);
    matches.push(...calculatedMatches.filter(m => m.similarityPercent > 10));
    similarityScore = matches.length > 0 ? Math.max(...matches.map(m => m.similarityPercent)) : 0;

    for (const match of matches) {
      if (match.matchedText) {
        const idx = section.text.indexOf(match.matchedText.slice(0, 30));
        if (idx !== -1) {
          highlights.push({
            start: idx,
            end: idx + match.matchedText.length,
            type: match.similarityPercent > 40 ? "high-similarity" : "moderate-similarity",
            confidence: match.similarityPercent / 100,
            source: match.sourceTitle,
          });
        }
      }
    }
  }

  return {
    id: section.id,
    title: section.title,
    text: section.text,
    aiProbability,
    similarityScore,
    highlights,
    matches,
    citations: [],
    writingIssues: [],
  };
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

async function generateRecommendations(report: PlagiarismReport): Promise<string[]> {
  const recommendations: string[] = [];

  if (report.similarityScore > 20) {
    recommendations.push("Your similarity score is elevated. Review matched sections and paraphrase or add proper citations.");
  }
  if (report.aiDetection.probability > 40) {
    recommendations.push("A significant portion of text may be AI-generated. Consider rewriting in your own voice to improve originality.");
  }
  if (report.citations.missingCitations > 0) {
    recommendations.push(`${report.citations.missingCitations} citation(s) are missing. Add in-text citations for all borrowed ideas and quotes.`);
  }
  if (report.citations.formatIssues > 0) {
    recommendations.push("Some references have format inconsistencies. Ensure all citations follow a consistent style (IEEE, APA, etc.).");
  }
  if (report.writingQuality.passiveVoiceCount > 10) {
    recommendations.push("Reduce passive voice usage to improve readability and strengthen your academic argument.");
  }
  if (report.writingQuality.clarityScore < 70) {
    recommendations.push("Improve clarity by breaking long sentences and using more precise language.");
  }
  if (report.writingQuality.overallScore < 60) {
    recommendations.push("Consider a thorough revision focusing on grammar, academic tone, and conciseness.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Your paper demonstrates good academic integrity. Minor improvements can still enhance quality.");
  }

  try {
    const aiRecommendations = await generateText(
      "You are an academic writing advisor. Provide 3-5 specific, actionable recommendations to improve the paper's integrity and quality.",
      `Based on this analysis:\n- Originality: ${report.originalityScore}%\n- Similarity: ${report.similarityScore}%\n- AI Probability: ${report.aiDetection.probability}%\n- Citation Quality: ${report.citations.overallScore}%\n- Writing Quality: ${report.writingQuality.label}\n\nTop issues:\n${report.writingQuality.issues.slice(0, 3).map(i => `- ${i.message}`).join("\n")}\n${report.citations.issues.slice(0, 3).map(i => `- ${i.message}`).join("\n")}\n\nProvide concise, specific recommendations.`,
      { model: MODELS.FAST, temperature: 0.5 }
    );

    const lines = aiRecommendations.split("\n").filter(l => l.trim().length > 10);
    for (const line of lines.slice(0, 5)) {
      const cleaned = line.replace(/^[\d\-\*\•]+\s*/, "").trim();
      if (cleaned.length > 10 && !recommendations.includes(cleaned)) {
        recommendations.push(cleaned);
      }
    }
  } catch { /* use statistical recommendations */ }

  return recommendations.slice(0, 8);
}

// ============================================================================
// MAIN ANALYSIS ORCHESTRATOR
// ============================================================================

export async function analyzeDocument(
  config: PlagiarismConfig,
  onProgress?: (step: string, message: string, percent: number) => void
): Promise<PlagiarismReport> {
  const text = config.text;
  const sections = splitIntoSections(text);

  onProgress?.("init", "Analyzing document structure...", 5);

  // Parallel: AI detection + similarity + citations + writing quality
  const checks = {
    ai: config.checkAI !== false,
    similarity: config.checkSimilarity !== false,
    citations: config.checkCitations !== false,
    writingQuality: config.checkWritingQuality !== false,
  };

  onProgress?.("analysis", "Running AI detection analysis...", 10);

  const [aiDetection, similarity, citations, writingQuality] = await Promise.all([
    checks.ai ? detectAIContent(text) : Promise.resolve({
      probability: 0, confidence: "low" as const, label: "Skipped",
      indicators: { perplexity: 0, burstiness: 0, sentenceDiversity: 0, vocabularyVariation: 0, repetition: 0, syntaxConsistency: 0 },
    }),
    checks.similarity ? (async () => {
      onProgress?.("similarity", "Searching academic databases...", 25);
      const result = await detectSimilarity(text);
      onProgress?.("similarity", `Found ${result.matches.length} potential matches`, 50);
      return result;
    })() : Promise.resolve({
      overallScore: 0, internetPercent: 0, researchPapersPercent: 0, internalPercent: 0,
      matches: [], totalSourcesChecked: 0,
    }),
    checks.citations ? (async () => {
      onProgress?.("citations", "Verifying citations and references...", 55);
      return checkCitations(text);
    })() : Promise.resolve({
      overallScore: 100, totalReferences: 0, validReferences: 0, missingCitations: 0, formatIssues: 0, issues: [],
    }),
    checks.writingQuality ? (async () => {
      onProgress?.("writing", "Analyzing writing quality...", 65);
      return analyzeWritingQuality(text);
    })() : Promise.resolve({
      overallScore: 100, label: "Skipped", grammarScore: 0, readabilityScore: 0,
      academicToneScore: 0, passiveVoiceCount: 0, repetitionScore: 0, clarityScore: 0,
      concisenessScore: 0, issues: [],
    }),
  ]);

  onProgress?.("sections", "Analyzing individual sections...", 75);

  // Analyze sections
  const sectionAnalyses: SectionAnalysis[] = [];
  for (let i = 0; i < sections.length; i++) {
    const sectionPercent = 75 + Math.round((i / sections.length) * 15);
    onProgress?.("sections", `Analyzing: ${sections[i].title}...`, sectionPercent);

    const analysis = await analyzeSection(sections[i], checks.ai, checks.similarity);
    sectionAnalyses.push(analysis);
  }

  onProgress?.("highlights", "Generating highlights...", 92);

  // Aggregate highlights
  const allHighlights: HighlightSpan[] = [];
  let charOffset = 0;
  for (let i = 0; i < sections.length; i++) {
    for (const h of sectionAnalyses[i].highlights) {
      allHighlights.push({
        ...h,
        start: charOffset + h.start,
        end: charOffset + h.end,
      });
    }
    charOffset += sections[i].text.length + 1;
  }

  onProgress?.("recommendations", "Generating recommendations...", 95);

  // Calculate composite scores
  const originalityScore = Math.round(100 - (
    (aiDetection.probability * 0.3) +
    (similarity.overallScore * 0.5) +
    (Math.max(0, 100 - citations.overallScore) * 0.2)
  ));

  const report: PlagiarismReport = {
    title: config.title || "Untitled Document",
    originalityScore: Math.max(0, Math.min(100, originalityScore)),
    similarityScore: similarity.overallScore,
    aiDetection,
    similarity,
    citations,
    writingQuality,
    sections: sectionAnalyses,
    highlights: allHighlights,
    recommendations: [],
    wordCount: countWords(text),
    charCount: text.length,
    generatedAt: new Date().toISOString(),
  };

  report.recommendations = await generateRecommendations(report);

  onProgress?.("complete", "Analysis complete!", 100);

  return report;
}
