import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Moon, Sun, Info, ChevronRight, Sparkles } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { AI_ARTISTS, TRANSLATIONS } from '@/i18n';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { t, lang, switchLang } = useLang();
  const sp = t.settingsPage;

  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('glamai-dark', String(next));
  };

  useEffect(() => {
    const saved = localStorage.getItem('glamai-dark');
    if (saved === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-b from-accent/50 to-background px-5 pt-10 pb-6">
        <h1 className="font-display text-3xl font-light">{sp.title}</h1>
      </div>

      <div className="px-5 pb-28 space-y-6">
        {/* Language */}
        <section>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium mb-3 flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> {sp.language}
          </p>
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            {Object.entries(TRANSLATIONS).map(([code, tr], i, arr) => (
              <button
                key={code}
                onClick={() => switchLang(code)}
                className={`w-full flex items-center justify-between px-5 py-4 transition-all hover:bg-secondary/50 ${
                  i < arr.length - 1 ? 'border-b border-border/40' : ''
                } ${lang === code ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tr.flag}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium">{tr.name}</p>
                    {tr.dir === 'rtl' && <p className="text-[10px] text-muted-foreground">Right-to-left</p>}
                  </div>
                </div>
                {lang === code && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <span className="text-primary-foreground text-[10px] font-bold">✓</span>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Dark mode */}
        <section>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium mb-3 flex items-center gap-1.5">
            {darkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />} {sp.theme}
          </p>
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <p className="text-sm font-medium">{sp.theme}</p>
              </div>
              <button
                onClick={toggleDark}
                className={`w-11 h-6 rounded-full transition-all duration-300 relative ${darkMode ? 'bg-primary' : 'bg-muted'}`}
              >
                <motion.div
                  animate={{ x: darkMode ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                />
              </button>
            </div>
          </div>
        </section>

        {/* AI Artists */}
        <section>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> {sp.artists}
          </p>
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            {AI_ARTISTS.map((artist, i) => (
              <div
                key={artist.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${i < AI_ARTISTS.length - 1 ? 'border-b border-border/40' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${artist.color} flex items-center justify-center text-xl`}>
                  {artist.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{artist.name}</p>
                  <p className="text-[11px] text-muted-foreground">{artist.specialty} · {artist.origin}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section>
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm font-medium">{sp.about}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{sp.version}</p>
              <Badge variant="gold" className="text-[10px]">Stable</Badge>
            </div>
          </div>
        </section>

        {/* Powered by */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          Powered by base44 · AI Beauty Intelligence
        </p>
      </div>
    </div>
  );
}
