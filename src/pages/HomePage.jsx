import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { Shield, Award, BookOpen, CheckSquare, ArrowRight, Zap } from 'lucide-react';

/* ---- Signature animation: Security spark/shield particle ---- */
const FOOTER_YEAR = new Date().getFullYear();
function SparkAnimation() {
  const sparks = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${10 + i * 11}%`,
    delay: `${i * 0.4}s`,
    duration: `${2.2 + (i % 3) * 0.6}s`,
    size: i % 2 === 0 ? 14 : 10,
  }));

  return (
    <div className="relative h-44 rounded-3xl overflow-hidden select-none"
      style={{ background: 'linear-gradient(180deg, #F3EFE8 0%, #D9CFBC 70%, #B8A788 100%)' }}>
      {/* I-beam source */}
      <svg viewBox="0 0 300 24" className="absolute top-4 inset-x-4 h-6" fill="none">
        <rect x="0" y="8" width="300" height="8" rx="4" fill="#8B7355" />
        <rect x="0" y="0" width="300" height="4" rx="2" fill="#6B5840" />
        <rect x="0" y="20" width="300" height="4" rx="2" fill="#6B5840" />
        {[0,50,100,150,200,250].map(x => (
          <rect key={x} x={x} y="0" width="12" height="24" rx="2" fill="#7A6248" />
        ))}
      </svg>

      {/* Spark particles */}
      {sparks.map(s => (
        <div
          key={s.id}
          className="absolute spark-particle"
          style={{
            left: s.left,
            top: '24px',
            animationDuration: s.duration,
            animationDelay: s.delay,
          }}
        >
          <svg width={s.size} height={s.size * 1.4} viewBox="0 0 14 20" fill="none">
            {/* 4-point welding spark */}
            <path d="M7 0 L8.5 7 L14 7 L9 11 L11 20 L7 14 L3 20 L5 11 L0 7 L5.5 7 Z"
              fill="url(#sparkGrad)" opacity="0.9" />
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#E8610A" />
                <stop offset="100%" stopColor="#C4510A" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ))}

      {/* Foundation surface */}
      <svg viewBox="0 0 300 12" className="absolute bottom-10 inset-x-0 w-full h-3" fill="none">
        <path d="M0 6 Q75 0 150 6 Q225 12 300 6" stroke="#8B7355" strokeWidth="2" fill="none" />
      </svg>

      {/* Ripples */}
      {[40, 140, 240].map((cx, i) => (
        <div key={i} className="absolute spark-ripple rounded-full border-2 border-primary/40 w-8 h-8"
          style={{ bottom: '28px', left: `${cx}px`, marginLeft: '-16px', animationDelay: `${i * 0.6}s`, animationDuration: '1.8s' }} />
      ))}

      {/* Status label */}
      <div className="absolute bottom-3 inset-x-4 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B5840]">Security Level</span>
        <span className="text-[10px] font-mono font-bold text-primary uppercase">Active Training</span>
      </div>
    </div>
  );
}

/* ---- Grade card ---- */
function GradeCard({ grade, title, description, modules, color }) {
  return (
    <Link to={`/ebook/${grade}`} className="group block">
      <div className="bg-surface dark:bg-dark-surface rounded-3xl p-7 border border-divider dark:border-dark-border shadow-card dark:shadow-card-dark hover:shadow-primary-glow hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="flex items-center justify-between mb-5">
          <span className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl font-display font-black text-2xl text-white shadow-lg`}
            style={{ background: color }}>
            {grade}
          </span>
          <span className="text-xs font-mono text-muted dark:text-dark-muted uppercase tracking-widest">{modules} modules</span>
        </div>
        <h3 className="font-display font-bold text-xl text-ink dark:text-dark-ink mb-2">{title}</h3>
        <p className="text-sm text-muted dark:text-dark-muted leading-relaxed mb-5">{description}</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
          Study Ebook <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

/* ---- Stat pill ---- */
function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-4xl sm:text-5xl font-display font-black gradient-text mb-1">{value}</div>
      <div className="text-sm font-medium text-muted dark:text-dark-muted">{label}</div>
    </div>
  );
}

