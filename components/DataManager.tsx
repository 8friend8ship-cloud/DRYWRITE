import { useCallback, useState, type ChangeEvent } from 'react';
import type { ContentRecord } from '../types';

interface DataManagerProps {
  records: ContentRecord[];
  onImportRecords: (records: ContentRecord[]) => void;
}

function isContentRecord(value: unknown): value is ContentRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<ContentRecord>;
  return typeof record.contentId === 'string'
    && typeof record.title === 'string'
    && typeof record.rawText === 'string'
    && typeof record.templateId === 'string'
    && Array.isArray(record.tags);
}

export const DataManager = ({ records, onImportRecords }: DataManagerProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'drywrite-content.json';
      anchor.click();
      URL.revokeObjectURL(url);
      setError(null);
    } catch {
      setError('콘텐츠를 내보내지 못했습니다.');
    }
  }, [records]);

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed) || !parsed.every(isContentRecord)) {
          throw new Error('정규화된 DRYWRITE 콘텐츠 배열이 아닙니다.');
        }
        onImportRecords(parsed);
        setError(null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : '파일을 가져오지 못했습니다.');
      }
    };
    reader.onerror = () => setError('파일을 읽지 못했습니다.');
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <section className="rounded-xl bg-zinc-900 p-6" aria-labelledby="data-manager-title">
      <h2 id="data-manager-title" className="text-2xl font-bold">Normalized data transfer</h2>
      <p className="mt-2 text-sm text-zinc-400">이 도구는 승인된 관리자 화면에서만 사용하며 Google Sheets를 대체하지 않습니다.</p>
      {error && <p role="alert" className="mt-4 rounded bg-red-950/40 p-3 text-sm text-red-300">{error}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={handleExport} className="rounded bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500">JSON 내보내기</button>
        <label className="cursor-pointer rounded bg-zinc-700 px-4 py-3 text-center font-semibold hover:bg-zinc-600">
          JSON 가져오기
          <input type="file" accept=".json,application/json" onChange={handleImport} className="sr-only" />
        </label>
      </div>
    </section>
  );
};
