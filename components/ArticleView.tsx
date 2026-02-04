
import React from 'react';
import type { ContentBlock } from '../types';

interface ArticleViewProps {
  title: string;
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
            <h1 className="text-white text-2xl font-bold tracking-tighter font-serif">DryWriter</h1>
        </button>
        <div className="flex items-center space-x-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button onClick={onMenuClick}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
    </header>
);

export const ArticleView: React.FC<ArticleViewProps> = ({ title, coverImageUrl, content, onBack, onMenuClick }) => {
  return (
    <div className="bg-black text-white font-serif min-h-screen animate-fade-in">
      <Header onBack={onBack} onMenuClick={onMenuClick} />
      <main className="pt-16">
        <div className="max-w-3xl mx-auto px-5">
            <div className="w-full h-96 my-8">
                 <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
            </div>
            
            <article className="prose prose-invert prose-lg max-w-none">
                {content.map((block, index) => {
                switch (block.type) {
                    case 'h1':
                        return <h1 key={index} className="text-4xl md:text-5xl font-bold !leading-tight my-4">{block.content}</h1>;
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
