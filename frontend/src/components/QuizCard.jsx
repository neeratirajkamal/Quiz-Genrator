import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, RefreshCw, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

const QuizCard = ({ quizData, isInteractive = true }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const questions = quizData.quiz;
    const currentQuestion = questions[currentQuestionIndex];

    const handleOptionClick = (option) => {
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);

        if (option === currentQuestion.answer) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResults(false);
    };

    if (showResults) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-2xl mx-auto border border-gray-100"
            >
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-12 h-12 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                <p className="text-gray-600 mb-8">You scored</p>
                <div className="text-6xl font-black text-indigo-600 mb-8">
                    {score} <span className="text-2xl text-gray-400 font-medium">/ {questions.length}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-semibold text-gray-900 mb-2">Key Topics</h3>
                        <div className="flex flex-wrap gap-2">
                            {quizData.related_topics && quizData.related_topics.map((topic, idx) => (
                                <span key={idx} className="bg-white px-2 py-1 rounded-md text-xs border border-gray-200 text-gray-600">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                        <p className="text-sm text-gray-600 line-clamp-3">{quizData.summary}</p>
                    </div>
                </div>

                <button
                    onClick={restartQuiz}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30"
                >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Take Again
                </button>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-semibold text-indigo-600 tracking-wider uppercase">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        currentQuestion.difficulty === 'Easy' ? "bg-green-100 text-green-700" :
                            currentQuestion.difficulty === 'Medium' ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-700"
                    )}>
                        {currentQuestion.difficulty}
                    </span>
                </div>

                {/* Question Body */}
                <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
                        {currentQuestion.question}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedOption === option;
                            const isCorrect = option === currentQuestion.answer;
                            const showCorrectness = isAnswered && isCorrect;
                            const showIncorrectness = isAnswered && isSelected && !isCorrect;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(option)}
                                    disabled={isAnswered}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex justify-between items-center group",
                                        !isAnswered && "hover:border-indigo-200 hover:bg-indigo-50 border-gray-100",
                                        isSelected && !isAnswered && "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200",
                                        showCorrectness && "border-green-500 bg-green-50 text-green-700",
                                        showIncorrectness && "border-red-500 bg-red-50 text-red-700",
                                        isAnswered && !isSelected && !isCorrect && "opacity-50 border-gray-100"
                                    )}
                                >
                                    <span className="font-medium">{option}</span>
                                    {showCorrectness && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    {showIncorrectness && <XCircle className="w-5 h-5 text-red-600" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation & Next Button */}
                    <AnimatePresence>
                        {isAnswered && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-gray-100 pt-6"
                            >
                                <div className="text-sm text-gray-600 italic">
                                    <span className="font-semibold not-italic">Why? </span>
                                    {currentQuestion.explanation}
                                </div>
                                <button
                                    onClick={handleNext}
                                    className="flex-shrink-0 inline-flex items-center px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition"
                                >
                                    {currentQuestionIndex === questions.length - 1 ? "View Results" : "Next Question"}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default QuizCard;
