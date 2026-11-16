
import React from 'react';
import type { ContentListResult, RenderedArticle } from '../types';

interface HomeViewProps {
    initialLoading: boolean;
    articles: RenderedArticle[];
    onSelectArticle: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onMenuClick: () => void;
    dataSource: ContentListResult['source'];
    integrationStatus: ContentListResult['integrationStatus'];
    loadedCount: number;
    hasMore: boolean;
    loadingMore: boolean;
    loadError: string | null;
    onLoadMore: () => void;
}

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => (
    <header className="p-4 bg-black flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold tracking-tighter font-serif">굳웨이 라이트</h1>
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
            <p className="text-xs text-gray-400 mt-2">{article.date}</p>
        </div>
    </button>
);

export const HomeView: React.FC<HomeViewProps> = ({ initialLoading, articles, onSelectArticle, searchQuery, setSearchQuery, onMenuClick, dataSource, integrationStatus, loadedCount, hasMore, loadingMore, loadError, onLoadMore }) => {
    return (
        <div className="bg-black min-h-screen">
            <Header onMenuClick={onMenuClick}/>
            <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-zinc-400" aria-label="데이터 연결 상태">
                    {initialLoading ? (
                        <span role="status" className="rounded-full border border-zinc-700 px-3 py-1">공개 글 연결 확인 중</span>
                    ) : (
                        <span className="rounded-full border border-zinc-700 px-3 py-1">
                            {loadError ? '글 조회 오류' : dataSource === 'server' ? '공개 글 서버 연결됨' : '로컬 미리보기 자료'}
                        </span>
                    )}
                    {!initialLoading && !loadError && integrationStatus === 'WAITING_BACKEND_CONTRACT' && (
                        <span className="rounded-full border border-amber-700/70 bg-amber-950/30 px-3 py-1 text-amber-300">공개 글 서버 연결 전 · 미리보기 자료</span>
                    )}
                </div>
                {!initialLoading && !loadError && dataSource === 'server' && loadedCount === 0 && (
                    <section role="status" aria-live="polite" className="mb-8 rounded-lg border border-zinc-700 bg-zinc-900 p-5">
                        <h2 className="text-lg font-semibold text-white">아직 공개 승인된 글이 없습니다.</h2>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                            내부 검수 중인 원고는 최종 공개 승인 전이므로 이곳에 표시하지 않습니다.
                        </p>
                    </section>
                )}
                {loadError && <p role="alert" className="mb-8 rounded border border-amber-700 p-4 text-amber-300">{loadError}</p>}
                <div className="relative mb-8">
                    <label htmlFor="goodway-search" className="mb-2 block text-sm font-semibold text-white">
                      공개 글 검색
                    </label>
                    <input
                        id="goodway-search"
                        type="search"
                        aria-describedby="goodway-search-scope"
                        placeholder="불러온 글에서 검색하세요."
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
                {!initialLoading && !loadError && loadedCount > 0 && articles.length === 0 && (
                    <p className="py-16 text-center text-zinc-400">검색 결과가 없습니다.</p>
                )}
                <div id="goodway-search-scope" className="mt-10 text-center text-sm text-zinc-400" aria-live="polite">
                    {initialLoading ? '공개 글 목록을 불러오는 중입니다.' : '현재 불러온 공개 글 ' + loadedCount + '건에서 검색합니다.'}
                    {hasMore && ' 전체 승인 글을 탐색하려면 더 불러오기를 누르세요.'}
                </div>
                {hasMore && (
                    <div className="mt-6 flex justify-center">
                        <button type="button" onClick={onLoadMore} disabled={loadingMore}
                          className="rounded border border-zinc-600 px-6 py-3 text-white hover:bg-zinc-800 disabled:opacity-60">
                            {loadingMore ? '글 불러오는 중…' : '더 많은 글 불러오기'}
                        </button>
                    </div>
                )}
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
