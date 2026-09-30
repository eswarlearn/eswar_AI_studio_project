import React, { useState } from 'react';
import { CONCEPTS_CATALOG } from '../../data/concepts';
import { BookOpen, Search, CheckCircle2, AlertTriangle, ArrowRight, Layers } from 'lucide-react';

export const ConceptDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Foundations', 'Databases', 'Scaling', 'Messaging', 'Containers', 'Observability'];

  const filteredConcepts = CONCEPTS_CATALOG.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || c.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
            <span>ENGINEERING ENCYCLOPEDIA</span>
            <span className="text-slate-600">·</span>
            <span>Architectural Mental Models & Tradeoffs</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Design Concept Cards</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Learn why systems exist, their failure modes, and when NOT to use them.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search concepts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/80 transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredConcepts.map(concept => (
          <div
            key={concept.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
                  {concept.category}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Alternatives: {concept.alternatives.slice(0, 2).join(', ')}
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mb-1.5">
                {concept.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                {concept.purpose}
              </p>
            </div>

            {/* When to use vs When not to use */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <span className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>When to Use</span>
                </span>
                <ul className="space-y-1 text-slate-400 text-[11px] leading-tight">
                  {concept.whenToUse.map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 shrink-0">·</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-amber-400 flex items-center gap-1 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>When NOT to Use</span>
                </span>
                <ul className="space-y-1 text-slate-400 text-[11px] leading-tight">
                  {concept.whenNotToUse.map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 shrink-0">·</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Engineering Tradeoff */}
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Crucial Tradeoff: </span>
              {concept.tradeoffs}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
