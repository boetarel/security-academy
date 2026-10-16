import React from 'react';
import { CheckSquare, ArrowRight, RotateCcw, Clock } from 'lucide-react';

export const QuizModulePicker = ({
  grade,
  gradeData,
  progress,
  onQuizStart
}) => {
  const modules = gradeData?.modules || [];

  const completedCount = modules.filter(m => progress.moduleQuizResults[m.id]?.attempts?.length > 0).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-slate-100 via-surface to-slate-100 dark:from-slate-900 dark:via-[#10182D] dark:to-slate-900 border border-divider dark:border-dark-border rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 font-mono text-xs font-bold border border-blue-300 dark:border-blue-500/30">
                PRACTICE QUIZZES
              </span>
              <span className="text-xs text-muted dark:text-dark-muted">20 questions per module • Pass mark 60%</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink dark:text-white tracking-tight">
              Grade {grade} — Choose a Module Quiz
            </h1>
            <p className="text-ink dark:text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Test your knowledge module by module. Instant explanations after each question, and missed-question drills when you finish.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-background dark:bg-dark-bg/80 border border-divider dark:border-dark-border rounded-xl p-3 text-center min-w-[100px]">
              <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{completedCount}/{modules.length}</div>
              <div className="text-[11px] text-muted dark:text-dark-muted font-medium">Attempted</div>
            </div>
            <div className="bg-background dark:bg-dark-bg/80 border border-divider dark:border-dark-border rounded-xl p-3 text-center min-w-[100px]">
              <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">60%</div>
              <div className="text-[11px] text-muted dark:text-dark-muted font-medium">Pass Mark</div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => {
          const attempts = progress.moduleQuizResults[mod.id]?.attempts || [];
          const lastAttempt = attempts.length ? attempts[attempts.length - 1] : null;
          const hasPassed = attempts.some(a => a.percentage >= 60);

          return (
            <div
              key={mod.id}
              className={`p-5 rounded-2xl border transition shadow-sm bg-surface dark:bg-dark-surface flex flex-col ${
                lastAttempt
                  ? hasPassed
                    ? 'border-emerald-300 dark:border-emerald-500/30'
                    : 'border-red-300 dark:border-red-500/30'
                  : 'border-divider dark:border-dark-border'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 border ${
                  lastAttempt
                    ? hasPassed
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/40'
                      : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-500/40'
                    : 'bg-background dark:bg-dark-bg text-muted dark:text-dark-muted border-divider dark:border-dark-border'
                }`}>
                  {mod.number}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-ink dark:text-white leading-snug mb-1">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-muted dark:text-slate-400 leading-normal">
                    {mod.summary}
                  </p>
                </div>

                {lastAttempt && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                    hasPassed
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/30'
                      : 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-500/30'
                  }`}>
                    {lastAttempt.percentage}%
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-divider dark:border-dark-border flex items-center justify-between gap-3">
                <div className="text-[11px] text-muted dark:text-dark-muted flex items-center gap-1.5">
                  {lastAttempt ? (
                    <>
                      <RotateCcw className="w-3 h-3" />
                      <span>{attempts.length} attempt{attempts.length > 1 ? 's' : ''} • last: {lastAttempt.score}/{lastAttempt.total}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" />
                      <span>Not attempted yet</span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => onQuizStart(mod.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{lastAttempt ? 'Retake Quiz' : 'Start Quiz'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
