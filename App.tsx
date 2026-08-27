import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArticleView } from './components/ArticleView';
import { HomeView } from './components/HomeView';
import { MenuView } from './components/MenuView';
import { contentRepository } from './services/contentRepository';
import { buildDrywriterMvpT2, DRYWRITER_MVP_INPUT } from './services/drywriterMvpPipeline';
import { renderArticle } from './templates/articleTemplate';
import type { ContentListResult, ContentRecord } from './types';

type View = 'home' | 'article';

const mvpProof = buildDrywriterMvpT2(DRYWRITER_MVP_INPUT);

const App = () => {
  const [view, setView] = useState<View>('home');
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [dataState, setDataState] = useState<Pick<ContentListResult, 'source' | 'integrationStatus' | 'failureReason'>>({
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
      setDataState({
        source: result.source,
        integrationStatus: result.integrationStatus,
        failureReason: result.failureReason,
      });
    });
    return () => { active = false; };
  }, []);

  const displayRecords = useMemo(
    () => [mvpProof.record, ...records.filter((record) => record.contentId !== mvpProof.record.contentId)],
    [records],
  );

  const articles = useMemo(
    () => displayRecords.map(renderArticle).sort((a, b) => b.date.localeCompare(a.date)),
    [displayRecords],
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
  }, []);

  const goHome = useCallback(() => {
    setSelectedId(null);
    setView('home');
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
          failureReason={dataState.failureReason}
          mvpProof={mvpProof}
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
