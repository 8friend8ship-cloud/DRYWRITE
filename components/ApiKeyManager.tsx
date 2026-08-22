import React, { useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'drywriter_api_key';

export const ApiKeyManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    // Remove obsolete browser-stored key from the legacy runtime.
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-50 bg-zinc-800 text-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">건조한작가 실행 설정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="닫기">✕</button>
        </div>
        <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-4">
          <p className="font-bold text-emerald-300">API-FREE 기본 실행</p>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            PTPL-DRYWRITER-BASE-V2 → T2_DRYWRITE_FRONT_READER_V2는 저장 글·로컬 템플릿을 먼저 사용합니다.
            브라우저에 Gemini API 키를 저장하거나 입력하지 않습니다.
          </p>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-gray-300">
          <li>• 제목: 문서 제목/첫 문장 기반 결정형 생성</li>
          <li>• 표지: 로컬 SVG 생성</li>
          <li>• 문서 질문: 제공된 글 내부 검색</li>
          <li>• 외부 최신 사실이 필요한 별도 기능만 중앙 API 정책으로 처리</li>
        </ul>
        <button onClick={onClose} className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700">확인</button>
      </div>
    </div>
  );
};
