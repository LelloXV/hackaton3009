// Text helpers: hashing, chunking, keywords, claims, dates.
import { createHash } from "node:crypto";

const STOPWORDS = new Set([
  "the", "and", "for", "are", "with", "that", "this", "from", "how", "what", "who", "when",
  "which", "does", "our", "your", "you", "can", "should", "about", "into", "per", "has",
  "have", "was", "were", "been", "will", "not", "but", "all", "any", "its", "his", "her",
  "they", "them", "their", "there", "then", "than", "also", "only", "use", "used", "is",
]);

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** Lowercase, strip accents and punctuation, drop stopwords and very short words. */
export function terms(text: string): string[] {
  const words = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9%]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return [...new Set(words)];
}

/** Split into chunks of roughly maxChars, on paragraph boundaries where possible. */
export function chunkText(text: string, maxChars = 800): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if (current && current.length + p.length + 2 > maxChars) {
      chunks.push(current);
      current = "";
    }
    if (p.length > maxChars) {
      for (let i = 0; i < p.length; i += maxChars) chunks.push(p.slice(i, i + maxChars));
    } else {
      current = current ? `${current}\n\n${p}` : p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DATE = new RegExp(`\\b(\\d{1,2})\\s(${MONTHS.join("|")})\\s(\\d{4})\\b`, "g");
const PERCENT = /(\d+(?:[.,]\d+)?)\s?%/g;

/**
 * Key figures in a sentence (full dates like "1 April 2027" and percentages).
 * Used to detect when sources disagree. Swap for an LLM extraction later if needed.
 */
export function extractClaims(sentence: string): string[] {
  const dates = [...sentence.matchAll(DATE)].map((m) => `${Number(m[1])} ${m[2]} ${m[3]}`);
  const percents = [...sentence.matchAll(PERCENT)].map((m) => `${m[1].replace(",", ".")}%`);
  return [...dates, ...percents];
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "12 Sep 2026" (UTC, independent of the server locale). */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export const DAY = 24 * 60 * 60 * 1000;

export function daysBetween(fromIso: string, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(fromIso).getTime()) / DAY));
}
