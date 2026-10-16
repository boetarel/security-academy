import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Shield, AlertTriangle, Bookmark, ArrowRight, ArrowLeft, Send, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleOptions } from '../utils/shuffle.js';

export const ExamView = ({
  grade,
  officialExamsData,
  onSaveExamResult,
  onBackToQuizzes,
  onExamActiveChange
}) => {
  const exam = officialExamsData[grade];
  const [examRunId, setExamRunId] = useState(0);

  // Flatten all questions across all sections (options shuffled per exam run)
  const flatQuestions = useMemo(() => {
    const flat = [];
    if (exam?.sections) {
      exam.sections.forEach((sec, sIdx) => {
        sec.questions.forEach((q) => {
          flat.push({
            ...q,
            sectionName: sec.section,
            sectionTitle: sec.title,
            moduleNumber: sec.moduleNumber,
            sectionIndex: sIdx,
            globalIndex: flat.length
          });
        });
      });
    }
    return shuffleOptions(flat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, examRunId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: ['A', ...] }
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { [qId]: true }
  const [secondsRemaining, setSecondsRemaining] = useState(exam?.durationMinutes ? exam.durationMinutes * 60 : 7200);
  const [isExamActive, setIsExamActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [examResultData, setExamResultData] = useState(null);

  const currentQ = flatQuestions[currentIndex];

  // Hide the shell's grade/tab controls while the exam is running
  useEffect(() => {
    onExamActiveChange?.(isExamActive);
  }, [isExamActive, onExamActiveChange]);

  const handleStartExam = () => {
    setExamRunId(r => r + 1);
    setIsExamActive(true);
    setSubmitted(false);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setSecondsRemaining((exam?.durationMinutes || 120) * 60);
  };

  const handleSelectOption = (optionId) => {
    if (!isExamActive || submitted || !currentQ) return;
    const current = userAnswers[currentQ.id] || [];

    if (currentQ.isMultipleSelect) {
      if (current.includes(optionId)) {
        setUserAnswers({
          ...userAnswers,
          [currentQ.id]: current.filter(x => x !== optionId)
        });
      } else {
        setUserAnswers({
          ...userAnswers,
          [currentQ.id]: [...current, optionId]
        });
      }
    } else {
      setUserAnswers({
        ...userAnswers,
        [currentQ.id]: [optionId]
      });
    }
  };

  const toggleFlagCurrent = () => {
    if (!currentQ) return;
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const jumpToQuestion = (idx) => {
    setCurrentIndex(idx);
  };

  const handleAutoSubmit = () => {
    finalizeSubmission();
  };

  const finalizeSubmission = () => {
    let totalMarksEarned = 0;
    const sectionBreakdown = {};
    const wrongQs = [];

    exam.sections.forEach((sec) => {
      let secEarned = 0;
      sec.questions.forEach((q) => {
        const uAns = (userAnswers[q.id] || []).slice().sort();
        const cAns = (q.correctAnswers || []).slice().sort();
        const isMatch = uAns.length === cAns.length && uAns.every((v, i) => v === cAns[i]);

        if (isMatch) {
          totalMarksEarned += q.marks;
          secEarned += q.marks;
        } else {
          wrongQs.push(q.id);
        }
      });

      const secPercentage = Math.round((secEarned / sec.totalMarks) * 100);
      sectionBreakdown[sec.title] = {
        earned: secEarned,
        total: sec.totalMarks,
        percentage: secPercentage,
        passed: secPercentage >= 60,
        moduleNumber: sec.moduleNumber
      };
    });

    const overallPercentage = Math.round((totalMarksEarned / exam.totalMarks) * 100);
    const allSectionsPassed = Object.values(sectionBreakdown).every(s => s.passed);
    const overallPassed = overallPercentage >= 60 && allSectionsPassed;

    const result = {
      grade,
      score: totalMarksEarned,
      totalMarks: exam.totalMarks,
      percentage: overallPercentage,
      passed: overallPassed,
      date: new Date().toLocaleDateString(),
      sectionScores: sectionBreakdown,
      answers: userAnswers,
      wrongQuestions: wrongQs
    };

    setExamResultData(result);
    setSubmitted(true);
    setIsExamActive(false);
    setShowSubmitModal(false);

    if (overallPassed) {
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    onSaveExamResult(result);
  };

  // Timer countdown
  useEffect(() => {
    let timer = null;
    if (isExamActive && !submitted && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExamActive, submitted, secondsRemaining]);

  const formatTimer = (secs) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hours}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Counts for modal
  const totalAnsweredCount = Object.keys(userAnswers).filter(k => userAnswers[k].length > 0).length;
  const totalUnansweredCount = flatQuestions.length - totalAnsweredCount;
  const totalFlaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  // Render Start Screen
  if (!isExamActive && !submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border rounded-3xl p-6 sm:p-10 shadow-card dark:shadow-card-dark text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 mx-auto flex items-center justify-center mb-6">
            <Shield className="w-8 h-8" />
          </div>

          <div className="inline-block px-3 py-1 rounded bg-background dark:bg-dark-bg text-muted dark:text-dark-muted font-mono text-xs mb-3 border border-divider dark:border-dark-border">
            {exam.docNo} • Issued: {exam.dateIssued}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-ink dark:text-dark-ink tracking-tight mb-2">
            {exam.title}
          </h1>
          <p className="text-muted dark:text-dark-muted text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Authentic South African PSIRA simulation following the official Wise Guy Academy examination question paper.
          </p>

          {/* Exam Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="p-4 rounded-xl bg-background dark:bg-dark-bg border border-divider dark:border-dark-border">
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">{exam.totalMarks}</div>
              <div className="text-[11px] text-muted dark:text-dark-muted uppercase font-bold">Total Marks</div>
            </div>
            <div className="p-4 rounded-xl bg-background dark:bg-dark-bg border border-divider dark:border-dark-border">
              <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">{exam.durationMinutes}m</div>
              <div className="text-[11px] text-muted dark:text-dark-muted uppercase font-bold">Time Limit</div>
            </div>
            <div className="p-4 rounded-xl bg-background dark:bg-dark-bg border border-divider dark:border-dark-border">
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{exam.passMarkPercent}%</div>
              <div className="text-[11px] text-muted dark:text-dark-muted uppercase font-bold">Pass Threshold</div>
            </div>
            <div className="p-4 rounded-xl bg-background dark:bg-dark-bg border border-divider dark:border-dark-border">
              <div className="text-2xl font-black font-mono text-ink dark:text-dark-ink">{exam.sections.length}</div>
              <div className="text-[11px] text-muted dark:text-dark-muted uppercase font-bold">Sections</div>
            </div>
          </div>

          {/* Regulatory Exam Rules */}
          <div className="text-left bg-background dark:bg-dark-bg border border-divider dark:border-dark-border rounded-2xl p-5 mb-8">
            <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Rules of the Examination</span>
            </h3>
            <ul className="space-y-2 text-xs text-ink dark:text-dark-muted">
              {exam.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
              <li className="flex items-start gap-2 font-semibold text-amber-700 dark:text-amber-300 pt-1">
                <span className="text-amber-600 dark:text-amber-400">★</span>
                <span>Critical PSIRA Requirement: You must score at least 60% in EVERY individual module section to pass the exam!</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 transition text-sm tracking-wide"
          >
            I am Ready — Begin Official 2-Hour Exam
          </button>
        </div>
      </div>
    );
  }

  // Render Post-Exam Results
  if (submitted && examResultData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Results Banner */}
        <div className={`rounded-3xl p-6 sm:p-10 border mb-8 text-center shadow-2xl ${
          examResultData.passed
            ? 'bg-gradient-to-b from-emerald-50 to-surface border-emerald-500/40 dark:from-emerald-950/60 dark:to-dark-surface'
            : 'bg-gradient-to-b from-red-50 to-surface border-red-500/40 dark:from-red-950/60 dark:to-dark-surface'
        }`}>
          <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-4 ${
            examResultData.passed
              ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40'
              : 'bg-red-100 text-red-600 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40'
          }`}>
            {examResultData.passed ? <Award className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>

          <div className="text-xs font-mono font-bold tracking-wider uppercase mb-1 text-muted dark:text-dark-muted">
            Official Examination Result Certificate
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-ink dark:text-dark-ink mb-2">
            {examResultData.passed ? 'QUALIFIED / COMPETENT' : 'NOT YET COMPETENT'}
          </h2>
          <p className="text-sm text-ink dark:text-dark-muted max-w-lg mx-auto mb-6">
            {examResultData.passed
              ? 'Congratulations! You have satisfied all PSIRA regulatory benchmarks and achieved 60%+ in every section.'
              : 'You have not met the mandatory 60% requirement in one or more sections. Review the breakdown below and practice weak areas.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-surface dark:bg-dark-bg border border-divider dark:border-dark-border rounded-xl px-5 py-3 min-w-[130px]">
              <div className="text-2xl font-black font-mono text-ink dark:text-dark-ink">
                {examResultData.score} / {examResultData.totalMarks}
              </div>
              <div className="text-[11px] text-muted dark:text-dark-muted uppercase font-semibold">Total Marks</div>
            </div>

            <div className="bg-surface dark:bg-dark-bg border border-divider dark:border-dark-border rounded-xl px-5 py-3 min-w-[130px]">
              <div className={`text-2xl font-black font-mono ${
                examResultData.percentage >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {examResultData.percentage}%
              </div>
              <div className="text-[11px] text-muted dark:text-dark-muted uppercase font-semibold">Overall Score</div>
            </div>

            <div className="bg-surface dark:bg-dark-bg border border-divider dark:border-dark-border rounded-xl px-5 py-3 min-w-[130px]">
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                {examResultData.passed ? 'PASSED' : 'FAILED'}
              </div>
              <div className="text-[11px] text-muted dark:text-dark-muted uppercase font-semibold">Status</div>
            </div>
          </div>
        </div>

        {/* Section by Section PSIRA Compliance Matrix */}
        <div className="bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border rounded-2xl p-6 mb-8 shadow-card dark:shadow-card-dark">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink dark:text-dark-muted mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Sectional Competency Breakdown (60% Minimum Per Section)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(examResultData.sectionScores).map(([title, sData]) => (
              <div
                key={title}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  sData.passed
                    ? 'bg-surface dark:bg-dark-bg border-emerald-500/30'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-500/40'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-ink dark:text-dark-ink leading-tight">
                    {title}
                  </div>
                  <div className="text-[11px] text-muted dark:text-dark-muted mt-1">
                    Marks: <span className="font-mono text-ink dark:text-dark-ink">{sData.earned} / {sData.total}</span> ({sData.percentage}%)
                  </div>
                </div>

                <div className={`px-2.5 py-1 rounded text-xs font-mono font-bold shrink-0 ${
                  sData.passed
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-red-100 text-red-700 border border-red-500/40 dark:bg-red-950 dark:text-red-300'
                }`}>
                  {sData.passed ? 'PASSED' : 'FAILED'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <button
            onClick={handleStartExam}
            className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20 text-xs sm:text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Full Official Exam</span>
          </button>
          <button
            onClick={onBackToQuizzes}
            className="flex items-center gap-2 px-5 py-3 bg-background dark:bg-dark-surface hover:bg-divider dark:hover:bg-dark-bg text-ink dark:text-dark-ink font-semibold rounded-xl border border-divider dark:border-dark-border transition text-xs sm:text-sm"
          >
            <span>Back to Quizzes</span>
          </button>
        </div>

        {/* Complete Examination Paper Corrections */}
        <div>
          <h3 className="text-base font-bold text-ink dark:text-dark-ink mb-4">
            Exam Corrections & Comprehensive Rationale
          </h3>

          <div className="space-y-4">
            {flatQuestions.map((q, idx) => {
              const uAns = (userAnswers[q.id] || []).slice().sort();
              const cAns = (q.correctAnswers || []).slice().sort();
              const isCorrect = uAns.length === cAns.length && uAns.every((v, i) => v === cAns[i]);

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border ${
                    isCorrect
                      ? 'bg-surface dark:bg-dark-bg border-divider dark:border-dark-border'
                      : 'bg-red-50 dark:bg-red-950/20 border-red-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase mb-1">
                        {q.sectionName} • {q.sectionTitle} (Marks: {q.marks})
                      </div>
                      <div className="text-sm font-bold text-ink dark:text-dark-ink leading-snug">
                        Q{idx + 1}. {q.questionText}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {isCorrect ? `+${q.marks} MARKS` : '0 MARKS'}
                    </span>
                  </div>

                  <div className="text-xs text-muted dark:text-dark-muted mb-3">
                    <span>Your Answer: <strong className="text-ink dark:text-dark-ink">{uAns.join(', ') || 'None selected'}</strong></span>
                    {' • '}
                    <span>Correct Answer: <strong className="text-emerald-600 dark:text-emerald-400">{cAns.join(', ')}</strong></span>
                  </div>

                  <div className="p-3 bg-background dark:bg-dark-bg rounded-lg border border-divider dark:border-dark-border text-xs text-ink dark:text-dark-muted space-y-1">
                    <div><strong className="text-muted dark:text-dark-muted">Manual Rationale: </strong>{q.explanation}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Exam View
  const isTimerCritical = secondsRemaining < 300; // < 5 mins
  const isTimerWarning = secondsRemaining < 900; // < 15 mins

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Persistent Exam Status Bar */}
      <div className="sticky top-20 z-40 bg-surface/95 dark:bg-dark-surface/95 border border-divider dark:border-dark-border rounded-2xl p-4 mb-6 shadow-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
            {currentQ?.sectionName}: {currentQ?.sectionTitle}
          </div>
          <h2 className="text-base font-bold text-ink dark:text-dark-ink">
            Grade {grade} Examination
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Display */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm font-black transition ${
            isTimerCritical
              ? 'bg-red-50 dark:bg-red-950/80 border-red-500 text-red-600 dark:text-red-300 animate-pulse'
              : isTimerWarning
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300'
              : 'bg-background dark:bg-dark-bg border-divider dark:border-dark-border text-ink dark:text-dark-ink'
          }`}>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {/* Flag Question Button */}
          <button
            onClick={toggleFlagCurrent}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              flaggedQuestions[currentQ?.id]
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-background dark:bg-dark-surface text-muted dark:text-dark-muted border-divider dark:border-dark-border hover:text-ink dark:hover:text-dark-ink'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{flaggedQuestions[currentQ?.id] ? 'Flagged' : 'Flag for Review'}</span>
          </button>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Question Workspace */}
        <div className="lg:col-span-8 bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between text-xs text-muted dark:text-dark-muted mb-4 pb-3 border-b border-divider dark:border-dark-border">
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
              QUESTION {currentIndex + 1} OF {flatQuestions.length} (MARKS: {currentQ?.marks})
            </span>
            <span className="text-muted dark:text-dark-muted">
              {currentQ?.isMultipleSelect ? 'Multiple Select' : 'Single Select'}
            </span>
          </div>

          <p className="text-lg font-bold text-ink dark:text-dark-ink leading-relaxed mb-6">
            {currentQ?.questionText}
          </p>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQ?.options.map((opt) => {
              const isSelected = (userAnswers[currentQ?.id] || []).includes(opt.id);

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-4 ${
                    isSelected
                      ? 'bg-amber-100/60 dark:bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-100 shadow-sm'
                      : 'bg-background dark:bg-dark-bg border-divider dark:border-dark-border text-ink dark:text-dark-ink hover:border-primary'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-divider dark:bg-dark-surface text-muted dark:text-dark-muted border-divider dark:border-dark-border'
                  }`}>
                    {opt.id}
                  </div>
                  <div className="text-sm font-medium leading-relaxed pt-1">
                    {opt.text}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Nav Bar */}
          <div className="pt-4 border-t border-divider dark:border-dark-border flex items-center justify-between">
            <button
              disabled={currentIndex === 0}
              onClick={() => jumpToQuestion(currentIndex - 1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-background dark:bg-dark-bg hover:bg-divider dark:hover:bg-dark-border disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold rounded-lg text-ink dark:text-dark-ink border border-divider dark:border-dark-border transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={currentIndex === flatQuestions.length - 1}
              onClick={() => jumpToQuestion(currentIndex + 1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold rounded-lg text-white transition shadow-md"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Persistent Question Palette Grid */}
        <div className="lg:col-span-4 bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border rounded-2xl p-5 shadow-card dark:shadow-card-dark lg:sticky lg:top-44">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-divider dark:border-dark-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-dark-ink">
              Question Palette
            </h3>
            <span className="text-xs font-mono text-muted dark:text-dark-muted">
              {totalAnsweredCount} / {flatQuestions.length} Done
            </span>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-ink dark:text-dark-muted mb-4 pb-3 border-b border-divider dark:border-dark-border font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-background dark:bg-dark-bg border border-divider dark:border-dark-border" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span>Flagged</span>
            </div>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {flatQuestions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const hasAnswer = (userAnswers[q.id] || []).length > 0;
              const isFlagged = flaggedQuestions[q.id];

              let tileClass = 'bg-background dark:bg-dark-bg border-divider dark:border-dark-border text-muted dark:text-dark-muted';

              if (isFlagged) {
                tileClass = 'bg-amber-100 dark:bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 font-bold';
              } else if (hasAnswer) {
                tileClass = 'bg-emerald-100 dark:bg-emerald-600/25 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
              }

              if (isCurrent) {
                tileClass += ' ring-2 ring-blue-500 ring-offset-2 ring-offset-surface dark:ring-offset-dark-surface';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(idx)}
                  className={`h-9 rounded-lg text-xs font-mono flex items-center justify-center transition border relative ${tileClass}`}
                  title={`Question ${idx + 1}`}
                >
                  <span>{idx + 1}</span>
                  {isFlagged && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-ink dark:text-dark-ink mb-2">
              Confirm Final Examination Submission
            </h3>
            <p className="text-xs text-muted dark:text-dark-muted mb-6">
              Review your progress summary before submitting your official test paper for grading.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="p-3 bg-background dark:bg-dark-bg rounded-xl text-center border border-divider dark:border-dark-border">
                <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{totalAnsweredCount}</div>
                <div className="text-[10px] text-muted dark:text-dark-muted uppercase">Answered</div>
              </div>
              <div className="p-3 bg-background dark:bg-dark-bg rounded-xl text-center border border-divider dark:border-dark-border">
                <div className="text-xl font-mono font-bold text-red-600 dark:text-red-400">{totalUnansweredCount}</div>
                <div className="text-[10px] text-muted dark:text-dark-muted uppercase">Unanswered</div>
              </div>
              <div className="p-3 bg-background dark:bg-dark-bg rounded-xl text-center border border-divider dark:border-dark-border">
                <div className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400">{totalFlaggedCount}</div>
                <div className="text-[10px] text-muted dark:text-dark-muted uppercase">Flagged</div>
              </div>
            </div>

            {totalUnansweredCount > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-500/30 rounded-xl mb-6 text-xs text-red-700 dark:text-red-300">
                Warning: You still have {totalUnansweredCount} unanswered questions! Unanswered questions receive zero marks.
              </div>
            )}

            <label className="flex items-start gap-3 text-xs text-ink dark:text-dark-muted cursor-pointer select-none mb-6">
              <input
                type="checkbox"
                checked={confirmCheckbox}
                onChange={e => setConfirmCheckbox(e.target.checked)}
                className="rounded bg-surface dark:bg-dark-surface border-divider dark:border-dark-border text-amber-500 focus:ring-amber-500 mt-0.5"
              />
              <span>I confirm that I have reviewed my answers and am ready to submit my final exam paper.</span>
            </label>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2.5 bg-background dark:bg-dark-bg hover:bg-divider dark:hover:bg-dark-border text-ink dark:text-dark-ink text-xs font-semibold rounded-xl border border-divider dark:border-dark-border transition"
              >
                Back to Exam
              </button>
              <button
                disabled={!confirmCheckbox}
                onClick={finalizeSubmission}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20"
              >
                Confirm & Submit Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
