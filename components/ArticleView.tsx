
import React from 'react';
import type { ContentBlock } from '../types';
import { GlobalAccessibilityControls } from './GlobalAccessibilityControls';
import type { LocalArticleTranslation } from '../services/chromeLocalTranslation';

interface ArticleViewProps {
  title: string;
  articleId: string;
  revision: string;
  sourceLanguage: string;
  publicServerSource: boolean;
  coverImageUrl: string;
  content: ContentBlock[];
  onBack: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<{ onBack: () => void; onMenuClick: () => void; }> = ({ onBack, onMenuClick }) => (
    <header className="fixed top-0 left-0 right-0 z-10 p-4 bg-black/80 backdrop-blur-sm flex justify-between items-center">
        <button onClick={onBack} className="flex items-center space-x-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-white text-xl font-bold tracking-tighter font-serif">굳웨이 라이트</span>
        </button>
        <div className="flex items-center space-x-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button onClick={onMenuClick} aria-label="전체 글 메뉴 열기" className="rounded p-2 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
    </header>
);

export const ArticleView: React.FC<ArticleViewProps> = ({
  title, articleId, revision, sourceLanguage, publicServerSource, coverImageUrl, content, onBack, onMenuClick,
}) => {
  const [translated, setTranslated] = React.useState<LocalArticleTranslation | null>(null);
  const articleTitle = translated?.title || title;
  const articleBlocks = translated?.blocks || content;
  const displayLanguage = translated?.language || sourceLanguage;
  return (
    <div className="bg-black text-white font-serif min-h-screen animate-fade-in">
      <Header onBack={onBack} onMenuClick={onMenuClick} />
      <main id="main-content" tabIndex={-1} className="pt-16">
        <div className="max-w-3xl mx-auto px-5">
            <GlobalAccessibilityControls
                articleId={articleId}
                revision={revision}
                title={title}
                blocks={content}
                sourceLanguage={sourceLanguage}
                publicServerSource={publicServerSource}
                translated={translated}
                onTranslate={setTranslated}
                onBack={onBack}
            />
            {coverImageUrl && <div className="w-full h-80 my-8">
                 <img src={coverImageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
            </div>}
            <article lang={displayLanguage} aria-labelledby="goodway-article-title" className="prose prose-invert prose-lg max-w-none">
                <h1 id="goodway-article-title" className="text-4xl md:text-5xl font-bold !leading-tight my-4">{articleTitle}</h1>
                <a href="#article-reading-start" className="sr-only focus:not-sr-only focus:inline-block focus:p-3">글 본문 바로가기</a>
                <span id="article-reading-start" tabIndex={-1} />
                {articleBlocks.map((block, index) => {
                switch (block.type) {
                    case 'h1':
                        return <h2 key={index} className="text-2xl md:text-3xl font-bold mt-12 mb-4">{block.content}</h2>;
                    case 'h2':
                        return <h2 key={index} className="text-2xl md:text-3xl font-bold mt-12 mb-4">{block.content}</h2>;
                    case 'h3':
                        return <h3 key={index} className="text-xl md:text-2xl font-bold mt-8 mb-3">{block.content}</h3>;
                    case 'p':
                        return <p key={index} className="text-base md:text-lg leading-relaxed text-gray-300">{block.content}</p>;
                    case 'meta':
                        return <p key={index} className="text-sm text-gray-400 my-4">{block.content}</p>;
                    case 'hr':
                         return <hr key={index} className="border-gray-600 my-8" />;
                    default:
                        return null;
                }
                })}
            </article>
        </div>
      </main>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
