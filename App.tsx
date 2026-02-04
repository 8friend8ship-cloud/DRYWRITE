
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
    date: '2026-02-05',
    title: "총성의 부검: 100만 유튜버는 어떻게 탄생하는가",
    coverImageUrl: "https://images.unsplash.com/photo-1599249303258-d5e08c16ea91?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rawText: `# 총성의 부검: 100만 유튜버는 어떻게 탄생하는가

**오가닉 마케터** | C | 2026.02.05

---

롱블랙 프렌즈 C

100만 구독자를 모은 유튜브 채널. 다들 부러워하죠. 하지만 그중엔 ‘총성을 울린’ 채널이 있습니다. 빠르게 성장했지만, 그만큼 빠르게 잊히는 채널 말입니다. 조회수와 구독자 수에만 매몰되어, 진짜 팬을 만들지 못한 거죠.

오늘, 이 ‘총성’의 원인을 부검해 보려 합니다. 무엇이 이들을 ‘반짝 스타’로 만들고, 또 사라지게 했을까요?

## Chapter 1: 알고리즘의 단맛에 중독되다

모든 것은 ‘알고리즘’에서 시작됩니다. 유튜브는 시청자가 좋아할 만한 영상을 추천해 줍니다. 채널 운영자들은 이 알고리즘의 선택을 받기 위해 사활을 겁니다. ‘어그로’를 끄는 제목, 자극적인 썸네일, 유행하는 챌린지… 모두 알고리즘의 간택을 받기 위한 몸부림입니다.

단기적으로는 효과적입니다. 영상 몇 개가 ‘떡상’하며 구독자가 폭발적으로 늘어납니다. 운영자는 알고리즘이라는 마약의 단맛에 취합니다. ‘이게 되는구나!’ 싶어 더 자극적인 콘텐츠를 양산합니다.

하지만 독은 퍼져나갑니다. 시청자들은 자극적인 콘텐츠에만 반응할 뿐, 채널 자체에는 아무런 애정을 느끼지 못합니다. ‘알고리즘이 추천해 줘서 봤을 뿐’, 그 이상도 이하도 아닌 관계가 형성되는 겁니다.`
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
    coverImageUrl: "https://images.unsplash.com/photo-1600132806373-16b2d1523a54?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
