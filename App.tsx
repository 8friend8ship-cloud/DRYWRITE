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
  const [dataState, setDataState] = useState<Pick<ContentListResult, 'source' | 'integrationStatus'>>({
    source: 'sample',
    integrationStatus: 'WAITING_BACKEND_CONTRACT',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    contentRepository.listContent().then((result) => {
      if (!active) return;
      setRecords(result.records);
      setDataState({ source: result.source, integrationStatus: result.integrationStatus });
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

  const goHome = useCallback(() => {
    setSelectedId(null);
    setView('home');
    window.history.pushState({}, '', '/');
  }, []);

  return (
    <>
      {view === 'article' && selectedArticle ? (
        <ArticleView
          title={selectedArticle.title}
          coverImageUrl={selectedArticle.coverImageUrl}
          content={selectedArticle.content}
          onBack={goHome}
          onMenuClick={() => setIsMenuOpen(true)}
        />
      ) : (
        <HomeView
          articles={filteredArticles}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectArticle={selectArticle}
          onMenuClick={() => setIsMenuOpen(true)}
          dataSource={dataState.source}
          integrationStatus={dataState.integrationStatus}
        />
      )}

      {isMenuOpen && (
        <MenuView
          articles={articles}
          onClose={() => setIsMenuOpen(false)}
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
