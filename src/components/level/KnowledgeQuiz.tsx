import React, { useState } from 'react';
import { QuizQuestion } from '../../types/game';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface KnowledgeQuizProps {
  questions: QuizQuestion[];
  onComplete: (answers: Record<string, string>) => void;
}

export const KnowledgeQuiz: React.FC<KnowledgeQuizProps> = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optId: string) => {
    if (hasAnswered) return;
    setSelectedOptionId(optId);
    setHasAnswered(true);

    setAnswers(previous => ({ ...previous, [currentQ.id]: optId }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setHasAnswered(false);
    } else {
      onComplete({ ...answers, [currentQ.id]: selectedOptionId! });
    }
  };

  const selectedOption = currentQ.options.find(o => o.id === selectedOptionId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Knowledge Trial · Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <span className="text-xs font-mono text-slate-500">{currentQ.category}</span>
      </div>

      <p className="text-sm font-medium text-slate-200 mb-4 leading-relaxed">
        {currentQ.prompt}
      </p>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {currentQ.options.map(option => {
          const isSelected = selectedOptionId === option.id;
          let styleClass = 'border-slate-800 hover:border-slate-700 bg-slate-950/70 text-slate-300';

          if (hasAnswered) {
            if (option.isCorrect) {
              styleClass = 'border-emerald-500/80 bg-emerald-950/20 text-emerald-200';
            } else if (isSelected && !option.isCorrect) {
              styleClass = 'border-red-500/80 bg-red-950/20 text-red-300';
            } else {
              styleClass = 'border-slate-800/40 opacity-40 text-slate-500';
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              disabled={hasAnswered}
              className={`w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition-all flex items-start gap-2.5 ${styleClass}`}
            >
              <div className="shrink-0 mt-0.5">
                {hasAnswered && option.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : hasAnswered && isSelected && !option.isCorrect ? (
                  <XCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <div className={`w-3.5 h-3.5 rounded-full border ${isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-600'}`} />
                )}
              </div>
              <span className="flex-1">{option.text}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation Feedback */}
      {hasAnswered && selectedOption && (
        <div className={`p-3 rounded-lg text-xs mb-4 border ${
          selectedOption.isCorrect 
            ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-200' 
            : 'bg-red-950/30 border-red-900/60 text-red-200'
        }`}>
          <div className="font-semibold mb-1">
            {selectedOption.isCorrect ? 'Correct Reasoning' : 'Engineering Principle'}
          </div>
          <p className="text-slate-300 leading-relaxed">
            {selectedOption.explanation}
          </p>
        </div>
      )}

      {hasAnswered && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md shadow-sm transition-all"
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Knowledge Trial'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
