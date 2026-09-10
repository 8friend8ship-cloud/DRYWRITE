import type { ContentRecord } from '../types';
import { DataManager } from './DataManager';

interface AdminViewProps {
  records: ContentRecord[];
  authorized: boolean;
  onExitAdmin: () => void;
  onImportRecords: (records: ContentRecord[]) => void;
}

export const AdminView = ({ records, authorized, onExitAdmin, onImportRecords }: AdminViewProps) => {
  if (!authorized) {
    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-white">
        <div className="mx-auto max-w-xl rounded-xl border border-amber-700/60 bg-amber-950/20 p-6">
          <h1 className="text-2xl font-bold">관리자 권한이 필요합니다</h1>
          <p className="mt-3 text-zinc-300">관리 기능은 Apps Script/backend의 인증 및 권한 계약이 연결된 뒤에만 사용할 수 있습니다.</p>
          <button type="button" onClick={onExitAdmin} className="mt-6 rounded bg-white px-4 py-2 font-semibold text-black">사이트로 돌아가기</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Authorized Content Admin</h1>
            <p className="mt-1 text-sm text-zinc-400">Writes must be executed through the authorized backend repository.</p>
          </div>
          <button type="button" onClick={onExitAdmin} className="text-sm text-blue-300 hover:underline">사이트로 돌아가기</button>
        </div>
        <DataManager records={records} onImportRecords={onImportRecords} />
      </div>
    </main>
  );
};
