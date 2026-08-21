
import React from 'react';
import type { ContentListResult, RenderedArticle } from '../types';

interface HomeViewProps {
    articles: RenderedArticle[];
    onSelectArticle: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onMenuClick: () => void;
    dataSource: ContentListResult['source'];
    integrationStatus: ContentListResult['integrationStatus'];
}

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => (
    <header className="p-4 bg-black flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold tracking-tighter font-serif">DryWriter</h1>
         <div className="flex items-center space-x-4">
            <button onClick={onMenuClick} aria-label="전체 글 메뉴 열기" className="rounded p-2 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
    </header>
);

const ArticleCard: React.FC<{ article: RenderedArticle; onSelect: () => void; }> = ({ article, onSelect }) => (
    <button type="button" onClick={onSelect} className="w-full cursor-pointer text-left group animate-fade-in focus:outline-none focus:ring-2 focus:ring-amber-400">
        <div className="overflow-hidden">
            <img src={article.coverImageUrl} alt={article.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-4 bg-zinc-900">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-gray-300">{article.title}</h3>
            <p className="text-xs text-gray-500 mt-2">{article.date}</p>
        </div>
    </button>
);

export const HomeView: React.FC<HomeViewProps> = ({ articles, onSelectArticle, searchQuery, setSearchQuery, onMenuClick, dataSource, integrationStatus }) => {
    return (
        <div className="bg-black min-h-screen">
            <Header onMenuClick={onMenuClick}/>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-zinc-400" aria-label="데이터 연결 상태">
                    <span className="rounded-full border border-zinc-700 px-3 py-1">Data: {dataSource.toUpperCase()}</span>
                    {integrationStatus === 'WAITING_BACKEND_CONTRACT' && (
                        <span className="rounded-full border border-amber-700/70 bg-amber-950/30 px-3 py-1 text-amber-300">Preview fallback · backend contract pending</span>
                    )}
                </div>
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
                {articles.length === 0 && <p className="py-16 text-center text-zinc-400">검색 결과가 없습니다.</p>}
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
