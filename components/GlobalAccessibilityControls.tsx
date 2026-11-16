import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ContentBlock } from '../types';
import { translatePublicArticleOnDevice, GOOGLE_CHROME_TRANSLATE_HELP, type LocalArticleTranslation } from '../services/chromeLocalTranslation';
import { makeGlobalVoiceRequest, normalizeSpeechLocale, sameSpeechLanguage, speechChunks } from '../services/globalVoiceContract.mjs';

const LANGUAGES = [
  ['ko-KR','한국어'], ['en-US','English'], ['ja-JP','日本語'],
  ['zh-CN','中文'], ['es-ES','Español'], ['fr-FR','Français'],
  ['de-DE','Deutsch'], ['pt-BR','Português'], ['vi-VN','Tiếng Việt'],
  ['id-ID','Bahasa Indonesia'], ['th-TH','ไทย'], ['hi-IN','हिन्दी'],
  ['ar-SA','العربية'], ['ru-RU','Русский'], ['sw-KE','Kiswahili'],
] as const;

type VoiceResult = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type Recognition = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((value: VoiceResult) => void) | null;
  onerror: ((value: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void;
};
type RecognitionFactory = new () => Recognition;

type Props = {
  articleId: string;
  revision: string;
  title: string;
  blocks: ContentBlock[];
  sourceLanguage: string;
  publicServerSource: boolean;
  translated: LocalArticleTranslation | null;
  onTranslate: (result: LocalArticleTranslation | null) => void;
  onBack: () => void;
};
export const GlobalAccessibilityControls = ({
  articleId, revision, title, blocks, sourceLanguage, publicServerSource,
  translated, onTranslate, onBack,
}: Props) => {
  const [targetLanguage, setTargetLanguage] = useState('en-US');
  const [customLanguage, setCustomLanguage] = useState('');
  const [status, setStatus] = useState('대기 중. 글 읽어주기는 사용자가 직접 시작합니다.');
  const [busy, setBusy] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [rate, setRate] = useState(1);
  const [allowRemoteVoice, setAllowRemoteVoice] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [chromeInstructions, setChromeInstructions] = useState(false);
  const [supportMode, setSupportMode] = useState<'sight' | 'hands' | 'language' | null>(null);
  const runId = useRef(0);
  const recognition = useRef<Recognition | null>(null);
  const voiceEvents = useRef<Array<{ node: string; state: string; at: string }>>([]);
  const language = normalizeSpeechLocale(translated?.language || sourceLanguage);
  const blocksToRead = translated?.blocks || blocks;
  const headingToRead = translated?.title || title;
  const target = targetLanguage === 'custom' ? customLanguage : targetLanguage;

  const log = (node: string, state: string) => {
    voiceEvents.current = [...voiceEvents.current.slice(-29), { node, state, at: new Date().toISOString() }];
  };
  const stopAudio = useCallback(() => {
    runId.current += 1;
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    const synthesis = window.speechSynthesis;
    if (!synthesis) return;
    const update = () => setVoices(synthesis.getVoices());
    update();
    synthesis.addEventListener?.('voiceschanged', update);
    return () => {
      synthesis.removeEventListener?.('voiceschanged', update);
      synthesis.cancel();
      runId.current += 1;
    };
  }, []);
  useEffect(() => () => {
    if (recognition.current) {
      recognition.current.onresult = null;
      recognition.current.onerror = null;
      recognition.current.onend = null;
      recognition.current.stop();
      recognition.current = null;
    }
  }, []);
  useEffect(() => setVoiceURI(''), [language]);

  const matchingVoices = useMemo(() => voices.filter(voice =>
    sameSpeechLanguage(voice.lang, language) &&
    (voice.localService || (allowRemoteVoice && publicServerSource))),
    [voices, language, allowRemoteVoice, publicServerSource]);
  const speak = useCallback(() => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setStatus('읽어주기를 지원하지 않는 기기입니다. 화면낭독기를 이용해 주세요.');
      log('VOICE_TTS', 'UNSUPPORTED');
      return;
    }
    const chosen = matchingVoices.find(voice => voice.voiceURI === voiceURI) || matchingVoices[0];
    if (!chosen) {
      setStatus('이 언어의 음성이 기기에 설치되어 있지 않습니다. 지원 음성을 설치하거나 화면낭독기를 사용하세요.');
      log('VOICE_TTS', 'VOICE_MISSING');
      return;
    }
    const text = [headingToRead, ...blocksToRead.filter(block => block.type !== 'hr').map(block => block.content)].join(' ');
    if (!text.trim() || text.length > 60000) {
      setStatus('글 읽기 분량이 지원 범위를 벗어났습니다.');
      return;
    }
    stopAudio();
    const running = runId.current;
    const parts = speechChunks(text, 230);
    let at = 0;
    const next = () => {
      if (runId.current !== running) return;
      if (at >= parts.length) {
        setStatus('글 읽기가 완료됐습니다.');
        log('VOICE_TTS', 'FINISHED');
        return;
      }
      const utterance = new SpeechSynthesisUtterance(parts[at++]);
      utterance.lang = language;
      utterance.voice = chosen;
      utterance.rate = rate;
      utterance.onend = next;
      utterance.onerror = () => {
        if (runId.current === running) {
          setStatus('음성 출력 오류입니다. 기기 음성과 화면낭독기 설정을 확인해 주세요.');
          log('VOICE_TTS', 'ERROR');
        }
      };
      window.speechSynthesis.speak(utterance);
    };
    setStatus('글을 읽고 있습니다. 정지·일시정지 버튼을 이용할 수 있습니다.');
    log('VOICE_TTS', 'STARTED');
    next();
  }, [headingToRead, blocksToRead, language, matchingVoices, voiceURI, rate, stopAudio]);

  const translate = async () => {
    if (busy) return;
    stopAudio();
    setBusy(true);
    setStatus('이 Chrome의 기기 내 번역 지원 여부를 확인하고 있습니다.');
    try {
      const result = await translatePublicArticleOnDevice({
        title, blocks, sourceLanguage, targetLanguage: target, approvedPublicSource: publicServerSource,
      });
      onTranslate(result);
      setStatus('기기 내 번역 성공. 해당 언어 음성이 있으면 번역문을 읽어줍니다.');
      log('CHROME_TRANSLATOR', 'ON_DEVICE_SUCCESS');
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'UNKNOWN';
      setChromeInstructions(true);
      setStatus('기기 내 번역을 사용할 수 없습니다 (' + reason + '). Chrome 메뉴 → 번역을 이용해 주세요.');
      log('CHROME_TRANSLATOR', reason);
    } finally {
      setBusy(false);
    }
  };

  const exportJson = () => {
    const chosen = matchingVoices.find(voice => voice.voiceURI === voiceURI) || matchingVoices[0];
    const request = makeGlobalVoiceRequest({
      contentId: articleId, sourceRevision: revision,
      source: publicServerSource ? 'PUBLIC_SERVER_READ' : 'SAMPLE_OR_CACHE',
      language, requestedLanguage: language, provider: 'BROWSER_WEBSPEECH', voiceName: chosen?.name || '',
    });
    const payload = {
      request, events: voiceEvents.current,
      uploadAllowed: false, mcpConnected: false, audioUploaded: false, rawTextIncluded: false,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'GOODWAY_voice_local_review.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('텍스트·음성·마이크 전사가 없는 JSON을 이 기기에 저장했습니다. 서버 전송은 하지 않았습니다.');
  };

  const stopMic = () => {
    const active = recognition.current;
    recognition.current = null;
    if (active) {
      active.onresult = null;
      active.onerror = null;
      active.onend = null;
      active.stop();
    }
    setMicActive(false);
    setStatus('음성 명령 마이크가 꺼졌습니다.');
    log('VOICE_COMMAND', 'STOPPED');
  };

  const startMic = () => {
    const browser = window as Window & {
      SpeechRecognition?: RecognitionFactory; webkitSpeechRecognition?: RecognitionFactory;
    };
    const Factory = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Factory) {
      setStatus('음성 명령은 이 기기에서 지원하지 않습니다. 운영체제의 음성 액세스·스위치 제어를 사용하세요.');
      return;
    }
    if (recognition.current) return;
    const controller = new Factory();
    controller.lang = 'ko-KR';
    controller.continuous = true;
    controller.interimResults = false;
    controller.onresult = event => {
      const last = event.results[event.results.length - 1];
      const phrase = String(last?.[0]?.transcript || '').trim().toLowerCase();
      // Privacy: raw microphone transcripts are never recorded or exported.
      if (/^(읽어|읽기|재생|시작|play|read)$/.test(phrase)) speak();
      else if (/^(멈춰|정지|중지|stop|pause)$/.test(phrase)) {
        stopAudio();
        setStatus('음성 명령으로 읽기를 중지했습니다.');
      } else if (/^(홈|뒤로|home|back)$/.test(phrase)) {
        stopAudio();
        stopMic();
        onBack();
      } else if (/^(원문|original)$/.test(phrase)) {
        stopAudio();
        onTranslate(null);
        setStatus('원문으로 돌아왔습니다.');
      } else {
        setStatus('명령을 알 수 없습니다. 읽어·멈춰·홈·원문을 말해 주세요.');
      }
    };
    controller.onerror = () => {
      recognition.current = null;
      setMicActive(false);
      setStatus('마이크 또는 음성 인식을 사용할 수 없습니다.');
      log('VOICE_COMMAND', 'ERROR');
    };
    controller.onend = () => {
      recognition.current = null;
      setMicActive(false); // no automatic microphone restart
    };
    try {
      controller.start(); // explicit user click/keyboard/OS voice access only
      recognition.current = controller;
      setMicActive(true);
      setStatus('마이크 켜짐. 명령: 읽어·멈춰·홈·원문. Chrome은 음성을 외부 인식 서비스로 보낼 수 있습니다.');
      log('VOICE_COMMAND', 'CONSENTED_START');
    } catch {
      setStatus('마이크 시작에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  return (
    <section aria-label="접근성, 번역, 음성 읽기" className="my-6 rounded-xl border border-zinc-700 bg-zinc-950 p-4 font-sans text-white">
      <h2 className="text-xl font-bold">본섬김 접근성 도우미 · 누구나 읽고 듣는 굳웨이 라이트</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">
        원문이 한국어여도 Chrome 번역으로 다른 언어로 볼 수 있습니다.
        기기 음성, 화면낭독기, 키보드·스위치 제어와 음성 액세스도 사용할 수 있습니다.
      </p>
      <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label="도움받을 방법 선택">
        <button type="button" aria-pressed={supportMode === 'sight'}
          onClick={() => setSupportMode('sight')} className="rounded border border-zinc-500 p-3">
          화면을 보기 어려워요
        </button>
        <button type="button" aria-pressed={supportMode === 'hands'}
          onClick={() => setSupportMode('hands')} className="rounded border border-zinc-500 p-3">
          손으로 조작하기 어려워요
        </button>
        <button type="button" aria-pressed={supportMode === 'language'}
          onClick={() => setSupportMode('language')} className="rounded border border-zinc-500 p-3">
          다른 나라 언어로 보고 싶어요
        </button>
      </div>
      {supportMode && <p role="status" aria-live="polite"
        className="mt-3 rounded bg-zinc-900 p-3 text-sm leading-relaxed text-white">
        {supportMode === 'sight'
          ? '화면낭독기로 제목과 본문을 탐색하거나 아래의 글 읽어주기를 선택하세요. 기기 언어 음성이 없으면 운영체제 화면낭독기를 사용하세요.'
          : supportMode === 'hands'
            ? 'Windows 음성 액세스·Android 음성 액세스·스위치 제어로 아래 버튼을 선택할 수 있습니다. 선택형 앱 음성 명령은 별도 마이크 동의가 필요합니다.'
            : 'Chrome 메뉴의 번역을 선택하면 한국어 원문을 다른 언어로 볼 수 있습니다. 지원되는 데스크톱 Chrome에서는 아래 기기 내 번역도 시도할 수 있습니다.'}
      </p>}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">번역 언어
          <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)}
            className="rounded border border-zinc-600 bg-black p-3 text-white">
            {LANGUAGES.map(([code,name]) => <option key={code} value={code}>{name} ({code})</option>)}
            <option value="custom">다른 언어 코드 입력</option>
          </select>
        </label>
        {targetLanguage === 'custom' && <label className="flex flex-col gap-1 text-sm">
          BCP 47 언어 코드
          <input value={customLanguage} onChange={e => setCustomLanguage(e.target.value)}
            placeholder="예: sw-KE" className="rounded border border-zinc-600 bg-black p-3 text-white" />
        </label>}
        <button type="button" onClick={translate} disabled={busy || !publicServerSource}
          className="rounded bg-white p-3 font-bold text-black disabled:opacity-50">
          {busy ? '번역 확인 중…' : '기기 내 번역'}
        </button>
        <button type="button" onClick={() => { stopAudio(); onTranslate(null); setStatus('원문으로 돌아왔습니다.'); }}
          className="rounded border border-zinc-500 p-3">원문 보기</button>
        <button type="button" aria-expanded={chromeInstructions} onClick={() => setChromeInstructions(!chromeInstructions)}
          className="rounded border border-zinc-500 p-3">Chrome 번역 안내</button>
      </div>
      {chromeInstructions && <div className="mt-3 rounded bg-zinc-900 p-3 text-sm leading-relaxed">
        <p>PC Chrome: 주소 표시줄 번역 아이콘 또는 메뉴 ⋮ → 번역 → 원하는 언어 선택.
          Chrome 설정 → 언어 → Google 번역에서 자동 번역 언어를 설정할 수 있습니다.</p>
        <p className="mt-2">Android Chrome: 메뉴 ⋮ → 번역. 설정 → 언어에서 자동 번역 대상을 선택하세요.</p>
        <p className="mt-2 text-amber-200">Chrome의 페이지 번역은 별도 브라우저 기능입니다.
          앱 음성 읽기가 원문을 읽을 수 있으며, 브라우저 번역은 Google 번역의 데이터 처리 정책을 따릅니다.</p>
        <a href={GOOGLE_CHROME_TRANSLATE_HELP} rel="noopener noreferrer" target="_blank"
          className="mt-2 inline-block underline">Google 공식 번역 안내</a>
      </div>}
      <div className="mt-5 border-t border-zinc-700 pt-4">
        <h3 className="text-lg font-semibold">글 듣기</h3>
        <p className="mt-1 text-sm text-zinc-400">현재 언어: {language} · 허용된 음성: {matchingVoices.length}개</p>
        <label className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={allowRemoteVoice}
            onChange={e => setAllowRemoteVoice(e.target.checked)}
            disabled={!publicServerSource} />
          외부 처리가 가능한 브라우저 음성도 허용 (승인된 공개 글에만, 명시적 동의)
        </label>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">기기 음성
            <select value={voiceURI} onChange={e => setVoiceURI(e.target.value)}
              className="max-w-64 rounded border border-zinc-600 bg-black p-3 text-white">
              <option value="">현재 언어 기본 음성</option>
              {matchingVoices.map(voice => <option value={voice.voiceURI} key={voice.voiceURI}>
                {voice.name} {voice.localService ? '(기기 내)' : '(외부 처리 가능)'}
              </option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">속도 {rate.toFixed(1)}배
            <input type="range" min="0.7" max="1.3" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} />
          </label>
          <button type="button" onClick={speak} disabled={matchingVoices.length===0}
            className="rounded bg-white p-3 font-bold text-black disabled:opacity-50">글 읽어주기</button>
          <button type="button" onClick={() => { window.speechSynthesis?.pause(); setStatus('일시정지했습니다.'); }}
            className="rounded border border-zinc-500 p-3">일시정지</button>
          <button type="button" onClick={() => { window.speechSynthesis?.resume(); setStatus('읽기를 재개했습니다.'); }}
            className="rounded border border-zinc-500 p-3">이어 듣기</button>
          <button type="button" onClick={() => { stopAudio(); setStatus('읽기를 중지했습니다.'); }}
            className="rounded border border-zinc-500 p-3">정지</button>
        </div>
      </div>
      <div className="mt-5 border-t border-zinc-700 pt-4">
        <h3 className="text-lg font-semibold">손 없이 음성으로 조작하기</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          OS 음성 액세스·스위치 제어로 버튼을 선택할 수 있습니다.
          앱 음성 명령은 선택형입니다. 일부 Chrome 음성 인식은 마이크 소리를 서버에 보낼 수 있어
          동의 없이 시작하지 않으며 종료 후 자동 재시작하지 않습니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" aria-pressed={micActive} onClick={micActive ? stopMic : startMic}
            className="rounded border border-zinc-500 p-3">
            {micActive ? '마이크·음성 명령 끄기' : '동의하고 음성 명령 켜기'}
          </button>
          <button type="button" onClick={exportJson} className="rounded border border-zinc-500 p-3">
            개인정보 없는 음성 JSON 내려받기
          </button>
        </div>
      </div>
      <p role="status" aria-live="polite" className="mt-4 rounded bg-zinc-900 p-3 text-sm leading-relaxed">{status}</p>
    </section>
  );
};
