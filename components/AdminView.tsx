import React, { useState, useEffect } from 'react';
import type { Article } from '../types';
import { buildWorkflowPackage, deriveTitle, saveWorkflowPackage, type WorkflowPackage } from '../services/workflowService';
import { DataManager } from './DataManager';

interface AdminViewProps {
  articles: Article[];
  onAddArticle: (article: Omit<Article, 'id' | 'date'>) => void;
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (articleId: string) => void;
  onImportArticles: (articles: Article[]) => void;
  onExitAdmin: () => void;
}

interface PublishManagerProps extends Omit<AdminViewProps, 'onExitAdmin' | 'onImportArticles'> {}

const PublishManager: React.FC<PublishManagerProps> = ({ articles, onAddArticle, onUpdateArticle, onDeleteArticle }) => {
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [rawText, setRawText] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingCoverImageUrl, setEditingCoverImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [workflowPackage, setWorkflowPackage] = useState<WorkflowPackage | null>(null);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    if (editingArticle) {
      setRawText(editingArticle.rawText);
      setEditingTitle(editingArticle.title);
      setEditingCoverImageUrl(editingArticle.coverImageUrl);
    } else {
      setRawText('');
      setEditingTitle('');
      setEditingCoverImageUrl('/drywriter-cover.svg');
    }
    setWorkflowPackage(null);
    setCopyStatus('');
  }, [editingArticle]);

  const prepareWorkflow = () => {
    if (!rawText.trim()) {
      setError('스크립트를 먼저 입력하세요.');
      return;
    }
    const pkg = buildWorkflowPackage(rawText);
    saveWorkflowPackage(pkg);
    setWorkflowPackage(pkg);
    setEditingTitle(deriveTitle(rawText));
    setEditingCoverImageUrl('/drywriter-cover.svg');
    setError(null);
  };

  const copyForChatGPT = async () => {
    if (!workflowPackage) return;
    const payload = JSON.stringify(workflowPackage, null, 2);
    await navigator.clipboard.writeText(payload);
    setCopyStatus('ChatGPT 1차 검수 패키지를 복사했습니다.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setError('스크립트를 먼저 입력하세요.');
      return;
    }
    if (!workflowPackage) {
      setError('먼저 1차 템플릿을 준비하세요.');
      return;
    }

    if (editingArticle) {
      onUpdateArticle({
        ...editingArticle,
        title: editingTitle || deriveTitle(rawText),
        coverImageUrl: editingCoverImageUrl || '/drywriter-cover.svg',
        rawText
      });
    } else {
      onAddArticle({
        title: editingTitle || deriveTitle(rawText),
        coverImageUrl: editingCoverImageUrl || '/drywriter-cover.svg',
        rawText
      });
    }
    setEditingArticle(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('이 글을 삭제할까요?')) {
      onDeleteArticle(id);
      if (editingArticle?.id === id) setEditingArticle(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-zinc-800 p-6 rounded-lg border border-emerald-700/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">API 0 기본 모드</h2>
            <p className="text-sm text-gray-300 mt-1">Queens → Seed → 1차 템플릿 → ChatGPT 검수 → 2차 → 최종요리</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-300">브라우저 API 키 없음</span>
        </div>
      </div>

      <div className="bg-zinc-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">글 관리</h2>
        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
          {articles.length > 0 ? articles.map(article => (
            <div key={article.id} className="flex justify-between items-center bg-zinc-700 p-3 rounded-md">
              <p className="truncate pr-4">{article.title}</p>
              <div className="flex-shrink-0 space-x-2">
                <button onClick={() => setEditingArticle(article)} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md">수정</button>
                <button onClick={() => handleDelete(article.id)} className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md">삭제</button>
              </div>
            </div>
          )) : <p className="text-gray-400">아직 글이 없습니다.</p>}
        </div>
      </div>

      <div className="bg-zinc-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">{editingArticle ? '글 수정' : '1차 템플릿 테스트'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rawText" className="block text-sm font-medium text-gray-300 mb-1">원문 / Seed 입력</label>
            <textarea id="rawText" value={rawText} onChange={(e) => setRawText(e.target.value)} rows={14} className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md" placeholder="여기에 Queens/Seed 또는 원문을 붙여넣으세요." />
          </div>
          <button type="button" onClick={prepareWorkflow} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-md">
            1차 템플릿 준비
          </button>

          {workflowPackage && (
            <div className="space-y-3 bg-zinc-900 border border-zinc-700 rounded-lg p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <strong>상태: {workflowPackage.status}</strong>
                <span className="text-xs text-gray-400">{workflowPackage.contentId}</span>
              </div>
              <div className="text-sm text-gray-300">
                <p><b>주제:</b> {workflowPackage.template1.topic}</p>
                <p><b>키워드:</b> {workflowPackage.template1.keywords.join(', ') || '없음'}</p>
                <p><b>페르소나:</b> 기존 페르소나 도서관에서 ChatGPT가 선택</p>
              </div>
              <textarea readOnly value={JSON.stringify(workflowPackage, null, 2)} rows={14} className="w-full p-3 text-xs bg-black border border-zinc-700 rounded-md font-mono" />
              <button type="button" onClick={copyForChatGPT} className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-3 rounded-md">
                ChatGPT 1차 검수 패키지 복사
              </button>
              {copyStatus && <p className="text-sm text-emerald-400">{copyStatus}</p>}
            </div>
          )}

          {editingArticle && (
            <>
              <input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md" placeholder="제목" />
              <input value={editingCoverImageUrl} onChange={(e) => setEditingCoverImageUrl(e.target.value)} className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md" placeholder="커버 이미지 URL" />
            </>
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md">
            {editingArticle ? '수정 저장' : '검수대기 원고 저장'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const AdminView: React.FC<AdminViewProps> = ({ articles, onAddArticle, onUpdateArticle, onDeleteArticle, onImportArticles, onExitAdmin }) => (
  <div className="bg-zinc-900 text-white min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">DryWriter Workflow</h1>
          <p className="text-sm text-gray-400 mt-1">ChatGPT 1차 검수 + 최종요리 기준</p>
        </div>
        <button onClick={onExitAdmin} className="text-sm text-blue-400 hover:underline">← 사이트로</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PublishManager articles={articles} onAddArticle={onAddArticle} onUpdateArticle={onUpdateArticle} onDeleteArticle={onDeleteArticle} />
        <DataManager articles={articles} onImportArticles={onImportArticles} />
      </div>
    </div>
  </div>
);
