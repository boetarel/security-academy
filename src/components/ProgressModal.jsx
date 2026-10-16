import React, { useState } from 'react';
import { X, Download, Upload, Trash2, FolderArchive } from 'lucide-react';
import { exportProgressToFile, importProgressFromFile, getDefaultProgress, saveProgress } from '../utils/storage';

export const ProgressModal = ({
  isOpen,
  onClose,
  progress,
  onUpdateProgress
}) => {
  const [studentName, setStudentName] = useState(progress.studentName || 'Relton McMaster');
  const [idNumber, setIdNumber] = useState(progress.idNumber || '');
  const [importStatus, setImportStatus] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...progress,
      studentName,
      idNumber
    };
    saveProgress(updated);
    onUpdateProgress(updated);
    onClose();
  };

  const handleExport = () => {
    exportProgressToFile(progress);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Loading backup file...');
      const loaded = await importProgressFromFile(file);
      onUpdateProgress(loaded);
      setImportStatus('Progress imported successfully!');
      setTimeout(() => {
        setImportStatus('');
        onClose();
      }, 1200);
    } catch (err) {
      setImportStatus('Error importing file: ' + err.message);
    }
  };

  const handleReset = () => {
    const clean = getDefaultProgress();
    saveProgress(clean);
    onUpdateProgress(clean);
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface dark:bg-slate-900 border border-divider dark:border-dark-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-background dark:bg-slate-800 hover:bg-divider dark:hover:bg-slate-700 text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 flex items-center justify-center">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white">Local Progress & Backup Manager</h2>
            <p className="text-xs text-muted dark:text-slate-400">Save test results to your local computer folder or restore backups.</p>
          </div>
        </div>

        {/* Student Profile Info */}
        <form onSubmit={handleSaveProfile} className="space-y-4 mb-6 pb-6 border-b border-divider dark:border-dark-border">
          <div>
            <label className="block text-xs font-semibold text-ink dark:text-slate-300 mb-1">
              Learner / Candidate Full Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="e.g. Relton McMaster"
              className="w-full bg-background dark:bg-slate-950 border border-divider dark:border-dark-border rounded-xl px-3.5 py-2 text-xs text-ink dark:text-white placeholder-muted dark:placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink dark:text-slate-300 mb-1">
              National ID / PSIRA Number (Optional)
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={e => setIdNumber(e.target.value)}
              placeholder="e.g. 950828..."
              className="w-full bg-background dark:bg-slate-950 border border-divider dark:border-dark-border rounded-xl px-3.5 py-2 text-xs text-ink dark:text-white placeholder-muted dark:placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-background dark:bg-slate-800 hover:bg-divider dark:hover:bg-slate-700 text-ink dark:text-white font-semibold rounded-xl text-xs border border-divider dark:border-slate-700 transition"
          >
            Save Candidate Details
          </button>
        </form>

        {/* Export / Import Section */}
        <div className="space-y-3 mb-6 pb-6 border-b border-divider dark:border-dark-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-slate-400">
            Local File Backup & Synchronization
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1.5 transition shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Export to Folder (.json)</span>
            </button>

            <label className="p-3 bg-background dark:bg-slate-800 hover:bg-divider dark:hover:bg-slate-700 text-ink dark:text-slate-200 font-semibold rounded-xl text-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer transition border border-divider dark:border-slate-700">
              <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Load Backup (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className="p-2.5 rounded-lg bg-background dark:bg-slate-950 text-xs font-mono text-center text-amber-700 dark:text-amber-300 border border-divider dark:border-dark-border">
              {importStatus}
            </div>
          )}
        </div>

        {/* Reset State Option */}
        <div className="flex items-center justify-between">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Progress Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 dark:text-red-300">Confirm wipe?</span>
              <button
                onClick={handleReset}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1 bg-background dark:bg-slate-800 text-ink dark:text-slate-300 rounded text-xs border border-divider dark:border-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="text-[11px] font-mono text-muted dark:text-slate-500">
            Stored in LocalStorage
          </div>
        </div>
      </div>
    </div>
  );
};
