// Utility for managing localStorage and JSON file exports/imports

const STORAGE_KEY = 'psira_academy_progress_v1';

export const loadProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading progress from localStorage:', e);
    return getDefaultProgress();
  }
};

export const saveProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress to localStorage:', e);
  }
};

export const getDefaultProgress = () => {
  return {
    studentName: 'Relton McMaster',
    idNumber: '',
    currentGrade: 'E',
    activeTab: 'quiz', // 'quiz' | 'exam'
    lastActiveModule: {
      E: 'grade-e-mod-1',
      D: 'grade-d-mod-1',
      C: 'grade-c-mod-1'
    },
    // Module quiz history: { [moduleId]: { attempts: [{ score, total, percentage, date, answers, wrongQuestionIds }] } }
    moduleQuizResults: {},
    // Official exam history: { [grade]: { attempts: [{ score, totalMarks, percentage, passed, date, answers, sectionScores, wrongQuestions }] } }
    officialExamResults: {},
    // Bookmarked/flagged questions for review: array of question IDs
    flaggedQuestions: [],
    // All questions answered wrong across all attempts for the knowledge gap engine
    allWrongQuestions: {}
  };
};

export const exportProgressToFile = (progress) => {
  const jsonStr = JSON.stringify(progress, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `psira_security_progress_${progress.currentGrade}_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importProgressFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        saveProgress(parsed);
        resolve(parsed);
      } catch {
        reject(new Error('Invalid JSON file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
