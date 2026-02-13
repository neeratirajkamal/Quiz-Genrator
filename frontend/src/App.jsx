import React from 'react';
import QuizGenerator from './components/QuizGenerator';

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-gray-800 font-sans">
            <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 mb-4 tracking-tight">
                        QuizGen AI
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Transform any content into an interactive quiz instantly.
                        Powered by advanced AI.
                    </p>
                </div>

                <main>
                    <QuizGenerator />
                </main>

                <footer className="mt-16 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} QuizGen AI. Built with Gemini 2.0 Flash.</p>
                </footer>
            </div>
        </div>
    );
}

export default App;
