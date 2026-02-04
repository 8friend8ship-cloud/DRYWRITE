
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { ContentBlock, Article } from './types';
import { ArticleView } from './components/ArticleView';
import { HomeView } from './components/HomeView';
import { AdminView } from './components/AdminView';
import { MenuView } from './components/MenuView';

// Sample database of articles, used only for the first visit.
const initialArticles: Article[] = [
  {
    id: '1',
    date: '2026-02-04',
    title: "니콜라스 콜 : 온라인 글쓰기로 연 80억원 버는 작가, 노하우 대해부",
    coverImageUrl: "https://images.unsplash.com/photo-1589552159659-199317d79b9a?q=80&w=1887&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rawText: `# 니콜라스 콜 : 온라인 글쓰기로 연 80억원 버는 작가, 노하우 대해부

**니콜라스 콜** | B | 2026.02.04

---

롱블랙 프렌즈 B

‘이번 주엔 블로그에 글을 꼭 써야지.’
글쓰기를 좋아하는 분들이라면, 한 번쯤 이런 다짐을 해봤을 거예요. 하지만 막상 시작하려면 막막하죠. ‘어떤 주제로 써야 사람들이 좋아할까?’, ‘어떻게 써야 끝까지 읽게 만들까?’

여기, 온라인 글쓰기만으로 연 80억원을 버는 작가가 있습니다. 바로 니콜라스 콜(Nicolas Cole)입니다. 그는 말합니다. “사람들은 당신의 이야기에 관심 없다. 그들은 자신의 문제를 해결해 줄 이야기에만 관심 있다.”

## Chapter 1: 독자의 문제를 해결하는 글쓰기

콜은 글쓰기의 핵심이 ‘독자 중심주의’에 있다고 강조합니다. 대부분의 작가 지망생들은 자신이 쓰고 싶은 이야기를 쓰느라 독자가 무엇을 원하는지 잊어버리곤 합니다. 하지만 온라인 세상에서 독자들은 냉정합니다. 3초 안에 흥미를 끌지 못하면 가차 없이 스크롤을 내려버리죠.

그렇다면 어떻게 독자의 시선을 사로잡을 수 있을까요? 콜의 비법은 간단합니다. ‘독자가 밤잠 설치며 고민하는 문제는 무엇인가?’를 파악하는 것입니다. 그리고 그 문제에 대한 해결책을 제시하는 형태로 글을 구성하는 거죠.

예를 들어 ‘나의 스페인 여행기’라는 글 대신, ‘왕초보도 200% 만족하는 스페인 여행 루트 총정리’라는 글이 훨씬 더 많은 독자를 끌어모으는 것과 같은 원리입니다. 전자는 순전히 개인의 경험이지만, 후자는 ‘스페인 여행을 계획하는’ 독자의 문제를 명확하게 해결해주기 때문입니다.`
  },
  {
    id: '2',
    date: '2026-02-03',
    title: "생각의 탄탄함: 당신의 하루를 바꾸는 10분 루틴",
    coverImageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1770&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rawText: `# 생각의 탄탄함: 당신의 하루를 바꾸는 10분 루틴

**롱블랙 에디터** | A | 2026.02.03

---

우리는 정보의 홍수 속에서 살아갑니다. 매일 수많은 기사와 영상, 소셜 미디어 포스트가 우리의 주의를 빼앗으려 경쟁합니다. 이런 환경 속에서 생각의 중심을 잡기란 쉽지 않죠.

'롱블랙'은 이러한 문제의식에서 출발했습니다. 하루에 단 하나의 깊이 있는 아티클을 통해, 생각의 근육을 키우는 10분의 루틴을 제안합니다.

## 왜 '하루에 하나'인가?

정보 과부하는 오히려 지적인 성장을 방해합니다. 여러 가지를 얕게 아는 것보다, 한 가지를 깊게 파고드는 경험이 중요합니다. 롱블랙은 매일 엄선된 하나의 콘텐츠를 제공함으로써, 사용자가 정보의 소비자가 아닌, 사색가로 거듭나도록 돕습니다.`
  },
   {
    id: '3',
    date: '2026-02-02',
    title: "콘텐츠 설계의 비밀: 사용자를 사로잡는 법",
    coverImageUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=1770&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rawText: `# 콘텐츠 설계의 비밀: 사용자를 사로잡는 법

**콘텐츠 전략가** | C | 2026.02.02
---

훌륭한 콘텐츠는 단지 좋은 글을 쓰는 것에서 그치지 않습니다. 독자의 시선이 어디에 머무는지, 어떤 지점에서 흥미를 잃는지, 그리고 최종적으로 어떤 행동을 유도할 것인지까지 치밀하게 설계되어야 합니다. 이것이 바로 '콘텐츠 설계'의 영역입니다.

## 훅(Hook): 3초의 승부

온라인 콘텐츠의 성패는 첫 3초에 달려있습니다. 강력한 헤드라인과 도입부로 독자의 멱살을 잡고 끌고 들어와야 합니다. 독자의 호기심을 자극하거나, 그들이 가진 문제를 정확히 짚어주는 것이 핵심입니다.`
  }
];

const STORAGE_KEY = 'drywriter_articles';

const parseContent = (rawText: string): ContentBlock[] => {
    if (!rawText) return [];
    return rawText
      .split(/\n\s*\n/)
      .filter(block => block.trim() !== '')
      .map((block) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('# ')) {
          return { type: 'h1', content: trimmedBlock.substring(2) };
        }
        if (trimmedBlock.startsWith('## ')) {
          return { type: 'h2', content: trimmedBlock.substring(3) };
        }
        if (trimmedBlock.startsWith('### ')) {
          return { type: 'h3', content: trimmedBlock.substring(4) };
        }
        if (trimmedBlock.startsWith('---')) {
          return { type: 'hr', content: ''};
        }
         if (trimmedBlock.startsWith('**')) {
          return { type: 'meta', content: trimmedBlock.replace(/\*\*/g, '') };
        }
        return { type: 'p', content: trimmedBlock };
      });
}


const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'article' | 'admin'>('home');
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
        const storedArticles = localStorage.getItem(STORAGE_KEY);
        if (storedArticles) {
            return JSON.parse(storedArticles);
        }
    } catch (error) {
        console.error("Failed to parse articles from localStorage", error);
    }
    return initialArticles;
  });
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    } catch (error) {
        console.error("Failed to save articles to localStorage", error);
    }
  }, [articles]);

  const handleSelectArticle = useCallback((id: string) => {
    setSelectedArticleId(id);
    setView('article');
  }, []);

  const handleAddArticle = useCallback((article: Omit<Article, 'id' | 'date'>) => {
    setArticles(prev => [
        { 
            ...article, 
            id: String(Date.now()),
            date: new Date().toISOString().split('T')[0]
        },
        ...prev
    ]);
  }, []);

  const handleUpdateArticle = useCallback((updatedArticle: Article) => {
    setArticles(prev => prev.map(a => a.id === updatedArticle.id ? updatedArticle : a));
  }, []);

  const handleDeleteArticle = useCallback((articleId: string) => {
    setArticles(prev => prev.filter(a => a.id !== articleId));
  }, []);
  
  const handleImportArticles = useCallback((importedArticles: Article[]) => {
    setArticles(importedArticles);
  }, []);

  const goHome = () => {
    setSelectedArticleId(null);
    setView('home');
  };
  
  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);
  
  const selectedArticle = useMemo(() => {
    return articles.find(a => a.id === selectedArticleId) || null;
  }, [selectedArticleId, articles]);

  const sortedArticles = useMemo(() => {
      return [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [articles]);

  const filteredArticles = useMemo(() => {
      return sortedArticles.filter(article => 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.rawText.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [sortedArticles, searchQuery]);


  const renderContent = () => {
    switch(view) {
        case 'article':
            if (selectedArticle) {
                return (
                    <ArticleView 
                      title={selectedArticle.title}
                      coverImageUrl={selectedArticle.coverImageUrl}
                      content={parseContent(selectedArticle.rawText)}
                      onBack={goHome}
                      onMenuClick={openMenu}
                    />
                );
            }
            // Fallback to home if no article selected
            return <HomeView articles={filteredArticles} onSelectArticle={handleSelectArticle} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onMenuClick={openMenu}/>;

        case 'admin':
            return <AdminView 
                        articles={sortedArticles}
                        onAddArticle={handleAddArticle}
                        onUpdateArticle={handleUpdateArticle}
                        onDeleteArticle={handleDeleteArticle}
                        onImportArticles={handleImportArticles}
                        onExitAdmin={goHome} 
                    />;

        case 'home':
        default:
            return <HomeView articles={filteredArticles} onSelectArticle={handleSelectArticle} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onMenuClick={openMenu} />;
    }
  }

  return (
    <>
        {renderContent()}
        
        {view !== 'admin' && (
             <footer className="text-center py-4 bg-black">
                <button onClick={() => setView('admin')} className="text-xs text-gray-600 hover:text-gray-400">
                    Admin Page
                </button>
            </footer>
        )}

        {isMenuOpen && (
            <MenuView 
                articles={sortedArticles} 
                onSelectArticle={(id) => {
                    handleSelectArticle(id);
                    closeMenu();
                }}
                onClose={closeMenu}
            />
        )}
    </>
  );
};

export default App;
