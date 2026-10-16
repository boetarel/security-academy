import React, { useState, useEffect } from 'react';
import { CheckCircle2, HelpCircle, ArrowRight, ArrowLeft, RotateCcw, Clock, Award, ShieldAlert, Sparkles, X, ListChecks } from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleOptions } from '../utils/shuffle.js';

export const QuizView = ({
  grade,
  moduleId,
  practiceQuestions,
  curriculumData,
  onSaveQuizResult,
  onBackToModules,
  onAttemptChange
}) => {
  const currentGradeData = curriculumData[grade];
  const moduleInfo = currentGradeData?.modules?.find(m => m.id === moduleId) || currentGradeData?.modules?.[0];

  const allModuleQuestions = (practiceQuestions[grade] || []).filter(q => q.moduleId === moduleId);

  const [questions, setQuestions] = useState(() => shuffleOptions(allModuleQuestions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qId]: ['A', ...] }
  const [submitted, setSubmitted] = useState(false);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [revealedQuestions, setRevealedQuestions] = useState({}); // { [qId]: true }
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null); // 'finish' | 'exit' | null

  const startQuiz = (qs) => {
    setQuestions(shuffleOptions(qs));
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setRevealedQuestions({});
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setConfirmAction(null);
  };

  // Reset quiz state when the module or grade changes (adjust state during render)
  const [lastQuizKey, setLastQuizKey] = useState(`${grade}:${moduleId}`);
  if (lastQuizKey !== `${grade}:${moduleId}`) {
    setLastQuizKey(`${grade}:${moduleId}`);
    startQuiz((practiceQuestions[grade] || []).filter(q => q.moduleId === moduleId));
  }

  // Report attempt-active state so the shell can hide grade tabs mid-attempt
  useEffect(() => {
    onAttemptChange?.(true);
    return () => onAttemptChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (submitted) onAttemptChange?.(false);
  }, [submitted, onAttemptChange]);

  // Timer tick
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !submitted) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, submitted]);

  const currentQ = questions[currentIndex];
  const answeredCount = questions.filter(q => (selectedAnswers[q.id] || []).length > 0).length;
  const unansweredCount = questions.length - answeredCount;

  const handleSelectOption = (optionId) => {
    if (submitted) return;
    const currentSelected = selectedAnswers[currentQ.id] || [];

    if (currentQ.isMultipleSelect) {
      if (currentSelected.includes(optionId)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQ.id]: currentSelected.filter(id => id !== optionId)
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQ.id]: [...currentSelected, optionId]
        });
      }
    } else {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQ.id]: [optionId]
      });
      if (instantFeedback) {
        setRevealedQuestions(prev => ({ ...prev, [currentQ.id]: true }));
      }
    }
  };

  const handleRevealExplanation = () => {
    setRevealedQuestions(prev => ({ ...prev, [currentQ.id]: true }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    const wrongIds = [];

    questions.forEach(q => {
      const userAns = (selectedAnswers[q.id] || []).slice().sort();
      const correctAns = (q.correctAnswers || []).slice().sort();

      const isMatch = userAns.length === correctAns.length &&
        userAns.every((val, idx) => val === correctAns[idx]);

      if (isMatch) {
        correctCount += 1;
      } else {
        wrongIds.push(q.id);
      }
    });

    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    return { score: correctCount, total: questions.length, percentage, wrongIds };
  };

  const handleSubmitQuiz = () => {
    const { score, total, percentage, wrongIds } = calculateScore();
    setSubmitted(true);
    setIsTimerRunning(false);
    setConfirmAction(null);

    if (percentage >= 60) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    onSaveQuizResult({
      moduleId,
      score,
      total,
      percentage,
      date: new Date().toLocaleDateString(),
      answers: selectedAnswers,
      wrongQuestionIds: wrongIds
    });
  };

  const handleRetakeWrongOnly = () => {
    const { wrongIds } = calculateScore();
    const wrongQs = allModuleQuestions.filter(q => wrongIds.includes(q.id));
    if (wrongQs.length === 0) return;
    startQuiz(wrongQs);
  };

  const handleResetFullQuiz = () => {
    startQuiz(allModuleQuestions);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  if (!currentQ && !submitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-ink dark:text-dark-ink">No questions found for this module.</h2>
        <button
          onClick={onBackToModules}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Back to All Modules
        </button>
      </div>
    );
  }

  const { score, total, percentage } = calculateScore();
  const isAnswered = (selectedAnswers[currentQ?.id] || []).length > 0;
  const isRevealed = submitted || revealedQuestions[currentQ?.id];

  return (
    <div className="max-w-7xl mx-auto">
      {!submitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: question + options (left-aligned) */}
          <div className="lg:col-span-2 bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border rounded-2xl p-6 shadow-card dark:shadow-card-dark">
            <div className="mb-5">
              <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mb-1">
                Grade {grade} • Module {moduleInfo?.number} Quiz
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-ink dark:text-dark-ink text-left">
                {moduleInfo?.title}
              </h1>
            </div>

            <div className="mb-4 text-left">
              <div className="text-xs font-mono text-muted dark:text-dark-muted mb-1">
                QUESTION {currentIndex + 1} OF {questions.length}
                {currentQ.isMultipleSelect && ' • SELECT ALL THAT APPLY'}
              </div>
              <p className="text-base sm:text-lg font-semibold text-ink dark:text-dark-ink leading-relaxed text-left">
                {currentQ.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6 text-left">
              {currentQ.options.map((opt) => {
                const isSelected = (selectedAnswers[currentQ.id] || []).includes(opt.id);
                const isCorrect = currentQ.correctAnswers.includes(opt.id);

                let optionClass = 'bg-background dark:bg-dark-bg border-divider dark:border-dark-border text-ink dark:text-dark-ink hover:border-primary';

                if (isRevealed) {
                  if (isCorrect) {
                    optionClass = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200';
                  } else if (isSelected && !isCorrect) {
                    optionClass = 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-200';
                  }
                } else if (isSelected) {
                  optionClass = 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-800 dark:text-blue-100 shadow-sm';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-3.5 ${optionClass}`}
                  >
                    <div className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-divider dark:bg-dark-surface text-muted dark:text-dark-muted border-divider dark:border-dark-border'
                    }`}>
                      {opt.id}
                    </div>
                    <div className="text-sm font-medium leading-relaxed pt-0.5 text-left">
                      {opt.text}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation Box if Revealed */}
            {isRevealed && (
              <div className="mb-6 p-4 rounded-xl bg-background dark:bg-dark-bg border border-divider dark:border-dark-border space-y-3 text-left">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Question Breakdown & Explanation</span>
                </div>
                <div className="text-xs sm:text-sm text-ink dark:text-dark-muted leading-relaxed">
                  <span className="font-semibold text-ink dark:text-dark-ink">Manual Reference: </span>
                  {currentQ.manualExplanation}
                </div>
                <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-200/90 leading-relaxed bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg border border-amber-200 dark:border-amber-500/20">
                  <span className="font-semibold text-amber-700 dark:text-amber-300">Plain English: </span>
                  {currentQ.plainEnglishExplanation}
                </div>
              </div>
            )}

            {/* Bottom nav */}
            <div className="pt-4 border-t border-divider dark:border-dark-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(i => i - 1)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-background dark:bg-dark-bg hover:bg-divider dark:hover:bg-dark-border disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-lg text-ink dark:text-dark-ink border border-divider dark:border-dark-border transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {!isRevealed && isAnswered && !instantFeedback && (
                  <button
                    onClick={handleRevealExplanation}
                    className="px-3 py-2 bg-amber-50 dark:bg-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-lg border border-amber-300 dark:border-amber-500/30 transition flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Check Answer</span>
                  </button>
                )}
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(i => i + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-lg text-white transition shadow-md"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setConfirmAction('finish')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish Quiz</span>
                </button>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:sticky lg:top-40 space-y-4">
            {/* Timer */}
            <div className="bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border rounded-2xl p-4 shadow-card dark:shadow-card-dark flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Time Elapsed</span>
              </div>
              <div className="text-lg font-bold font-mono text-ink dark:text-dark-ink">
                {formatTime(timerSeconds)}
              </div>
            </div>

            {/* Instant hints toggle */}
            <label className="bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border rounded-2xl p-4 shadow-card dark:shadow-card-dark flex items-center justify-between cursor-pointer select-none">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Instant Hints</span>
              </div>
              <input
                type="checkbox"
                checked={instantFeedback}
                onChange={e => setInstantFeedback(e.target.checked)}
                className="rounded bg-background dark:bg-dark-bg border-divider dark:border-dark-border text-amber-500 focus:ring-amber-500"
              />
            </label>

            {/* Question palette */}
            <div className="bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border rounded-2xl p-4 shadow-card dark:shadow-card-dark">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted dark:text-dark-muted uppercase tracking-wider mb-3">
                <ListChecks className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Question Palette</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {questions.map((q, idx) => {
                  const isAnswered = (selectedAnswers[q.id] || []).length > 0;
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      title={`Question ${idx + 1}${isAnswered ? ' — answered' : ' — unanswered'}`}
                      className={`aspect-square rounded-lg text-xs font-mono font-bold border transition ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-500/40'
                          : isAnswered
                          ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500'
                          : 'bg-background dark:bg-dark-bg text-muted dark:text-dark-muted border-divider dark:border-dark-border hover:border-blue-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] font-mono text-muted dark:text-dark-muted mb-3">
                {answeredCount} of {questions.length} answered
                {unansweredCount > 0 && (
                  <span className="text-amber-600 dark:text-amber-400"> • {unansweredCount} unanswered</span>
                )}
              </div>

              <button
                onClick={() => setConfirmAction('finish')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish Quiz</span>
              </button>

              <button
                onClick={() => setConfirmAction('exit')}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-background dark:bg-dark-bg hover:bg-divider dark:hover:bg-dark-border text-ink dark:text-dark-ink text-xs font-semibold rounded-xl border border-divider dark:border-dark-border transition"
              >
                <X className="w-4 h-4" />
                <span>Exit Quiz</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center max-w-md mx-auto mb-8">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
              percentage >= 60
                ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                : 'bg-red-100 text-red-600 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
            }`}>
              {percentage >= 60 ? (
                <Award className="w-8 h-8" />
              ) : (
                <ShieldAlert className="w-8 h-8" />
              )}
            </div>

            <h2 className="text-2xl font-black text-ink dark:text-dark-ink mb-1">
              {percentage >= 60 ? 'Module Assessment Passed!' : 'Requires Revision'}
            </h2>
            <p className="text-xs text-muted dark:text-dark-muted">
              PSIRA standards mandate a minimum of 60% mastery on each module.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-background dark:bg-dark-bg border border-divider dark:border-dark-border flex items-center justify-around">
              <div>
                <div className="text-2xl font-black font-mono text-ink dark:text-dark-ink">{score} / {total}</div>
                <div className="text-[11px] text-muted dark:text-dark-muted uppercase font-semibold">Correct</div>
              </div>
              <div className="w-px h-8 bg-divider dark:bg-dark-border" />
              <div>
                <div className={`text-2xl font-black font-mono ${
                  percentage >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {percentage}%
                </div>
                <div className="text-[11px] text-muted dark:text-dark-muted uppercase font-semibold">Score</div>
              </div>
              <div className="w-px h-8 bg-divider dark:bg-dark-border" />
              <div>
                <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">{formatTime(timerSeconds)}</div>
                <div className="text-[11px] text-muted dark:text-dark-muted uppercase font-semibold">Time</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-divider dark:border-dark-border mb-8">
            {score < total && (
              <button
                onClick={handleRetakeWrongOnly}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Drill Missed Questions ({total - score})</span>
              </button>
            )}

            <button
              onClick={handleResetFullQuiz}
              className="flex items-center gap-2 px-4 py-2.5 bg-background dark:bg-dark-bg hover:bg-divider dark:hover:bg-dark-border text-ink dark:text-dark-ink text-xs font-semibold rounded-xl border border-divider dark:border-dark-border transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake All {questions.length} Questions</span>
            </button>

            <button
              onClick={onBackToModules}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Modules</span>
            </button>
          </div>

          {/* Full Corrections Sheet */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted dark:text-dark-muted mb-4 text-left">
              Full Answer Corrections & Remediation
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAns = (selectedAnswers[q.id] || []).slice().sort();
                const correctAns = (q.correctAnswers || []).slice().sort();
                const isCorrect = userAns.length === correctAns.length &&
                  userAns.every((val, i) => val === correctAns[i]);

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-left ${
                      isCorrect
                        ? 'bg-background dark:bg-dark-bg border-emerald-500/30'
                        : 'bg-red-50 dark:bg-red-950/20 border-red-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="text-xs font-bold text-ink dark:text-dark-ink leading-snug">
                        #{idx + 1}. {q.questionText}
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {isCorrect ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    </div>

                    <div className="text-xs text-muted dark:text-dark-muted mb-2">
                      <span>Your Answer: <strong className="text-ink dark:text-dark-ink">{userAns.join(', ') || 'No answer'}</strong></span>
                      {' • '}
                      <span>Correct Answer: <strong className="text-emerald-600 dark:text-emerald-400">{correctAns.join(', ')}</strong></span>
                    </div>

                    <div className="text-xs text-ink dark:text-dark-muted bg-surface dark:bg-dark-bg p-3 rounded-lg border border-divider dark:border-dark-border space-y-1.5">
                      <div><strong className="text-muted dark:text-dark-muted">Why: </strong>{q.manualExplanation}</div>
                      <div className="text-amber-700 dark:text-amber-300/90"><strong className="text-amber-600 dark:text-amber-400">Easy English: </strong>{q.plainEnglishExplanation}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal: finish (with unanswered warning) or exit */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-dark-surface border border-divider dark:border-dark-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
            {confirmAction === 'finish' ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    unansweredCount > 0
                      ? 'bg-amber-100 text-amber-600 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
                      : 'bg-emerald-100 text-emerald-600 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                  }`}>
                    {unansweredCount > 0 ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <h3 className="text-base font-bold text-ink dark:text-dark-ink text-left">
                    {unansweredCount > 0 ? 'Finish anyway?' : 'Submit quiz?'}
                  </h3>
                </div>
                <p className="text-sm text-muted dark:text-dark-muted text-left mb-6">
                  {unansweredCount > 0
                    ? <>You have answered <strong className="text-ink dark:text-dark-ink">{answeredCount} of {questions.length}</strong> questions. <strong className="text-amber-600 dark:text-amber-400">{unansweredCount} question{unansweredCount > 1 ? 's are' : ' is'} still unanswered</strong> and will be marked incorrect.</>
                    : <>All {questions.length} questions are answered. Your quiz will be scored and saved.</>}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="px-4 py-2 bg-background dark:bg-dark-bg hover:bg-divider dark:hover:bg-dark-border text-ink dark:text-dark-ink text-xs font-semibold rounded-xl border border-divider dark:border-dark-border transition"
                  >
                    Keep Working
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-md transition"
                  >
                    {unansweredCount > 0 ? 'Finish Anyway' : 'Submit Quiz'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-red-100 text-red-600 border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
                    <X className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-ink dark:text-dark-ink text-left">Exit quiz?</h3>
                </div>
                <p className="text-sm text-muted dark:text-dark-muted text-left mb-6">
                  Your current attempt will not be saved. You can start again from the module list at any time.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="px-4 py-2 bg-background dark:bg-dark-bg hover:bg-divider dark:hover:bg-dark-border text-ink dark:text-dark-ink text-xs font-semibold rounded-xl border border-divider dark:border-dark-border transition"
                  >
                    Keep Working
                  </button>
                  <button
                    onClick={onBackToModules}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    Exit Quiz
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
