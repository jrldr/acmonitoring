import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  CloudUpload,
  CloudDownload,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import {
  APPS_SCRIPT_TEMPLATE,
  isValidScriptUrl,
} from '../utils/appsScriptSync';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptUrl: string;
  onSaveScriptUrl: (url: string) => void;
  onPushToSheet: () => void;
  onPullFromSheet: () => void;
  isSyncing: boolean;
  lastSyncedAt?: string | null;
  autoSync: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  scriptUrl,
  onSaveScriptUrl,
  onPushToSheet,
  onPullFromSheet,
  isSyncing,
  lastSyncedAt,
  autoSync,
  onToggleAutoSync,
}) => {
  const [urlInput, setUrlInput] = useState(scriptUrl);
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(!scriptUrl);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (cleanUrl && !isValidScriptUrl(cleanUrl)) {
      setError('URL must start with https://script.google.com/macros/s/ and end with /exec');
      return;
    }
    setError(null);
    onSaveScriptUrl(cleanUrl);
  };

  const isConnected = isValidScriptUrl(scriptUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#111827] shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 relative transition-all my-8 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Google Sheets Cloud Sync
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              100% Free · No Google Cloud billing or credit card required
            </p>
          </div>
        </div>

        {/* Connection Status Bar */}
        {isConnected ? (
          <div className="mb-5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected to Personal Google Sheet</span>
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                {lastSyncedAt ? `Last synced: ${lastSyncedAt}` : 'Ready to push or pull data'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPullFromSheet}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                title="Download all records from your Google Sheet"
              >
                <CloudDownload className="w-3.5 h-3.5" />
                <span>Pull from Sheet</span>
              </button>
              <button
                type="button"
                onClick={onPushToSheet}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50 shadow-xs"
                title="Save current records into your Google Sheet"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Syncing...' : 'Push to Sheet'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-5 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>Permanent Cloud Backup for Free</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 leading-relaxed">
              Connect this app to your own personal Google Sheet via a free 1-minute Google Apps Script Web App. Your records will stay safely stored in Google Drive forever—even if you clear your browser history or switch phones!
            </p>
          </div>
        )}

        {/* URL Form */}
        <form onSubmit={handleSave} className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Google Apps Script Web App URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                placeholder="https://script.google.com/macros/s/.../exec"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setError(null);
                }}
                className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shrink-0"
              >
                Save URL
              </button>
            </div>
            {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
          </div>

          {/* Auto-Sync Setting */}
          {isConnected && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Automatic Sync
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically update your Google Sheet whenever you add, edit, or delete a cycle.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => onToggleAutoSync(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>
          )}
        </form>

        {/* Step-by-Step Free Setup Guide */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-800 dark:text-slate-200 mb-3"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>How to create your free Google Sheet sync (1 minute)</span>
            </span>
            <span className="text-indigo-600 text-[11px]">
              {showGuide ? 'Hide Steps' : 'Show Steps'}
            </span>
          </button>

          {showGuide && (
            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p>
                    Open a new Google Sheet at{' '}
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      sheets.new <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and name it <strong>AC Power Tracker</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div className="w-full">
                  <p className="mb-2">
                    In the Google Sheet menu, click <strong>Extensions &gt; Apps Script</strong>. Delete any code in the editor, and paste the code below:
                  </p>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Code Copied to Clipboard!' : 'Copy Apps Script Code'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p>
                    In Apps Script, click <strong>Deploy &gt; New deployment</strong>:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <li>Select type: <strong>Web app</strong></li>
                    <li>Execute as: <strong>Me</strong></li>
                    <li>Who has access: <strong>Anyone</strong> (allows the AC app to talk to it)</li>
                  </ul>
                  <p className="mt-1">
                    Click <strong>Deploy</strong>, authorize when prompted, copy the <strong>Web App URL</strong>, and paste it in the box above!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
