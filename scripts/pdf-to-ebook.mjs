/**
 * pdf-to-ebook.mjs
 * -------------------------------------------------------
 * Converts public/pdfs/GRADE_{E,D,C}_EBOOK.pdf into
 * src/data/ebookContent.js (chapter HTML for EbookPage).
 *
 * Structure per grade: { chapters: [{ title, subtitle, html }] }
 * One chapter per "MODULE N" in the source manual.
 *
 * Run: npm run convert:ebook
 * -------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PDF_DIR = path.join(ROOT, 'public', 'pdfs');
const OUT_FILE = path.join(ROOT, 'src', 'data', 'ebookContent.js');

const GRADES = ['E', 'D', 'C'];

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const isPageMarker = (l) => /^--\s*\d+\s+of\s+\d+\s*--$/.test(l);
const isStandaloneNumber = (l) => /^\d{1,4}$/.test(l);
const isModuleHeading = (l) => /^MODULE\s+\d+$/i.test(l);
const isBullet = (l) => /^[•·▪◦]\s+|^-+\s+/.test(l);
const isNumberedItem = (l) => /^\d{1,2}[.)]\s+\S/.test(l);

// A heading line: mostly uppercase letters, short enough, not ending a sentence.
const isHeadingLine = (l) => {
  const letters = l.replace(/[^A-Za-z]/g, '');
  if (letters.length < 4) return false;
  const upper = letters.replace(/[^A-Z]/g, '').length;
  const ratio = upper / letters.length;
  if (ratio < 0.85) return false;
  if (l.length > 95) return false;
  if (/[.;:,]$/.test(l)) return false;
  if (isBullet(l) || isNumberedItem(l)) return false;
  return true;
};

// Collapse whitespace + repair PDF line-break hyphenation ("COMMUNICA- TION").
const finalizeText = (s) =>
  s.replace(/\s+/g, ' ').trim().replace(/([A-Za-z])-\s+([a-z])/g, '$1$2');

// Split a wrapped line group that ended mid-word (rare) — join with space.
const joinLines = (lines) => finalizeText(lines.join(' '));

// Parse the TABLE OF CONTENTS page: module number -> topic title.
const parseToc = (pages) => {
  const tocPage = pages.find((t) => /TABLE OF CONTENTS/i.test(t));
  if (!tocPage) return {};

  const titles = {};
  let current = null;
  const finish = () => {
    if (current && current.num != null && current.parts.length) {
      titles[current.num] = current.parts.join(' ').replace(/\s+/g, ' ').trim();
    }
    current = null;
  };

  tocPage.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    if (isPageMarker(line) || isStandaloneNumber(line)) {
      finish();
      return;
    }
    const start = line.match(/^(\d{1,2})\.\s+(.*)$/);
    if (start) {
      finish();
      current = { num: Number(start[1]), parts: [stripPageRange(start[2])] };
      return;
    }
    if (current) {
      const cleaned = stripPageRange(line);
      if (cleaned) current.parts.push(cleaned);
    }
  });
  finish();
  return titles;
};

const stripPageRange = (s) =>
  s.replace(/\s*\d+\s*[–—-]\s*\d+\s*$/, '').trim();

// Spelling fixes + cleanup of PDF extraction artifacts, applied to titles and HTML.
const TYPO_FIXES = [
  [/\bSECUIRTY\b/g, 'SECURITY'],
  [/\bPATROLLIING\b/g, 'PATROLLING'],
  [/\bSIEZED\b/g, 'SEIZED'],
  [/\bLABLE\b/g, 'LABEL'],
  [/\bREQUIRMENTS\b/g, 'REQUIREMENTS'],
  [/\bbeenstolen\b/g, 'been stolen'],
  [/-{2,}/g, ' '], // underline/decoration artifacts: "in-possession--of" -> "in-possession of"
];

const applyTextFixes = (s) => {
  let out = s;
  for (const [pattern, replacement] of TYPO_FIXES) out = out.replace(pattern, replacement);
  return out.replace(/\s{2,}/g, ' ').trim();
};

const cleanPageText = (raw) => {
  const lines = raw.split('\n').map((l) => l.replace(/\s+$/, ''));
  const kept = [];
  lines.forEach((l, i) => {
    const t = l.trim();
    if (!t) {
      kept.push('');
      return;
    }
    if (isPageMarker(t)) return;
    // Drop printed page numbers only at page boundaries.
    if (isStandaloneNumber(t) && (i === 0 || i === lines.length - 1)) return;
    kept.push(t);
  });
  // Collapse runs of blank lines.
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};

// Convert cleaned page text into HTML using line heuristics.
const textToHtml = (text) => {
  const out = [];
  const lines = text.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    // Bullet list (with wrapped continuation lines)
    if (isBullet(line)) {
      const items = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (!l) break;
        if (isBullet(l)) {
          items.push(l.replace(isNumberedItem(l) ? /^\d+[.)]\s+/ : /^[•·▪◦]\s+|^-+\s+/, ''));
        } else if (isHeadingLine(l)) {
          break;
        } else if (isNumberedItem(l)) {
          break;
        } else if (items.length) {
          items[items.length - 1] += ' ' + l;
        } else {
          items.push(l);
        }
        i++;
      }
      out.push('<ul>' + items.map((t) => `<li>${escapeHtml(finalizeText(t))}</li>`).join('') + '</ul>');
      continue;
    }

    // Numbered list
    if (isNumberedItem(line)) {
      const items = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (!l) break;
        if (isNumberedItem(l)) {
          items.push(l.replace(/^\d{1,2}[.)]\s+/, ''));
        } else if (isHeadingLine(l) || isBullet(l)) {
          break;
        } else if (items.length) {
          items[items.length - 1] += ' ' + l;
        } else {
          items.push(l);
        }
        i++;
      }
      out.push('<ol>' + items.map((t) => `<li>${escapeHtml(finalizeText(t))}</li>`).join('') + '</ol>');
      continue;
    }

    // Heading (consecutive uppercase lines merge into one heading)
    if (isHeadingLine(line)) {
      const headingLines = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (!l) {
          i++;
          break;
        }
        if (!isHeadingLine(l)) break;
        headingLines.push(l);
        i++;
      }
      const heading = joinLines(headingLines);
      out.push(`<h2>${escapeHtml(heading)}</h2>`);
      continue;
    }

    // Paragraph (consecutive plain lines)
    const paraLines = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (!l) {
        i++;
        break;
      }
      if (isHeadingLine(l) || isBullet(l) || isNumberedItem(l)) break;
      paraLines.push(l);
      i++;
    }
    if (paraLines.length) {
      out.push(`<p>${escapeHtml(joinLines(paraLines))}</p>`);
    }
  }

  return out.join('\n');
};

const extractModuleTitle = (pageText, moduleNumber) => {
  const lines = pageText.split('\n').map((l) => l.trim()).filter(Boolean);
  const idx = lines.findIndex((l) => isModuleHeading(l));
  if (idx === -1) return null;
    const titleLines = [];
  for (let j = idx + 1; j < lines.length; j++) {
    const l = lines[j];
    if (isStandaloneNumber(l) || isBullet(l)) break;
    titleLines.push(l);
  }
  const title = finalizeText(titleLines.join(' '));
  return title || `Module ${moduleNumber}`;
};

const convertGrade = async (grade) => {
  const pdfPath = path.join(PDF_DIR, `GRADE_${grade}_EBOOK.pdf`);
  const parser = new PDFParse({ data: new Uint8Array(fs.readFileSync(pdfPath)) });
  const result = await parser.getText();
  await parser.destroy();

  const pages = result.pages.map((p) => cleanPageText(p.text));
  const tocTitles = parseToc(pages);

  // Locate module title pages (a "MODULE N" heading near the top of the page)
  const moduleStarts = [];
  pages.forEach((text, idx) => {
    const firstLines = text.split('\n').slice(0, 3).map((l) => l.trim());
    if (firstLines.some((l) => isModuleHeading(l))) moduleStarts.push(idx);
  });

  if (moduleStarts.length === 0) {
    console.warn(`[warn] Grade ${grade}: no MODULE headings found — check PDF structure.`);
    return { grade, chapters: [] };
  }

  const chapters = moduleStarts.map((startIdx, n) => {
    const endIdx = n + 1 < moduleStarts.length ? moduleStarts[n + 1] : pages.length;
    const moduleNumber = n + 1;
    const title =
      (tocTitles[moduleNumber] && finalizeText(tocTitles[moduleNumber])) ||
      extractModuleTitle(pages[startIdx], moduleNumber) ||
      `Module ${moduleNumber}`;

    const contentPages = [];
    for (let p = startIdx + 1; p < endIdx; p++) {
      const text = pages[p];
      if (!text) continue;
      if (/copyright of this manual/i.test(text)) continue; // repeated back matter
      if (!/[A-Za-z]/.test(text)) continue;
      contentPages.push(text);
    }

    const html = applyTextFixes(contentPages.map(textToHtml).join('\n'));

    return {
      title: applyTextFixes(title),
      subtitle: `Grade ${grade} \u2022 Module ${moduleNumber} of ${moduleStarts.length}`,
      html,
    };
  });

  console.log(`[ok] Grade ${grade}: ${chapters.length} modules, ${pages.length} pages.`);
  return { grade, chapters };
};

const main = async () => {
  const ebookContent = {};
  for (const grade of GRADES) {
    const { chapters } = await convertGrade(grade);
    ebookContent[grade] = { chapters };
  }

  const banner = `/**
 * ebookContent.js
 * -------------------------------------------------------
 * Stores the HTML chapter content for each grade's ebook.
 *
 * AUTO-GENERATED by scripts/pdf-to-ebook.mjs — do not edit by hand.
 * Source PDFs: public/pdfs/GRADE_{E,D,C}_EBOOK.pdf
 *
 * Structure:
 *   ebookContent[grade].chapters = [
 *     { title: string, subtitle?: string, html: string },
 *     ...
 *   ]
 * -------------------------------------------------------
 */

export const ebookContent = ${JSON.stringify(ebookContent, null, 2)};
`;

  fs.writeFileSync(OUT_FILE, banner, 'utf8');
  console.log(`[done] Wrote ${path.relative(ROOT, OUT_FILE)}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
