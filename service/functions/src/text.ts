// Text helpers: hashing, chunking, keyword extraction.
import { createHash } from "node:crypto";

const STOPWORDS = new Set([
  "the", "and", "for", "are", "with", "that", "this", "from", "how", "what", "who", "when",
  "which", "does", "our", "your", "you", "can", "should", "about", "into", "per", "has",
  "have", "was", "were", "been", "will", "not", "but", "all", "any", "its", "his", "her",
  "they", "them", "their", "there", "then", "than", "also", "only", "use", "used",
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

/**
 * Pull the key figure out of a passage (payroll answers usually hinge on a percentage).
 * Used to detect when two sources disagree. Swap for an LLM extraction later if needed.
 */
export function extractClaim(text: string): string | null {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s?%/);
  return match ? `${match[1].replace(",", ".")}%` : null;
}
