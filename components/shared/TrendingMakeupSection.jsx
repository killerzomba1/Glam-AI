import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, TrendingUp, Newspaper, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchTrendingCategory } from '@/api';
import { useLang } from '@/lib/LanguageContext';

export default function TrendingMakeupSection() {
  const { t } = useLang();
  const hp = t.homePage;

  const CATEGORIES = [
    { key: 'trending', label: hp.tabs.trending, icon: TrendingUp, color: 'bg-pink-50 text-pink-600',   query: 'trending makeup products 2025 must have beauty' },
    { key: 'news',     label: hp.tabs.news,     icon: Newspaper,  color: 'bg-amber-50 text-amber-600', query: 'beauty news makeup launches 2025' },
    { key: 'celebrity',label: hp.tabs.celebrity,icon: Star,       color: 'bg-purple-50 text-purple-600',query: 'celebrity makeup looks red carpet 2025 beauty inspiration' },
  ];

  const [activeTab, setActiveTab] = useState('trending');
  const [data,      setData]      = useState({});
  const [loading,   setLoading]   = useState({});

  const fetchCategory = async (cat) => {
    if (data[cat.key] || loading[cat.key]) return;
    setLoading(p => ({ ...p, [cat.key]: true }));
    try {
      const result = await fetchTrendingCategory({ categoryLabel: cat.label, query: cat.query });
      setData(p => ({ ...p, [cat.key]: result.items || [] }));
    } catch {
      setData(p => ({ ...p, [cat.key]: [] }));
    } finally {
      setLoading(p => ({ ...p, [cat.key]: false }));
    }
  };

  useEffect(() => { fetchCategory(CATEGORIES[0]); }, []);

  const handleTab = (cat) => { setActiveTab(cat.key); fetchCategory(cat); };

  const activeCat = CATEGORIES.find(c => c.key === activeTab);
  const items     = data[activeTab] || [];
  const isLoading = loading[activeTab];

  return (
    <div className="px-5 pt-6 pb-2 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold">{hp.trending}</h2>
        <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
          {hp.liveLabel}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => handleTab(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === cat.key
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">{t.common.loading}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 bg-card rounded-2xl p-4 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group block"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeCat?.color || 'bg-muted'}`}>
                {activeCat && <activeCat.icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground leading-snug">{item.title}</p>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  {item.tag && (
                    <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.tag}</span>
                  )}
                  {item.source && (
                    <span className="text-[10px] text-muted-foreground">{item.source}</span>
                  )}
                </div>
              </div>
            </motion.a>
          ))}
          {items.length === 0 && !isLoading && (
            <p className="text-center text-sm text-muted-foreground py-8">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}
