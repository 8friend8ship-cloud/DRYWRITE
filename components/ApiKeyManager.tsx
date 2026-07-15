
import React, { useState, useEffect } from 'react';
import { testApiKey } from '../services/geminiService';

const API_KEY_STORAGE_KEY = 'drywriter_api_key';

// This is simple obfuscation (Base64), not strong encryption.
// It's used to prevent the key from being stored in plain text.
const encodeKey = (key: string) => btoa(key);
const decodeKey = (encodedKey: string) => atob(encodedKey);

export const ApiKeyManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedKey) {
            try {
                setApiKey(decodeKey(storedKey));
            } catch (e) {
                console.error("Failed to decode API key from storage", e);
                // Clear corrupted key
                localStorage.removeItem(API_KEY_STORAGE_KEY);
            }
        }
    }, []);

    const handleTestAndSave = async () => {
        if (!apiKey.trim()) {
            setStatus('error');
            setMessage('API Key cannot be empty.');
            return;
        }
        setStatus('testing');
        setMessage('Testing connection...');
        
        const isValid = await testApiKey(apiKey);
        if (isValid) {
            localStorage.setItem(API_KEY_STORAGE_KEY, encodeKey(apiKey));
            setStatus('success');
            setMessage('Success! API Key is valid and has been saved.');
            setTimeout(() => {
                onClose();
            }, 1500); // Close modal after a short delay on success
        } else {
            setStatus('error');
            setMessage('Connection test failed. Please check your API key and project permissions.');
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'testing': return 'text-yellow-400';
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div 
            className="fixed inset-0 z-40 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-fast"
                onClick={onClose}
            ></div>
            
            {/* Modal */}
            <div className="relative z-50 bg-zinc-800 text-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Manage API Key</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    Your API key is stored securely in your browser's local storage and is never sent anywhere else except to the Google AI API.
                </p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">
                            Your Gemini API Key
                        </label>
                        <input
                            id="apiKey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full mt-1 p-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your API key"
                        />
                    </div>
                    <button
                        onClick={handleTestAndSave}
                        disabled={status === 'testing'}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {status === 'testing' && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {status === 'testing' ? 'Testing...' : 'Test & Save Key'}
                    </button>

                    {message && (
                        <p className={`text-sm text-center ${getStatusColor()}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
                 @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
