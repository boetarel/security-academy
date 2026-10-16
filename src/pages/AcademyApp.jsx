import React, { useState } from 'react';
import { Navbar } from '../components/Navbar.jsx';
import { QuizModulePicker } from '../components/QuizModulePicker.jsx';
import { QuizView } from '../components/QuizView.jsx';
import { ExamView } from '../components/ExamView.jsx';
import { ProgressModal } from '../components/ProgressModal.jsx';
import { curriculumData } from '../data/curriculumData.js';
import { officialExamsData } from '../data/officialExamsData.js';
import { practiceQuestionsData } from '../data/practiceQuestionsData.js';
import { loadProgress, saveProgress } from '../utils/storage.js';
import { CheckSquare, Award } from 'lucide-react';

const TABS = [
  { id: 'quiz', label: 'Quizzes', icon: CheckSquare, color: 'blue' },
  { id: 'exam', label: 'Exam', icon: Award, color: 'orange' },
];

export function AcademyApp() {
  const [progress, setProgress] = useState(() => loadProgress());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizModuleId, setQuizModuleId] = useState(null); // null = module picker
  const [quizAttemptActive, setQuizAttemptActive] = useState(false);
  const [examAttemptActive, setExamAttemptActive] = useState(false);

  const updateProgress = (newProgress) => {
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  const currentGrade = progress.currentGrade || 'E';

  const handleSelectGrade = (grade) => {
    setQuizModuleId(null);
    updateProgress({ ...progress, currentGrade: grade });
  };

  // Only 'quiz' and 'exam' tabs exist now; legacy stored values ('study', 'remediation') fall back to quiz.
  const activeTab = progress.activeTab === 'exam' ? 'exam' : 'quiz';
  const handleSelectTab = (tab) => updateProgress({ ...progress, activeTab: tab });

  const handleSaveQuizResult = (result) => {
    const existing = progress.moduleQuizResults[result.moduleId]?.attempts || [];
    updateProgress({ ...progress, moduleQuizResults: { ...progress.moduleQuizResults, [result.moduleId]: { attempts: [...existing, result] } } });
  };

  const handleSaveExamResult = (result) => {
    const existing = progress.officialExamResults[result.grade]?.attempts || [];
    updateProgress({ ...progress, officialExamResults: { ...progress.officialExamResults, [result.grade]: { attempts: [...existing, result] } } });
  };

  const currentGradeCurriculum = curriculumData[currentGrade];
  const modules = currentGradeCurriculum?.modules || [];
  const completedQuizzesCount = modules.filter(m => progress.moduleQuizResults[m.id]?.attempts?.length > 0).length;
  const activeQuizModule = modules.find(m => m.id === quizModuleId) || null;
  // Hide grade + tab controls while a quiz or exam attempt is in progress
  const attemptInProgress = (activeTab === 'quiz' && quizAttemptActive) || (activeTab === 'exam' && examAttemptActive);

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
      <Navbar />

      {/* Academy sub-header */}
      <div className="sticky top-16 z-40 glass border-b border-divider dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main nav row — hidden during an active quiz/exam attempt */}
          {!attemptInProgress && (
          <div className="flex items-center justify-between py-3 gap-4 flex-wrap">
            {/* Grade selector */}
            <div className="flex items-center gap-1 bg-background dark:bg-dark-bg p-1 rounded-xl border border-divider dark:border-dark-border">
              {['E', 'D', 'C'].map(g => (
                <button
                  key={g}
                  onClick={() => handleSelectGrade(g)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    currentGrade === g
                      ? 'bg-primary text-white shadow-primary-glow'
                      : 'text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink hover:bg-surface dark:hover:bg-dark-surface'
                  }`}
                >
                  Grade {g}
                </button>
              ))}
            </div>

            {/* Tab navigation */}
            <nav className="flex items-center gap-1">
              {TABS.map(({ id, label, icon: Icon, color }) => {
                const isActive = activeTab === id;
                const activeClass = color === 'orange'
                  ? 'bg-primary text-white shadow-primary-glow'
                  : 'bg-blue-600 text-white';

                return (
                  <button
                    key={id}
                    onClick={() => handleSelectTab(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? activeClass
                        : 'text-muted dark:text-dark-muted hover:bg-surface dark:hover:bg-dark-surface hover:text-ink dark:hover:text-dark-ink'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                    {id === 'quiz' && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-divider dark:bg-dark-border text-muted dark:text-dark-muted'}`}>
                        {completedQuizzesCount}/{modules.length}
                      </span>
                    )}
                    {id === 'exam' && currentGradeCurriculum?.officialExamMarks && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-divider dark:bg-dark-border text-muted dark:text-dark-muted'}`}>
                        {currentGradeCurriculum.officialExamMarks}m
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'quiz' && (
          activeQuizModule ? (
            <QuizView
              grade={currentGrade}
              moduleId={activeQuizModule.id}
              practiceQuestions={practiceQuestionsData}
              curriculumData={curriculumData}
              onSaveQuizResult={handleSaveQuizResult}
              onBackToModules={() => setQuizModuleId(null)}
              onAttemptChange={setQuizAttemptActive}
            />
          ) : (
            <QuizModulePicker
              grade={currentGrade}
              gradeData={currentGradeCurriculum}
              progress={progress}
              onQuizStart={setQuizModuleId}
            />
          )
        )}
        {activeTab === 'exam' && (
          <ExamView
            grade={currentGrade}
            officialExamsData={officialExamsData}
            onSaveExamResult={handleSaveExamResult}
            onBackToQuizzes={() => handleSelectTab('quiz')}
            onExamActiveChange={setExamAttemptActive}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-divider dark:border-dark-border py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-muted dark:text-dark-muted">
          <span>McMaster Skool — PSIRA Security Curriculum (Grades E, D, C)</span>
          <button onClick={() => setIsModalOpen(true)} className="text-primary hover:text-primary-dark transition underline underline-offset-4">
            Export Progress
          </button>
        </div>
      </footer>

      <ProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        progress={progress}
        onUpdateProgress={updateProgress}
      />
    </div>
  );
}
