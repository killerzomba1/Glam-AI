import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, Droplets, Scan, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyseSkin } from '@/api';
import { useLang } from '@/lib/LanguageContext';

export default function SkinTab() {
  const { t } = useLang();
  const st = t.glamPage.skin;

  const [imagePreview, setImagePreview] = useState(null);
  const [description,  setDescription]  = useState('');
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setImagePreview(r.result);
    r.readAsDataURL(file);
  };

  const analyse = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyseSkin({ hasPhoto: !!imagePreview, description });
      setResult(data);
    } catch {
      setError(t.common.error);
    }
    setLoading(false);
  };

  const score = result?.skin_score ?? null;

  return (
    <div className="px-5 py-5 max-w-lg mx-auto space-y-5">
      <div>
        <h2 className="font-display text-2xl font-light">{st.title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{st.subtitle}</p>
      </div>

      {/* Upload zone */}
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors bg-secondary/30 overflow-hidden"
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {imagePreview ? (
          <img src={imagePreview} alt="" className="w-full h-44 object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 py-10">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">{st.upload}</p>
            <p className="text-xs text-muted-foreground">JPG, PNG · front-facing works best</p>
          </div>
        )}
      </button>

      {/* Describe */}
      <textarea
        className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30 transition-all min-h-[72px] placeholder:text-muted-foreground"
        placeholder={st.describe}
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <Button
        variant="gold"
        className="w-full rounded-xl h-11 gap-2"
        onClick={analyse}
        disabled={loading || (!imagePreview && !description.trim())}
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />{st.analysing}</>
          : <><Scan className="w-4 h-4" />{st.analyse}</>
        }
      </Button>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2">{error}</p>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Score card */}
          <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              {score !== null && (
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                      strokeDasharray={`${(score / 100) * 176} 176`}
                      strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">{score}</span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-display text-base font-semibold mb-2">{st.score}</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.skin_type      && <Badge variant="gold"  className="text-[10px]">{result.skin_type}</Badge>}
                  {result.hydration_level && <Badge variant="secondary" className="text-[10px]"><Droplets className="w-2.5 h-2.5 inline mr-0.5" />{result.hydration_level}</Badge>}
                  {result.texture        && <Badge variant="outline" className="text-[10px]">{result.texture}</Badge>}
                </div>
              </div>
            </div>
          </div>

          {/* Concerns */}
          {result.concerns?.length > 0 && (
            <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="font-semibold text-sm">{st.concerns}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.concerns.map((c, i) => <Badge key={i} variant="outline" className="text-xs border-destructive/30 text-destructive">{c}</Badge>)}
              </div>
            </div>
          )}

          {/* Positive */}
          {result.positive_attributes?.length > 0 && (
            <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <p className="font-semibold text-sm">{st.positive}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.positive_attributes.map((p, i) => <Badge key={i} variant="gold" className="text-xs">{p}</Badge>)}
              </div>
            </div>
          )}

          {/* Treatments */}
          {result.treatments?.length > 0 && (
            <div className="space-y-3">
              <p className="font-semibold text-sm px-1">{st.treatments}</p>
              {result.treatments.map((tr, i) => (
                <div key={i} className="bg-card rounded-xl border border-border/60 p-4 shadow-sm">
                  <p className="text-xs font-bold text-primary mb-1">◈ {tr.concern}</p>
                  <p className="text-xs text-foreground/80 leading-relaxed mb-2">{tr.recommendation}</p>
                  {tr.key_ingredients?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {tr.key_ingredients.map((ing, j) => <Badge key={j} variant="secondary" className="text-[9px]">{ing}</Badge>)}
                    </div>
                  )}
                  {tr.product_suggestion && (
                    <p className="text-[11px] text-muted-foreground italic">💄 {tr.product_suggestion}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Makeup tips */}
          {result.makeup_tips?.length > 0 && (
            <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="font-semibold text-sm">{st.makeupTips}</p>
              </div>
              <ul className="space-y-2">
                {result.makeup_tips.map((tip, i) => (
                  <li key={i} className="text-xs text-foreground/80 leading-relaxed flex gap-2">
                    <span className="text-primary mt-0.5 shrink-0">✦</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
