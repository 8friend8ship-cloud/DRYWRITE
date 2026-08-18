import React from 'react';
import { COMMON_APP_SHELL } from '../contracts/commonAppShell';

export const CommonServiceShell: React.FC = () => {
  return (
    <aside className="border-t border-gray-800 bg-black text-gray-300 px-4 py-5" aria-label="Common app service shell">
      <div className="mx-auto max-w-5xl grid gap-3 md:grid-cols-3">
        <section className="rounded-lg border border-gray-800 p-3">
          <div className="text-xs text-gray-500">ACCOUNT</div>
          <div className="mt-1 text-sm">게스트 사용 · 로그인 시 히스토리/구매/동기화</div>
          <button disabled className="mt-2 rounded border border-gray-700 px-3 py-1 text-xs text-gray-500">로그인 연결 준비</button>
        </section>

        <section className="rounded-lg border border-gray-800 p-3">
          <div className="text-xs text-gray-500">PRODUCTS</div>
          <div className="mt-1 text-sm">앱 결과와 관련된 제품·자재 추천 영역</div>
          <div className="mt-2 text-xs text-gray-600">결제/제휴 연결 전에는 실제 구매 버튼 비활성</div>
        </section>

        <section className="rounded-lg border border-gray-800 p-3">
          <div className="text-xs text-gray-500">FREE USER AD</div>
          <div className="mt-1 text-sm">무료 사용자용 Google 광고 예약 슬롯</div>
          <div className="mt-2 text-xs text-gray-600">유료 사용자는 광고 숨김</div>
        </section>

        <section className="rounded-lg border border-gray-800 p-3">
          <div className="text-xs text-gray-500">LANGUAGE PACK</div>
          <div className="mt-1 text-sm">필요한 언어팩만 기기에 내려받아 재사용</div>
          <div className="mt-2 text-xs text-gray-600">기본 {COMMON_APP_SHELL.localization.defaultLocale}</div>
        </section>

        <section className="rounded-lg border border-gray-800 p-3">
          <div className="text-xs text-gray-500">HEAVY PACK</div>
          <div className="mt-1 text-sm">Scene·영상·음성·이미지·PDF·Template는 필요할 때만 다운로드</div>
          <div className="mt-2 text-xs text-gray-600">유료 Pack은 Entitlement 확인 후 사용</div>
        </section>

        <section className="rounded-lg border border-gray-800 p-3">
          <div className="text-xs text-gray-500">HISTORY</div>
          <div className="mt-1 text-sm">개인 히스토리는 기기 로컬 우선 저장</div>
          <div className="mt-2 text-xs text-gray-600">클라우드 동기화는 사용자 선택 시만</div>
        </section>
      </div>
    </aside>
  );
};
