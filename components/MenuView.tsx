
import React from 'react';
import type { Article } from '../types';

interface MenuViewProps {
    articles: Article[];
    onSelectArticle: (id: string) => void;
    onClose: () => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ articles, onSelectArticle, onClose }) => {
    return (
        <div 
            className="fixed inset-0 z-40"
            aria-modal="true"
            role="dialog"
        >
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-fast"
                onClick={onClose}
            ></div>

            {/* Menu Panel */}
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-zinc-900 shadow-xl z-50 flex flex-col animate-slide-in-right">
                <div className="flex justify-between items-center p-4 border-b border-zinc-700">
                    <h2 className="text-lg font-bold text-white">All Notes</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto">
                    <ul>
                        {articles.map(article => (
                            <li key={article.id}>
                                <button 
                                    onClick={() => onSelectArticle(article.id)}
                                    className="w-full text-left p-4 text-white hover:bg-zinc-800 transition-colors"
                                >
                                    {article.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }

                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out forwards;
                }
             `}</style>
        </div>
    );
};
