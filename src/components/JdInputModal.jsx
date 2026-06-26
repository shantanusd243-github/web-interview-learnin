import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

const JdInputModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [jdText, setJdText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (jdText.trim().length > 50) {
      onSubmit(jdText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Target a New Role
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Paste the full Job Description below. Our AI will analyze the requirements and generate a hyper-personalized attack plan for your interview.
          </p>
          <textarea
            className="w-full h-64 p-4 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none dark:text-slate-200"
            placeholder="Paste Job Description here (e.g., 'Senior Java Developer required with 5+ years experience in Spring Boot, Microservices, and Kafka...')"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || jdText.trim().length < 50}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing JD...
              </>
            ) : (
              'Generate Attack Plan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JdInputModal;