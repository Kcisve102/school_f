import React from 'react';
import { Question, QuizResult } from '../../types';
import QuestionCard from './QuestionCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface QuizReviewListProps {
  questions: Question[];
  results: QuizResult[];
  userAnswers?: Map<number, number>;
}

export const QuizReviewList: React.FC<QuizReviewListProps> = ({
  questions,
  results,
  userAnswers,
}) => {
  const { language } = useLanguage();
  const t = translations[language].quiz;

  return (
    <div className="space-y-6">
      <h3 className="font-display font-medium text-text-primary text-lg tracking-[-0.02em] mb-4">{t.reviewAnswers}</h3>
      {questions.map((question, index) => {
        const result = results.find((r) => r.questionId === question.id);
        // Straight after submitting we still hold the answers in memory; when
        // reviewing from history we don't, so fall back to the option persisted
        // on the result. -1 means the question was skipped, and older attempts
        // predate the field entirely — both render as "nothing selected".
        const persisted = result?.selectedOption;
        const selectedOption =
          userAnswers?.get(question.id) ??
          (persisted !== undefined && persisted >= 0 ? persisted : null);

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
                {t.question} {index + 1}
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
  );
};

export default QuizReviewList;
