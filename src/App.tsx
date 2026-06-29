import React, { useState } from 'react';
import { 
  Code2, 
  ShieldAlert, 
  SearchCode, 
  MessageSquare,
  Play,
  Loader2,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type TabType = 'analysis' | 'review' | 'security' | 'custom';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const [code, setCode] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'analysis', label: 'Code Analysis', icon: SearchCode, desc: 'Explain logic, summarize, complexity' },
    { id: 'review', label: 'AI Code Review', icon: Code2, desc: 'Detect bugs, refactor, style guide' },
    { id: 'security', label: 'Security Review', icon: ShieldAlert, desc: 'Find vulnerabilities, SQLi, XSS' },
    { id: 'custom', label: 'Custom Query (RAG)', icon: MessageSquare, desc: 'Ask anything about your code' },
  ] as const;

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please paste some code to analyze.');
      return;
    }
    if (activeTab === 'custom' && !query.trim()) {
      setError('Please enter a question for the custom query.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, type: activeTab, query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze code');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#0A0A0C] font-sans text-zinc-200">
      {/* Sidebar */}
      <div className="w-80 bg-[#111113] border-r border-[#27272A] flex flex-col h-full z-10">
        <div className="h-14 px-6 border-b border-[#27272A] flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">
            <span className="font-sans">C</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-lg tracking-tight text-zinc-100">CodeSense AI</span>
            <span className="ml-3 px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Pro v2.4</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-4 px-2">Analysis Modes</div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-start space-x-3 group",
                  isActive 
                    ? "bg-indigo-500/10 border border-indigo-500/20" 
                    : "hover:bg-zinc-800/50 border border-transparent"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg mt-0.5",
                  isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                )}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className={cn(
                    "font-semibold text-sm",
                    isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-300"
                  )}>{tab.label}</div>
                  <div className={cn(
                    "text-[10px] mt-0.5 leading-tight",
                    isActive ? "text-indigo-400/70" : "text-zinc-500"
                  )}>{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#27272A] bg-[#111113]">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !code.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                <span>Run Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 border-b border-[#27272A] bg-[#0E0E10] flex flex-col h-1/2 min-h-[300px]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272A] bg-[#111113]/50">
            <div className="text-xs font-medium text-zinc-400 flex items-center space-x-2">
              <Code2 size={14} />
              <span>Source Code</span>
            </div>
            <button 
              onClick={() => setCode('')}
              className="text-zinc-500 hover:text-rose-400 transition-colors flex items-center space-x-1 text-xs"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your source code here for review..."
            className="flex-1 w-full bg-transparent text-zinc-300 font-mono text-[13px] leading-relaxed p-6 resize-none focus:outline-none focus:ring-0 placeholder-zinc-700"
            spellCheck="false"
          />
        </div>

        {/* Query Input (Only visible in Custom mode) */}
        {activeTab === 'custom' && (
          <div className="bg-[#111113] border-b border-[#27272A] p-5 z-10 flex items-center space-x-4">
            <MessageSquare className="text-zinc-400 flex-shrink-0" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., Does this code follow SOLID principles? What happens if input is null?"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleAnalyze();
                }
              }}
            />
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 bg-[#111113] overflow-y-auto h-1/2 relative flex flex-col">
          <div className="sticky top-0 bg-[#111113]/90 backdrop-blur-md border-b border-[#27272A] px-6 py-3 flex items-center justify-between z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
              <span>Analysis Results</span>
            </div>
            {result && (
              <button 
                onClick={copyToClipboard}
                className="text-zinc-400 hover:text-indigo-400 transition-colors flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-indigo-500/10"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Report'}</span>
              </button>
            )}
          </div>
          
          <div className="p-8 max-w-4xl mx-auto w-full">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex items-start space-x-3">
                <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm">{error}</div>
              </div>
            )}

            {!result && !error && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 py-20">
                <div className="w-16 h-16 bg-black/30 rounded-2xl flex items-center justify-center border border-[#27272A]">
                  {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Code2, { size: 32, className: "text-zinc-600" })}
                </div>
                <div className="text-center">
                  <p className="text-zinc-400 font-medium text-lg">Ready to analyze</p>
                  <p className="text-sm text-zinc-500 max-w-sm mt-2">
                    Paste your code above and click Run Analysis to get AI-powered insights, bug detection, and security reviews.
                  </p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-75"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-black/40 border border-indigo-500/30 rounded-full text-indigo-400">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                </div>
                <p className="text-zinc-500 font-medium animate-pulse">Running {activeTab}...</p>
              </div>
            )}

            {result && !isLoading && (
              <div className="markdown-body">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {result}
                </Markdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
