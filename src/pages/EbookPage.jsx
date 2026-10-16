import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { ebookContent } from '../data/ebookContent.js';
import { ChevronRight, FileText, Menu, X, BookOpen, ExternalLink } from 'lucide-react';

const GRADE_META = {
  E: {
    label: 'Grade E',
    title: 'Security Foundation',
    color: '#16a34a',
    pdfPath: '/pdfs/GRADE_E_EBOOK.pdf',
    pdfLabel: 'Grade E — EBOOK.pdf',
  },
  D: {
    label: 'Grade D',
    title: 'Intermediate Officer',
    color: '#E8610A',
    pdfPath: '/pdfs/GRADE_D_EBOOK.pdf',
    pdfLabel: 'Grade D — EBOOK.pdf',
  },
  C: {
    label: 'Grade C',
    title: 'Senior Security',
    color: '#7c3aed',
    pdfPath: '/pdfs/GRADE_C_EBOOK.pdf',
    pdfLabel: 'Grade C — EBOOK.pdf',
  },
};

export function EbookPage() {
  const { grade } = useParams();
  const meta = GRADE_META[grade?.toUpperCase()] || GRADE_META['E'];
  const gradeKey = grade?.toUpperCase() || 'E';
  const content = ebookContent[gradeKey] || { chapters: [] };

  const [activeChapter, setActiveChapter] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const chapter = content.chapters[activeChapter];

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
      <Navbar />

      {/* Top bar */}
      <div className="fixed top-16 inset-x-0 z-40 glass border-b border-divider dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted dark:text-dark-muted min-w-0">
            <Link to="/" className="hover:text-primary transition-colors shrink-0">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold text-ink dark:text-dark-ink truncate">{meta.label} — {meta.title}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Original PDF button (disabled) */}
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 text-muted dark:text-dark-muted text-xs font-semibold opacity-60 cursor-not-allowed select-none"
            >
              <FileText className="w-3.5 h-3.5" />
              View Original PDF
              <ExternalLink className="w-3 h-3" />
            </button>

            {/* Sidebar toggle (mobile) */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="lg:hidden p-1.5 rounded-lg text-muted dark:text-dark-muted hover:text-primary transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 pt-28">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} shrink-0 transition-all duration-300
            fixed lg:sticky top-28 left-0 h-[calc(100vh-7rem)] z-30
            bg-surface dark:bg-dark-surface border-r border-divider dark:border-dark-border
            flex flex-col overflow-y-auto`}
        >
          {/* Sidebar header */}
          <div className="px-5 py-5 border-b border-divider dark:border-dark-border">
            <div className="flex items-center gap-3 mb-1">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-white text-base"
                style={{ background: meta.color }}>
                {gradeKey}
              </span>
              <div>
                <div className="font-display font-bold text-sm text-ink dark:text-dark-ink">{meta.label}</div>
                <div className="text-xs text-muted dark:text-dark-muted">{meta.title}</div>
              </div>
            </div>
          </div>

          {/* Chapter list */}
          <nav className="flex-1 px-3 py-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted dark:text-dark-muted px-2 mb-3">
              Chapters — {content.chapters.length}
            </p>
            {content.chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveChapter(idx); window.scrollTo({ top: 0 }); }}
                className={`chapter-item w-full text-left ${activeChapter === idx ? 'active' : 'text-ink dark:text-dark-ink'}`}
              >
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0"
                  style={{ background: activeChapter === idx ? 'rgba(255,255,255,0.25)' : 'var(--divider)' }}>
                  {idx + 1}
                </span>
                <span className="text-sm leading-snug">{ch.title}</span>
              </button>
            ))}
          </nav>

          {/* Grade switcher */}
          <div className="px-3 py-4 border-t border-divider dark:border-dark-border">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted dark:text-dark-muted px-2 mb-2">Switch Grade</p>
            <div className="flex gap-2">
              {['E', 'D', 'C'].map(g => (
                <Link
                  key={g}
                  to={`/ebook/${g}`}
                  onClick={() => setActiveChapter(0)}
                  className={`flex-1 py-2 rounded-xl text-center text-sm font-bold transition-all ${
                    gradeKey === g
                      ? 'text-white shadow-md'
                      : 'bg-background dark:bg-dark-bg text-muted dark:text-dark-muted hover:text-primary'
                  }`}
                  style={gradeKey === g ? { background: GRADE_META[g].color } : {}}
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Content area */}
        <main
          className={`flex-1 min-w-0 px-6 sm:px-10 lg:px-16 py-10 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : ''}`}
          onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
        >
          {chapter ? (
            <article className="max-w-3xl mx-auto">
              {/* Chapter header */}
              <div className="mb-8 pb-6 border-b border-divider dark:border-dark-border">
                <span className="text-xs font-mono uppercase tracking-widest text-primary mb-2 block">
                  Chapter {activeChapter + 1} of {content.chapters.length}
                </span>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-ink dark:text-dark-ink tracking-tight mb-3">
                  {chapter.title}
                </h1>
                {chapter.subtitle && (
                  <p className="text-muted dark:text-dark-muted text-lg">{chapter.subtitle}</p>
                )}
              </div>

              {/* Chapter body */}
              <div
                className="ebook-prose dark:text-dark-ink"
                dangerouslySetInnerHTML={{ __html: chapter.html }}
              />

              {/* Prev / Next navigation */}
              <div className="mt-12 pt-6 border-t border-divider dark:border-dark-border flex items-center justify-between gap-4">
                <button
                  onClick={() => { setActiveChapter(i => Math.max(0, i - 1)); window.scrollTo({ top: 0 }); }}
                  disabled={activeChapter === 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-divider dark:border-dark-border text-sm font-semibold text-ink dark:text-dark-ink hover:border-primary hover:text-primary transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-xs text-muted dark:text-dark-muted font-mono">{activeChapter + 1} / {content.chapters.length}</span>
                <button
                  onClick={() => { setActiveChapter(i => Math.min(content.chapters.length - 1, i + 1)); window.scrollTo({ top: 0 }); }}
                  disabled={activeChapter === content.chapters.length - 1}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold shadow-primary-glow hover:bg-primary-dark transition disabled:opacity-30 disabled:cursor-not-allowed magnetic-btn"
                >
                  Next →
                </button>
              </div>
            </article>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <BookOpen className="w-16 h-16 text-muted dark:text-dark-muted mb-4" />
              <h2 className="font-display font-bold text-2xl text-ink dark:text-dark-ink mb-2">
                Ebook content loading…
              </h2>
              <p className="text-muted dark:text-dark-muted max-w-sm">
                The Grade {gradeKey} ebook chapters will appear here. PDF conversion populates this content.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
