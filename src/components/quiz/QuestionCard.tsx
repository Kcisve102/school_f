import React from 'react';
import { Question, QuizResult } from '../../types';

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
  const getOptionClassName = (index: number): string => {
    const baseClasses =
      'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 mb-3';

    if (showResult) {
      // In results mode
      if (index === question.correctAnswer) {
        // Correct answer - always show green
        return `${baseClasses} border-green-500 bg-green-50`;
      } else if (index === selectedOption && !result?.isCorrect) {
        // User's wrong answer - show red
        return `${baseClasses} border-red-500 bg-red-50`;
      } else {
        // Other options - gray
        return `${baseClasses} border-gray-300 bg-gray-50`;
      }
    } else {
      // In answering mode
      if (selectedOption === index) {
        return `${baseClasses} border-blue-500 bg-blue-50`;
      } else {
        return `${baseClasses} border-gray-300 hover:border-blue-300 hover:bg-gray-50`;
      }
    }
  };

  const getOptionIcon = (index: number): React.ReactNode => {
    if (!showResult) return null;

    if (index === question.correctAnswer) {
      return (
        <span className="text-green-600 font-bold ml-2">✓</span>
      );
    } else if (index === selectedOption && !result?.isCorrect) {
      return (
        <span className="text-red-600 font-bold ml-2">✗</span>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
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
                <span className="font-medium text-gray-700 mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-gray-800">{option}</span>
              </div>
              {getOptionIcon(index)}
            </div>
          </div>
        ))}
      </div>

      {showResult && result && (
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm font-medium text-blue-900 mb-1">
            {result.isCorrect ? 'Correct!' : 'Incorrect'}
          </p>
          <p className="text-sm text-blue-800">{result.explanation}</p>
          {!result.isCorrect && (
            <p className="text-sm text-blue-800 mt-2">
              <strong>Correct answer:</strong> {result.correctAnswer}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
