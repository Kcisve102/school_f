import React from 'react';
import { ValidationResponse, Question } from '../../types';
import QuestionCard from './QuestionCard';

interface QuizResultsProps {
  validationResults: ValidationResponse;
  questions: Question[];
  userAnswers: Map<number, number>;
  onClose: () => void;
  onRetake: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  validationResults,
  questions,
  userAnswers,
  onClose,
  onRetake,
}) => {
  const { score, totalQuestions, percentageScore, results } = validationResults;
  const passed = percentageScore >= 60;

  return (
    <div className="w-full max-h-[70vh] overflow-y-auto">
      {/* Score Display */}
      <div className="text-center mb-8">
        <div className="inline-block p-8 bg-accent/10 rounded-lg border border-accent/20">
          <h2 className="text-4xl font-bold text-text-primary mb-2">
            {score}/{totalQuestions}
          </h2>
          <p className="text-2xl font-semibold text-text-secondary mb-4">
            {Math.round(percentageScore)}%
          </p>
          <div
            className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
              passed ? 'bg-success' : 'bg-warning'
            }`}
          >
            {passed ? 'Passed!' : 'Keep Learning!'}
          </div>
        </div>
      </div>

      {/* Pass/Fail Message */}
      <div className={`p-4 mb-6 rounded-lg border ${passed ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'}`}>
        <p className={`text-center font-medium ${passed ? 'text-success' : 'text-warning'}`}>
          {passed
            ? 'Great job! You have a good understanding of the video content.'
            : 'Not quite there yet. Review the explanations below and try again!'}
        </p>
      </div>

      {/* Questions Review */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-text-primary mb-4">Review Your Answers</h3>
        {questions.map((question, index) => {
          const result = results.find((r) => r.questionId === question.id);
          const selectedOption = userAnswers.get(question.id) ?? null;

          return (
            <div key={question.id} className="bg-surface p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-semibold ${
                    result?.isCorrect ? 'bg-success' : 'bg-error'
                  }`}
                >
                  {result?.isCorrect ? '✓' : '✗'}
                </span>
                <span className="text-sm font-medium text-text-secondary">
                  Question {index + 1}
                </span>
              </div>
              <QuestionCard
                question={question}
                selectedOption={selectedOption}
                onSelectOption={() => {}}
                showResult={true}
                result={result}
              />
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8 pt-6 border-t border-border">
        <button
          onClick={onRetake}
          className="flex-1 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors duration-200"
        >
          Retake Quiz
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-surface-secondary text-text-primary font-semibold rounded-lg hover:bg-surface-hover transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
