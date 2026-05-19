import React from 'react';
import { FileText } from 'lucide-react';

interface SummaryPanelProps {
  summaryText: string;
  keyPoints: string[];
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summaryText,
  keyPoints,
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex items-center mb-4">
        <FileText className="w-5 h-5 text-blue-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">Summary</h3>
      </div>

      <div className="mb-6">
        <p className="text-gray-300 leading-relaxed">{summaryText}</p>
      </div>

      {keyPoints && keyPoints.length > 0 && (
        <div>
          <h4 className="font-medium text-white mb-3">Key Points</h4>
          <ul className="space-y-2">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span className="text-gray-300">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;
