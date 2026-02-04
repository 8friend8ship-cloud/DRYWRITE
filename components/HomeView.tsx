
import React from 'react';
import type { Article } from '../types';

interface HomeViewProps {
    articles: Article[];
    onSelectArticle: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onMenuClick: () => void;
}

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => (
    <header className="p-4 bg-black flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold tracking-tighter font-serif">DryWriter</h1>
         <div className="flex items-center space-x-4">
            <button onClick={onMenuClick}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
    </header>
);

const ArticleCard: React.FC<{ article: Article; onSelect: () => void; }> = ({ article, onSelect }) => (
    <div onClick={onSelect} className="cursor-pointer group animate-fade-in">
        <div className="overflow-hidden">
            <img src={article.coverImageUrl} alt={article.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-4 bg-zinc-900">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-gray-300">{article.title}</h3>
            <p className="text-xs text-gray-500 mt-2">{article.date}</p>
        </div>
    </div>
);

export const HomeView: React.FC<HomeViewProps> = ({ articles, onSelectArticle, searchQuery, setSearchQuery, onMenuClick }) => {
    return (
        <div className="bg-black min-h-screen">
            <Header onMenuClick={onMenuClick}/>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="relative mb-8">
                    <input 
                        type="text"
                        placeholder="검색어를 입력하세요."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-4 pl-12 bg-zinc-900 text-white border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map(article => (
                        <ArticleCard key={article.id} article={article} onSelect={() => onSelectArticle(article.id)} />
                    ))}
                </div>
            </main>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-in-out forwards;
                }
            `}</style>
        </div>
    );
};