export function HomePage() {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20 px-6 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 grid-bg opacity-60 dark:opacity-30" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:from-dark-bg dark:via-dark-bg dark:to-primary/10" />
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-2xl rounded-full bg-primary/5 blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div className="animate-slide-up">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary ring-pulse" />
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-primary">PSIRA Accredited Training</span>
            </div>

            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-ink dark:text-dark-ink leading-[1.05] tracking-tight mb-6">
              Train.{' '}
              <span className="gradient-text">Qualify.</span>
              <br />Protect.
            </h1>

            <p className="text-lg sm:text-xl text-muted dark:text-dark-muted leading-relaxed mb-10 max-w-xl font-body">
              South Africa's dedicated PSIRA security training platform — study the official Grade E, D and C curriculum, quiz yourself on every module and take timed exam simulations.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/academy"
                className="magnetic-btn inline-flex items-center gap-2 px-7 py-4 bg-primary text-white rounded-full font-display font-bold text-base shadow-primary-glow">
                Start Training
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/ebook/E"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-display font-bold text-base border-2 border-divider dark:border-dark-border text-ink dark:text-dark-ink hover:border-primary hover:text-primary transition-colors">
                <BookOpen className="w-5 h-5" />
                Read Ebooks
              </Link>
            </div>
          </div>

          {/* Right — signature animation + grade cards */}
          <div className="flex flex-col gap-5">
            <SparkAnimation />
            <div className="grid grid-cols-3 gap-3">
              {[
                { grade: 'E', label: 'Foundation', color: '#16a34a' },
                { grade: 'D', label: 'Intermediate', color: '#E8610A' },
                { grade: 'C', label: 'Advanced', color: '#7c3aed' },
              ].map(g => (
                <Link key={g.grade} to={`/ebook/${g.grade}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border hover:border-primary hover:shadow-primary-glow transition-all duration-200 group">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-lg text-white"
                    style={{ background: g.color }}>{g.grade}</span>
                  <span className="text-xs font-medium text-muted dark:text-dark-muted">{g.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="py-16 px-6 border-y border-divider dark:border-dark-border bg-surface dark:bg-dark-surface">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-10">
          <Stat value="3" label="Grade levels" />
          <Stat value="PSIRA" label="Accredited" />
          <Stat value="100%" label="Offline-ready" />
          <Stat value="E–C" label="Full curriculum" />
        </div>
      </section>

      {/* ===== GRADE CARDS ===== */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Curriculum</p>
          <h2 className="font-display font-black text-4xl sm:text-5xl text-ink dark:text-dark-ink tracking-tight">
            Study the Official Grades
          </h2>
          <p className="mt-4 text-muted dark:text-dark-muted text-lg max-w-xl mx-auto">
            Each grade has a full HTML ebook with chapter navigation, plus quizzes and exam simulations.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <GradeCard
            grade="E"
            title="Grade E — Security Foundation"
            description="Entry-level security officer training covering basic law, access control, patrolling, and emergency response."
            modules={8}
            color="#16a34a"
          />
          <GradeCard
            grade="D"
            title="Grade D — Intermediate Officer"
            description="Builds on Grade E with advanced guarding, armed response theory, conflict management and legal powers."
            modules={10}
            color="#E8610A"
          />
          <GradeCard
            grade="C"
            title="Grade C — Senior Security"
            description="Advanced supervision, investigations, firearms handling, control room operations and management skills."
            modules={12}
            color="#7c3aed"
          />
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 px-6 bg-deep text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Features</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tight">Everything you need to pass</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-3xl overflow-hidden">
            {[
              { icon: <BookOpen className="w-6 h-6" />, title: 'Full HTML Ebooks', desc: 'Complete Grade E, D & C textbooks converted to readable HTML with chapter navigation.' },
              { icon: <CheckSquare className="w-6 h-6" />, title: 'Module Quizzes', desc: 'Practice quiz per module with answer-locking, instant feedback and hints.' },
              { icon: <Award className="w-6 h-6" />, title: 'Exam Simulation', desc: '2-hour timed exam simulation matching the official PSIRA format.' },
              { icon: <Zap className="w-6 h-6" />, title: 'Instant Corrections', desc: 'Every quiz and exam breaks down each answer with plain-English explanations.' },
            ].map((f, i) => (
              <div key={i} className="p-8 bg-dark-surface hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-5">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PSIRA TRUST ===== */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <div className="text-left">
            <div className="font-display font-bold text-ink dark:text-dark-ink text-lg">PSIRA Accredited Provider</div>
            <div className="text-xs text-muted dark:text-dark-muted font-mono">Private Security Industry Regulatory Authority — South Africa</div>
          </div>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-4xl text-ink dark:text-dark-ink tracking-tight mb-4">
          Ready to start your security career?
        </h2>
        <p className="text-muted dark:text-dark-muted text-lg mb-8">
          McMaster Skool provides the complete PSIRA study experience — offline-ready, no login required.
        </p>
        <Link to="/academy"
          className="magnetic-btn inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-display font-bold text-base shadow-primary-glow">
          Begin Your Training
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-divider dark:border-dark-border py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-ink dark:text-dark-ink">McMaster Skool</span>
              <p className="text-xs text-muted dark:text-dark-muted">PSIRA-Accredited Security Training</p>
            </div>
          </div>
          <p className="text-xs text-muted dark:text-dark-muted">
            © {FOOTER_YEAR} McMaster Skool. Grades E, D & C — South Africa.
          </p>
        </div>
      </footer>
    </div>
  );
}
