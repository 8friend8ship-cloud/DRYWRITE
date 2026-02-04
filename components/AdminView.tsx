
import React, { useState, useEffect } from 'react';
import type { Article } from '../types';
import { generateTitle, generateCoverImage } from '../services/geminiService';
import { DataManager } from './DataManager';

interface AdminViewProps {
    articles: Article[];
    onAddArticle: (article: Omit<Article, 'id' | 'date'>) => void;
    onUpdateArticle: (article: Article) => void;
    onDeleteArticle: (articleId: string) => void;
    onImportArticles: (articles: Article[]) => void;
    onExitAdmin: () => void;
}

const PublishManager: React.FC<Omit<AdminViewProps, 'onExitAdmin' | 'onImportArticles'>> = ({ articles, onAddArticle, onUpdateArticle, onDeleteArticle }) => {
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [rawText, setRawText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editingArticle) {
            setRawText(editingArticle.rawText);
        } else {
            setRawText('');
        }
    }, [editingArticle]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rawText.trim()) {
            setError('Please enter some script content before publishing.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const newTitle = await generateTitle(rawText);
            const newCoverImageUrl = await generateCoverImage(newTitle, rawText);

            if (editingArticle) {
                onUpdateArticle({ 
                    ...editingArticle, 
                    title: newTitle, 
                    coverImageUrl: newCoverImageUrl, 
                    rawText 
                });
            } else {
                onAddArticle({ title: newTitle, coverImageUrl: newCoverImageUrl, rawText });
            }
            setEditingArticle(null); // Resets form via useEffect
        } catch (err) {
            console.error("Failed to publish article:", err);
            setError("Failed to generate content from AI. Please check your API key and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            onDeleteArticle(id);
            if (editingArticle?.id === id) {
                setEditingArticle(null);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-zinc-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Manage Articles</h2>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {articles.length > 0 ? articles.map(article => (
                        <div key={article.id} className="flex justify-between items-center bg-zinc-700 p-3 rounded-md animate-fade-in">
                            <p className="truncate pr-4">{article.title}</p>
                            <div className="flex-shrink-0 space-x-2">
                                <button onClick={() => setEditingArticle(article)} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md transition-colors">Edit</button>
                                <button onClick={() => handleDelete(article.id)} className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors">Delete</button>
                            </div>
                        </div>
                    )) : <p className="text-gray-400">No articles published yet.</p>}
                </div>
            </div>

            <div className="bg-zinc-800 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{editingArticle ? 'Edit Script' : 'Create New Article'}</h2>
                    {editingArticle && (
                        <button onClick={() => setEditingArticle(null)} className="text-sm text-blue-400 hover:underline">
                            + Create New
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="rawText" className="block text-sm font-medium text-gray-300 mb-1">스크립트 입력 (Script Content)</label>
                        <textarea id="rawText" value={rawText} onChange={(e) => setRawText(e.target.value)} rows={15} className="w-full mt-1 p-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="여기에 스크립트를 붙여넣으면 AI가 제목과 커버 이미지를 자동으로 생성합니다." />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-green-800 disabled:cursor-not-allowed flex items-center justify-center">
                        {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isLoading ? 'AI가 생성 중...' : (editingArticle ? 'Update Article' : 'Publish Article')}
                    </button>
                </form>
            </div>
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

export const AdminView: React.FC<AdminViewProps> = ({ articles, onAddArticle, onUpdateArticle, onDeleteArticle, onImportArticles, onExitAdmin }) => {
    return (
        <div className="bg-zinc-900 text-white min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                    <button onClick={onExitAdmin} className="text-sm text-blue-400 hover:underline">
                        &larr; Back to Site
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PublishManager 
                        articles={articles} 
                        onAddArticle={onAddArticle} 
                        onUpdateArticle={onUpdateArticle} 
                        onDeleteArticle={onDeleteArticle} 
                    />
                    <DataManager
                        articles={articles}
                        onImportArticles={onImportArticles}
                    />
                </div>
            </div>
        </div>
    );
};