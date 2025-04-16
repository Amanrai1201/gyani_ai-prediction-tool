import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateFunFact } from '@/config/fun_fact_gemini';

interface ResultProps {
  prediction: string;
}

interface FunFact {
  fact: string;
  factType: 'fun' | 'educational' | 'interesting';
}

const Result: React.FC<ResultProps> = ({ prediction }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  const [funFact, setFunFact] = useState<FunFact | null>(null);
  const [isLoadingFact, setIsLoadingFact] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchFunFact = async () => {
      try {
        setIsLoadingFact(true);
        const fact = await generateFunFact(prediction);
        setFunFact(fact);
      } catch (error) {
        console.error('Error fetching fun fact:', error);
      } finally {
        setIsLoadingFact(false);
      }
    };

    if (prediction) {
      fetchFunFact();
    }
  }, [prediction]);

  const handleIncorrect = () => {
    setShowFeedback(true);
  };

  return (
    <div className={`w-[75%] mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg transform transition-all duration-500 ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
      <div className="text-center mb-12 animate-fadeIn">
        <h2 className="text-4xl font-bold text-black mb-8">
          Gyani's Prediction
        </h2>
        <div className="text-3xl font-semibold text-blue-600 p-10 rounded-2xl bg-blue-50 mb-10 shadow-inner transform hover:scale-[1.02] transition-transform duration-300 border-2 border-blue-100 min-h-[200px] flex items-center justify-center">
          {prediction}
        </div>
         {/* Fun Fact Section */}
         <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-inner border-2 border-purple-100">
          <h3 className="text-2xl font-semibold text-purple-700 mb-4">Fun Fact</h3>
          {isLoadingFact ? (
            <div className="text-gray-600 animate-pulse">Loading interesting fact...</div>
          ) : funFact ? (
            <div className="text-lg text-gray-700 leading-relaxed">
              {funFact.fact}
            </div>
          ) : (
            <div className="text-gray-600">No fun fact available at the moment</div>
          )}
        <p className="text-2xl text-gray-600 mb-10 font-medium">
          Did I guess correctly?
        </p>

        <div className="flex justify-center gap-8 mb-12">
          <Link 
            href="/Start_game"
            className="px-8 py-4 bg-blue-50 text-black border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 shadow-md font-semibold text-lg"
          >
            Yes, Play Again!
          </Link>
          <button
            onClick={handleIncorrect}
            className="px-8 py-4 bg-red-50 text-black border-2 border-red-200 rounded-xl hover:bg-red-100 transition-all duration-300 transform hover:scale-105 shadow-md font-semibold text-lg"
          >
            No, I was thinking of...
          </button>
        </div>

        {showFeedback && (
          <div className="mt-12 animate-fadeIn space-y-8">
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="What was the correct answer?"
              className="w-full max-w-md px-6 py-4 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-lg transition-all duration-300 hover:border-gray-400 shadow-sm"
            />
            <button
              onClick={() => {
                console.log('Correct answer was:', correctAnswer);
                window.location.href = '/Start_game';
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md font-semibold text-lg"
            >
              Submit & Play Again
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Result;