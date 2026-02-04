
import React, { useState, useCallback } from 'react';
import type { Article } from '../types';

interface DataManagerProps {
    articles: Article[];
    onImportArticles: (articles: Article[]) => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ articles, onImportArticles }) => {
    const [error, setError] = useState<string | null>(null);

    const handleExport = useCallback(() => {
        try {
            const jsonString = JSON.stringify(articles, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'articles.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
            setError("Failed to export articles.");
        }
    }, [articles]);

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm("Are you sure you want to import? This will overwrite all current articles.")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File could not be read as text.");
                }
                const importedArticles = JSON.parse(text);
                
                // Basic validation
                if (!Array.isArray(importedArticles) || !importedArticles.every(item => 'id' in item && 'title' in item && 'rawText' in item)) {
                    throw new Error("Invalid file format. The file must be an array of articles.");
                }

                onImportArticles(importedArticles as Article[]);
                setError(null);
            } catch (err) {
                console.error("Import failed:", err);
                let message = "Failed to import articles. Please ensure the file is a valid JSON export from this application.";
                if (err instanceof Error) {
                    message = err.message;
                }
                setError(message);
            }
        };
        reader.onerror = () => {
             setError("Failed to read the selected file.");
        }
        reader.readAsText(file);

        // Reset file input to allow importing the same file again
        event.target.value = '';
    };

    return (
        <div className="bg-zinc-800 p-6 rounded-lg space-y-6 h-fit">
            <h2 className="text-2xl font-bold">Backup & Share</h2>
            <p className="text-sm text-gray-400">
                You can export all your articles into a single JSON file. This file can be used as a backup, or to import your articles on another device or browser.
            </p>
            
            {error && <p className="text-red-500 text-sm bg-red-900/20 p-3 rounded-md">{error}</p>}

            <div className="space-y-4">
                <button 
                    onClick={handleExport}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                >
                     <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Export All Articles (.json)</span>
                </button>

                <div>
                    <label 
                        htmlFor="import-file"
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-md transition-colors cursor-pointer flex items-center justify-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Import Articles from (.json)</span>
                    </label>
                     <input 
                        type="file" 
                        id="import-file" 
                        className="hidden" 
                        accept=".json"
                        onChange={handleImport}
                    />
                </div>
            </div>
        </div>
    );
};
