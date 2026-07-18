import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useLang } from '@/lib/LanguageContext';

export default function LookDetail({ look, onBack, onDelete }) {
  const { t } = useLang();
  const sp = t.savedPage;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-accent/60 to-background px-5 pt-6 pb-6">
        <div className="max-w-lg mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.common.back}
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{look.title}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {look.occasion   && <Badge variant="secondary" className="text-xs">{look.occasion}</Badge>}
                {look.skin_tone  && <Badge variant="outline"   className="text-xs">{look.skin_tone}</Badge>}
                {look.dress_color && <Badge variant="outline"  className="text-xs">{look.dress_color} outfit</Badge>}
                {look.artist     && <Badge variant="gold"      className="text-xs">✦ {look.artist}</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-28 max-w-lg mx-auto space-y-5">
        {/* Selfie */}
        {look.image_url && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden border border-border/50">
            <img src={look.image_url} alt="Reference" className="w-full h-52 object-cover" />
          </motion.div>
        )}

        {/* Look instructions */}
        {look.look_details && (
          <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
            <h3 className="font-display text-base font-semibold mb-3">Step-by-Step Guide</h3>
            <div className="prose prose-sm max-w-none text-sm text-foreground/80 leading-relaxed">
              <ReactMarkdown>{look.look_details}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Products */}
        {look.products?.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display text-base font-semibold px-1">{t.common.products}</h3>
            {look.products.map((product, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.category}</p>
                    <p className="text-xs text-muted-foreground">{product.brand} — {product.product_name}</p>
                    {product.shade && <Badge variant="outline" className="text-[10px] mt-1">{product.shade}</Badge>}
                  </div>
                </div>
                {product.application_tip && (
                  <p className="text-xs text-muted-foreground mt-2 bg-secondary/50 rounded-lg p-2.5">
                    💡 {product.application_tip}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete */}
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full rounded-xl h-11 gap-2 text-destructive border-destructive/20 hover:bg-destructive/5"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
            {sp.delete}
          </Button>
        </div>
      </div>
    </div>
  );
}
