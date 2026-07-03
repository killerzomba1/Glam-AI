import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LookDetail from '@/components/shared/LookDetail';
import { useLooks } from '@/hooks/useLooks';
import { useLang } from '@/lib/LanguageContext';

export default function SavedPage() {
  const { t }                              = useLang();
  const sp                                 = t.savedPage;
  const { looks, loading, removeLook, toggleFav } = useLooks();
  const [selectedLook, setSelectedLook]    = useState(null);
  const navigate                           = useNavigate();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  if (selectedLook) return (
    <LookDetail
      look={selectedLook}
      onBack={() => setSelectedLook(null)}
      onDelete={async () => {
        await removeLook(selectedLook.id);
        setSelectedLook(null);
      }}
    />
  );

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-b from-accent/50 to-background px-5 pt-10 pb-6">
        <h1 className="font-display text-3xl font-light">{sp.title}</h1>
        {looks.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">{looks.length} look{looks.length !== 1 ? 's' : ''} saved</p>
        )}
      </div>

      <div className="px-5 pb-28">
        {looks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-accent/50 flex items-center justify-center text-4xl">✦</div>
            <div>
              <p className="font-display text-xl font-light mb-2">{sp.empty}</p>
              <p className="text-sm text-muted-foreground">{sp.emptyDesc}</p>
            </div>
            <Button variant="gold" className="rounded-xl gap-2" onClick={() => navigate('/glam')}>
              <Wand2 className="w-4 h-4" />
              {sp.goToGlam}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Favourites section */}
            {looks.some(l => l.is_favorite) && (
              <div className="mb-2">
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium mb-2 flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> {sp.favourite}
                </p>
                <div className="space-y-3">
                  {looks.filter(l => l.is_favorite).map(look => (
                    <LookCard key={look.id} look={look} onOpen={() => setSelectedLook(look)} onToggleFav={() => toggleFav(look.id, look.is_favorite)} />
                  ))}
                </div>
              </div>
            )}

            {/* All looks */}
            <div>
              {looks.some(l => l.is_favorite) && (
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium mb-2">All Looks</p>
              )}
              <div className="space-y-3">
                {looks.filter(l => !l.is_favorite).map(look => (
                  <LookCard key={look.id} look={look} onOpen={() => setSelectedLook(look)} onToggleFav={() => toggleFav(look.id, look.is_favorite)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LookCard({ look, onOpen, onToggleFav }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden"
    >
      {look.image_url && (
        <img src={look.image_url} alt="" className="w-full h-32 object-cover cursor-pointer" onClick={onOpen} />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <button onClick={onOpen} className="text-left flex-1">
            <p className="font-display text-lg font-semibold leading-tight hover:text-primary transition-colors">{look.title}</p>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onToggleFav(); }}
            className={`p-1.5 rounded-lg transition-all ${look.is_favorite ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'text-muted-foreground hover:text-rose-400'}`}
          >
            <Heart className={`w-4 h-4 ${look.is_favorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {look.occasion  && <Badge variant="secondary" className="text-[10px]">{look.occasion}</Badge>}
          {look.skin_tone && <Badge variant="outline"   className="text-[10px]">{look.skin_tone}</Badge>}
          {look.artist    && <Badge variant="gold"      className="text-[10px]">✦ {look.artist}</Badge>}
        </div>

        {look.look_details && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">{look.look_details}</p>
        )}

        <button
          onClick={onOpen}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View full look →
        </button>
      </div>
    </motion.div>
  );
}
