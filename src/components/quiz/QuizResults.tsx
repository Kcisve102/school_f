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
        <div className="inline-block p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            {score}/{totalQuestions}
          </h2>
          <p className="text-2xl font-semibold text-gray-600 mb-4">
            {Math.round(percentageScore)}%
          </p>
          <div
            className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
              passed ? 'bg-green-500' : 'bg-yellow-500'
            }`}
          >
            {passed ? 'Passed!' : 'Keep Learning!'}
          </div>
        </div>
      </div>

      {/* Pass/Fail Message */}
      <div className={`p-4 mb-6 rounded-lg ${passed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <p className={`text-center font-medium ${passed ? 'text-green-800' : 'text-yellow-800'}`}>
          {passed
            ? 'Great job! You have a good understanding of the video content.'
            : 'Not quite there yet. Review the explanations below and try again!'}
        </p>
      </div>

      {/* Questions Review */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Review Your Answers</h3>
        {questions.map((question, index) => {
          const result = results.find((r) => r.questionId === question.id);
          const selectedOption = userAnswers.get(question.id) ?? null;

          return (
            <div key={question.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-semibold ${
                    result?.isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {result?.isCorrect ? '✓' : '✗'}
                </span>
                <span className="text-sm font-medium text-gray-600">
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
      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onRetake}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Retake Quiz
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
