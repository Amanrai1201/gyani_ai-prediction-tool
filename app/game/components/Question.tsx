import React from 'react';

interface QuestionProps {
  question: string;
  onAnswer: (answer: string) => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
  loading: boolean;
}

const Question: React.FC<QuestionProps> = ({ question, onAnswer, onPrevious, canGoPrevious, loading }) => {
  const options = [
    { text: 'Yes', subtext: 'I agree', color: 'bg-blue-50 hover:bg-blue-100' },
    { text: 'No', subtext: 'I disagree', color: 'bg-red-50 hover:bg-red-100' },
    { text: 'Maybe', subtext: 'I\'m unsure', color: 'bg-yellow-50 hover:bg-yellow-100' },
    { text: 'I don\'t know', subtext: 'No opinion', color: 'bg-gray-50 hover:bg-gray-100' }
  ];

  return (
    <div className="w-[75%] mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg">
      <div className="text-center mb-12">
        {canGoPrevious && (
          <button
            onClick={onPrevious}
            disabled={loading}
            className="mb-6 px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
          >
            ← Previous Question
          </button>
        )}
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          {question}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
        {options.map((option) => (
          <button
            key={option.text}
            onClick={() => onAnswer(option.text)}
            disabled={loading}
            className={`
              ${option.color}
              p-8 rounded-xl
              transition-all duration-200
              transform hover:scale-105
              flex flex-col items-center justify-center
              border-2 border-transparent hover:border-gray-200
              disabled:opacity-50 disabled:cursor-not-allowed
              min-h-[150px]
            `}
          >
            <span className="text-2xl font-semibold mb-3">
              {option.text}
            </span>
            <span className="text-lg text-gray-500">
              {option.subtext}
            </span>
          </button>
        ))}
      </div>
      {/* {loading && <CustomLoader />} */}
    </div>
  );
};

export default Question;