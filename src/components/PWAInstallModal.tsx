import React from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111827] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <img src="/icon-192.png" alt="App icon" className="w-10 h-10 rounded-xl" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Install AC Dashboard</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add to your iPhone or iPad home screen</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 py-2 border-y border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div>
              Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-0.5 text-indigo-500" /> in the Safari toolbar.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div>
              Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-indigo-500" />.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div>
              Tap <strong>Add</strong> in the top right corner. The app will launch in standalone mode!
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
