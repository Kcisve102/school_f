import React from 'react';
import { Question, QuizResult } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface QuestionCardProps {
  question: Question;
  selectedOption: number | null;
  onSelectOption: (optionIndex: number) => void;
  showResult?: boolean;
  result?: QuizResult;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelectOption,
  showResult = false,
  result,
}) => {
  const { language } = useLanguage();
  const t = translations[language].quiz;

  const getOptionClassName = (index: number): string => {
    const baseClasses =
      'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 mb-3';

    if (showResult) {
      if (index === question.correctAnswer) {
        return `${baseClasses} border-success bg-success/10`;
      } else if (index === selectedOption && !result?.isCorrect) {
        return `${baseClasses} border-error bg-error/10`;
      } else {
        return `${baseClasses} border-border bg-surface-secondary`;
      }
    } else {
      if (selectedOption === index) {
        return `${baseClasses} border-accent bg-accent/10`;
      } else {
        return `${baseClasses} border-border hover:border-accent/50 hover:bg-surface-secondary`;
      }
    }
  };

  const getOptionIcon = (index: number): React.ReactNode => {
    if (!showResult) return null;

    if (index === question.correctAnswer) {
      return <span className="text-green-600 font-bold ml-2">✓</span>;
    } else if (index === selectedOption && !result?.isCorrect) {
      return <span className="text-red-600 font-bold ml-2">✗</span>;
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {question.question}
      </h3>

      <div className="space-y-2">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={getOptionClassName(index)}
            onClick={() => !showResult && onSelectOption(index)}
            role="button"
            tabIndex={showResult ? -1 : 0}
            onKeyPress={(e) => {
              if (!showResult && (e.key === 'Enter' || e.key === ' ')) {
                onSelectOption(index);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-medium text-text-secondary mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-text-primary">{option}</span>
              </div>
              {getOptionIcon(index)}
            </div>
          </div>
        ))}
      </div>

      {showResult && result && (
        <div className="mt-4 p-4 bg-info/10 border-l-4 border-info rounded">
          <p className="text-sm font-medium text-info mb-1">
            {result.isCorrect ? t.correct : t.incorrect}
          </p>
          <p className="text-sm text-text-secondary">{result.explanation}</p>
          {!result.isCorrect && (
            <p className="text-sm text-text-secondary mt-2">
              <strong>{t.correctAnswer}</strong> {result.correctAnswer}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
