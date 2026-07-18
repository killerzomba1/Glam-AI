import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';
import TrendingMakeupSection from '@/components/shared/TrendingMakeupSection';
import { AI_ARTISTS } from '@/i18n';

export default function HomePage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const hp = t.homePage;

  return (
    <div className="max-w-lg mx-auto">
      {/* Hero header */}
      <div className="bg-gradient-to-b from-accent/50 to-background px-5 pt-10 pb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-1 font-medium">GlamAI</p>
          <h1 className="font-display text-3xl font-light text-foreground leading-tight">{hp.greeting}</h1>
          <p className="text-muted-foreground text-sm mt-1">{hp.subtitle}</p>
        </motion.div>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {hp.actions.map((action, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => navigate(action.path)}
              className="bg-card border border-border/60 rounded-2xl p-4 text-left hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <span className="text-2xl block mb-2">{action.icon}</span>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* AI Artists strip */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium mb-3">Our AI Artists</p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {AI_ARTISTS.map((artist, i) => (
            <motion.button
              key={artist.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate('/glam')}
              className="flex-shrink-0 flex flex-col items-center gap-1.5"
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${artist.color} flex items-center justify-center text-2xl shadow-md`}>
                {artist.avatar}
              </div>
              <p className="text-[10px] text-center text-muted-foreground w-14 leading-tight font-medium">
                {artist.name.split(' ')[0]}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Trending section */}
      <TrendingMakeupSection />
    </div>
  );
}
