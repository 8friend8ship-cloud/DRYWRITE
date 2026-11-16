
import React, { useEffect, useRef } from 'react';
import type { RenderedArticle } from '../types';

interface MenuViewProps {
    articles: RenderedArticle[];
    onSelectArticle: (id: string) => void;
    onClose: () => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ articles, onSelectArticle, onClose }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        closeRef.current?.focus();
        const keyHandler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key !== 'Tab') return;
            const buttons = Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') || []);
            if (!buttons.length) return;
            if (event.shiftKey && document.activeElement === buttons[0]) {
                event.preventDefault();
                buttons[buttons.length - 1].focus();
            } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
                event.preventDefault();
                buttons[0].focus();
            }
        };
        document.addEventListener('keydown', keyHandler);
        return () => {
            document.removeEventListener('keydown', keyHandler);
            previous?.focus();
        };
    }, [onClose]);
    return (
        <div 
            className="fixed inset-0 z-40"
            aria-modal="true"
            aria-labelledby="goodway-menu-heading"
            role="dialog"
        >
            {/* Overlay */}
            <button
                type="button"
                aria-label="메뉴 닫기"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-fast"
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div ref={panelRef} className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-zinc-900 shadow-xl z-50 flex flex-col animate-slide-in-right">
                <div className="flex justify-between items-center p-4 border-b border-zinc-700">
                    <h2 id="goodway-menu-heading" className="text-lg font-bold text-white">공개 글 목록</h2>
                    <button ref={closeRef} type="button" onClick={onClose} aria-label="메뉴 닫기" className="text-gray-400 hover:text-white">
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
