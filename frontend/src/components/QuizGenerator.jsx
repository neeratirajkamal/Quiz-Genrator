import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, FileText, Upload, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import QuizCard from './QuizCard';
import { cn } from '../lib/utils';
import { generateQuiz } from '../services/api';

const QuizGenerator = () => {
    const [activeTab, setActiveTab] = useState('url'); // url, pdf, topic
    const [inputValue, setInputValue] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [error, setError] = useState(null);
    const [quizData, setQuizData] = useState(null);

    const tabs = [
        { id: 'url', label: 'Web URL', icon: Link2 },
        { id: 'pdf', label: 'Upload PDF', icon: Upload },
        { id: 'topic', label: 'Topic', icon: Sparkles },
    ];

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setQuizData(null);
        setLoadingStage('Analyzing content...');

        const formData = new FormData();

        if (activeTab === 'url') {
            formData.append('url', inputValue);
        } else if (activeTab === 'pdf') {
            if (!selectedFile) {
                setError("Please select a PDF file.");
                setLoading(false);
                return;
            }
            formData.append('file', selectedFile);
        } else if (activeTab === 'topic') {
            formData.append('topic', inputValue);
        }

        try {
            // Simulate stage changes for better UX
            setTimeout(() => setLoadingStage('Generating questions...'), 2000);

            const response = await generateQuiz(formData);
            setQuizData(response.data);
        } catch (err) {
            console.error("Quiz Generation Error:", err);
            const errorMsg = err.response?.data?.detail || err.message || 'An error occurred while generating the quiz.';
            setError(errorMsg);
        } finally {
            setLoading(false);
            setLoadingStage('');
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-white/20">

                {/* Tabs */}
                {/* Use flex-wrap-reverse to handle small screens better if needed, but flex-row is standard */}
                <div className="flex justify-center space-x-4 mb-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setError(null);
                                    setInputValue('');
                                    setSelectedFile(null);
                                    setQuizData(null);
                                }}
                                className={cn(
                                    "flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-300",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'url' && (
                            <motion.div
                                key="url"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="relative"
                            >
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                                    <input
                                        type="url"
                                        placeholder="Paste a Wikipedia URL (e.g., https://en.wikipedia.org/wiki/AI)"
                                        className="relative w-full p-4 pl-12 bg-white rounded-xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-800 placeholder-gray-400"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        required
                                    />
                                    <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'pdf' && (
                            <motion.div
                                key="pdf"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="relative"
                            >
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer relative group"
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-600 font-medium">
                                        {selectedFile ? selectedFile.name : "Click to upload a PDF file"}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">Maximum size 10MB</p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'topic' && (
                            <motion.div
                                key="topic"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="relative"
                            >
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                                    <input
                                        type="text"
                                        placeholder="Enter any topic (e.g., Quantum Physics, The Roman Empire)"
                                        className="relative w-full p-4 pl-12 bg-white rounded-xl border-none focus:ring-2 focus:ring-purple-500 shadow-sm text-gray-800 placeholder-gray-400"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        required
                                    />
                                    <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Generate Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className={cn(
                            "mt-6 w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all",
                            activeTab === 'topic' ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/30" : "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:shadow-indigo-500/30",
                            loading && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                {loadingStage}
                            </span>
                        ) : (
                            "Generate Quiz"
                        )}
                    </motion.button>
                </form>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center border border-red-100"
                    >
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}
            </div>

            {/* Quiz Result Area */}
            <AnimatePresence>
                {quizData && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="mt-12"
                    >
                        <QuizCard quizData={quizData} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizGenerator;
