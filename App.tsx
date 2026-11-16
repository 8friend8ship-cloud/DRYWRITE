import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArticleView } from './components/ArticleView';
import { HomeView } from './components/HomeView';
import { MenuView } from './components/MenuView';
import { contentRepository } from './services/contentRepository';
import { renderArticle } from './templates/articleTemplate';
import type { ContentListResult, ContentRecord } from './types';

type View = 'home' | 'article';

const CONTENT_PATH_PREFIX = '/drywrite/content/';

const readContentIdFromLocation = () => {
  if (typeof window === 'undefined') return null;
  const { pathname } = window.location;
  if (!pathname.startsWith(CONTENT_PATH_PREFIX)) return null;
  const encodedId = pathname.slice(CONTENT_PATH_PREFIX.length).split('/')[0];
  if (!encodedId) return null;
  try {
    return decodeURIComponent(encodedId);
  } catch {
    return encodedId;
  }
};

const App = () => {
  const [view, setView] = useState<View>('home');
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataState, setDataState] = useState<Pick<ContentListResult, 'source' | 'integrationStatus'>>({
    source: 'sample',
    integrationStatus: 'WAITING_BACKEND_CONTRACT',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    contentRepository.listContent().then((result) => {
      if (!active) return;
      setRecords((current) => {
        const byId = new Map(current.map((record) => [record.contentId, record]));
        result.records.forEach((record) => byId.set(record.contentId, record));
        return [...byId.values()];
      });
      setDataState({ source: result.source, integrationStatus: result.integrationStatus });
      setNextPageToken(result.nextPageToken ?? null);
    }).catch(() => {
      if (active) setLoadError('글 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }).finally(() => {
      if (active) setInitialLoading(false);
    });
    return () => { active = false; };
  }, []);

  // Direct links must resolve approved records beyond the first 100 items.
  // GET_CONTENT is filtered by the same server-side public approval gate.
  useEffect(() => {
    const routeContentId = readContentIdFromLocation();
    if (!routeContentId) return;
    let active = true;
    contentRepository.getContent(routeContentId).then((record) => {
      if (!active || !record) return;
      setRecords((current) => current.some((item) => item.contentId === record.contentId)
        ? current : [...current, record]);
      setSelectedId(record.contentId);
      setView('article');
    }).catch(() => {
      // Missing or unapproved records do not bypass the public-read gate.
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!records.length) return;
    const routeContentId = readContentIdFromLocation();
    if (!routeContentId) return;
    if (records.some((record) => record.contentId === routeContentId)) {
      setSelectedId(routeContentId);
      setView('article');
    }
  }, [records]);

  useEffect(() => {
    const handlePopState = () => {
      const routeContentId = readContentIdFromLocation();
      if (routeContentId && records.some((record) => record.contentId === routeContentId)) {
        setSelectedId(routeContentId);
        setView('article');
        return;
      }
      setSelectedId(null);
      setView('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [records]);

  const loadMore = useCallback(async () => {
    if (!nextPageToken || loadingMore) return;
    const requestedToken = nextPageToken;
    setLoadingMore(true);
    setLoadError(null);
    try {
      const result = await contentRepository.listContent(requestedToken);
      setRecords((current) => {
        const byId = new Map(current.map((record) => [record.contentId, record]));
        result.records.forEach((record) => byId.set(record.contentId, record));
        return [...byId.values()];
      });
      setDataState({ source: result.source, integrationStatus: result.integrationStatus });
      if (result.nextPageToken === requestedToken) {
        setNextPageToken(null);
        setLoadError('페이지 연결 정보가 반복되어 더 불러오기를 중단했습니다.');
      } else {
        setNextPageToken(result.nextPageToken ?? null);
      }
    } catch {
      setLoadError('다음 글 목록을 불러오지 못했습니다. 다시 시도할 수 있습니다.');
    } finally {
      setLoadingMore(false);
    }
  }, [nextPageToken, loadingMore]);

  const articles = useMemo(
    () => records.map(renderArticle).sort((a, b) => b.date.localeCompare(a.date)),
    [records],
  );

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return articles;
    return articles.filter((article) => [
      article.title,
      article.summary,
      article.category,
      article.tags.join(' '),
      article.source.rawText,
    ].some((value) => value.toLocaleLowerCase().includes(query)));
  }, [articles, searchQuery]);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedId) ?? null,
    [articles, selectedId],
  );

  const selectArticle = useCallback((id: string) => {
    setSelectedId(id);
    setView('article');
    window.history.pushState({}, '', `${CONTENT_PATH_PREFIX}${encodeURIComponent(id)}`);
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const goHome = useCallback(() => {
    setSelectedId(null);
    setView('home');
    window.history.pushState({}, '', '/');
  }, []);

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-3 focus:text-black">
        본문으로 건너뛰기
      </a>
      {view === 'article' && selectedArticle ? (
        <ArticleView
          key={selectedArticle.id}
          articleId={selectedArticle.id}
          revision={selectedArticle.source.updatedAt || selectedArticle.source.createdAt}
          sourceLanguage={selectedArticle.source.language || 'ko-KR'}
          publicServerSource={dataState.source === 'server' && dataState.integrationStatus === 'CONNECTED'}
          title={selectedArticle.title}
          coverImageUrl={selectedArticle.coverImageUrl}
          content={selectedArticle.content}
          onBack={goHome}
          onMenuClick={() => setIsMenuOpen(true)}
        />
      ) : (
        <HomeView
          initialLoading={initialLoading}
          articles={filteredArticles}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectArticle={selectArticle}
          onMenuClick={() => setIsMenuOpen(true)}
          dataSource={dataState.source}
          integrationStatus={dataState.integrationStatus}
          loadedCount={records.length}
          hasMore={Boolean(nextPageToken)}
          loadingMore={loadingMore}
          loadError={loadError}
          onLoadMore={loadMore}
        />
      )}

      {isMenuOpen && (
        <MenuView
          articles={articles}
          onClose={closeMenu}
          onSelectArticle={(id) => {
            selectArticle(id);
            setIsMenuOpen(false);
          }}
        />
      )}
    </>
  );
};

export default App;
