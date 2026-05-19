import React from 'react';

interface QuizProgressProps {
  current: number;
  total: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({ current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-text-secondary">
          Question {current} of {total}
        </span>
        <span className="text-sm font-medium text-text-secondary">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-surface-secondary rounded-full h-2.5">
        <div
          className="bg-accent h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizProgress;
