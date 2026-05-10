// ─── VirtualTab ───────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { virtualTryOn } from '@/api';
import { VIRTUAL_LOOKS } from '@/i18n';
import { useLang } from '@/lib/LanguageContext';

export function VirtualTab() {
  const { t } = useLang();
  const vt = t.glamPage.virtual;

  const [selfie,       setSelfie]       = useState(null);
  const [selectedLook, setSelectedLook] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState('');
  const [error,        setError]        = useState('');
  const fileRef = useRef(null);

  const apply = async () => {
    if (!selectedLook) return;
    setLoading(true);
    setError('');
    try {
      const text = await virtualTryOn({ lookName: selectedLook.name, lookDesc: selectedLook.desc, hasPhoto: !!selfie });
      setResult(text);
    } catch {
      setError(t.common.error);
    }
    setLoading(false);
  };

  return (
    <div className="px-5 py-5 max-w-lg mx-auto space-y-5">
      <div>
        <h2 className="font-display text-2xl font-light">{vt.title}</h2>
      </div>

      {/* Selfie upload */}
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors overflow-hidden bg-secondary/30"
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          const r = new FileReader();
          r.onload = () => setSelfie(r.result);
          r.readAsDataURL(file);
        }} />
        {selfie ? (
          <img src={selfie} alt="" className="w-full h-44 object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 py-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium">{vt.upload}</p>
            <p className="text-xs text-muted-foreground">Optional — for personalised result</p>
          </div>
        )}
      </button>

      {/* Look grid */}
      <div>
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium mb-2">{vt.selectLook}</p>
        <div className="grid grid-cols-2 gap-2">
          {VIRTUAL_LOOKS.map(look => (
            <button
              key={look.id}
              onClick={() => setSelectedLook(look)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                selectedLook?.id === look.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border/60 bg-card hover:border-primary/30'
              }`}
            >
              <span className="text-2xl">{look.emoji}</span>
              <div>
                <p className="text-xs font-semibold">{look.name}</p>
                <p className="text-[10px] text-muted-foreground">{look.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="gold"
        className="w-full rounded-xl h-11 gap-2"
        onClick={apply}
        disabled={loading || !selectedLook}
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />{vt.applying}</>
          : <><Wand2 className="w-4 h-4" />{vt.apply}</>
        }
      </Button>

      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2">{error}</p>}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm"
        >
          <p className="font-display text-base font-semibold mb-3">
            {selectedLook?.emoji} {selectedLook?.name} — {vt.result}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{result}</p>
        </motion.div>
      )}
    </div>
  );
}

// ─── SeasonalTab ──────────────────────────────────────────────────────────────
import { getSeasonalTips } from '@/api';
import { SEASONAL_DATA } from '@/i18n';
import { Sparkles } from 'lucide-react';

export function SeasonalTab() {
  const { t } = useLang();
  const st = t.glamPage.seasonal;

  const [active,  setActive]  = useState(0);
  const [aiTips,  setAiTips]  = useState({});
  const [loading, setLoading] = useState(false);

  const season     = SEASONAL_DATA[active];
  const seasonName = st.seasons[active];

  const fetchTips = async () => {
    if (aiTips[active]) return;
    setLoading(true);
    try {
      const text = await getSeasonalTips({ seasonName });
      setAiTips(p => ({ ...p, [active]: text }));
    } catch {}
    setLoading(false);
  };

  return (
    <div className="px-5 py-5 max-w-lg mx-auto space-y-5">
      <h2 className="font-display text-2xl font-light">{st.title}</h2>

      {/* Season tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {st.seasons.map((name, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
              active === i
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                : 'bg-secondary text-muted-foreground hover:bg-muted'
            }`}
          >
            {SEASONAL_DATA[i].emoji} {name}
          </button>
        ))}
      </div>

      {/* Palette */}
      <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm">
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium mb-3">{st.palette}</p>
        <div className="flex gap-3 mb-4">
          {season.palette.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full border-2 border-white/60 shadow-md" style={{ background: c }} />
              <span className="text-[9px] text-muted-foreground">{c}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">{season.tip}</p>
      </div>

      {/* Products */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">{st.products}</p>
        {season.products.map((p, i) => (
          <div key={i} className="bg-card rounded-xl border border-border/60 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.brand} · {p.shade}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Tips */}
      <Button
        variant="outline"
        className="w-full rounded-xl h-10 gap-2 text-sm"
        onClick={fetchTips}
        disabled={loading || !!aiTips[active]}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary" />}
        {loading ? t.common.loading : st.aiTips}
      </Button>

      {aiTips[active] && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/30 rounded-2xl border border-border/60 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">AI Expert Tips</p>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{aiTips[active]}</p>
        </motion.div>
      )}
    </div>
  );
}
