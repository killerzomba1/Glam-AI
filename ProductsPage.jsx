import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, ShoppingBag, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchProducts } from '@/api';
import { useLang } from '@/lib/LanguageContext';

export default function ProductsPage() {
  const { t }                         = useLang();
  const pp                            = t.productsPage;
  const [category, setCategory]       = useState('All');
  const [search,   setSearch]         = useState('');
  const [products, setProducts]       = useState([]);
  const [loading,  setLoading]        = useState(false);
  const [fetched,  setFetched]        = useState(false);

  const load = async (cat = category, q = search) => {
    setLoading(true);
    try {
      const data = await fetchProducts({ category: cat, search: q });
      setProducts(data.products || []);
      setFetched(true);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  };

  // Load on first render
  useEffect(() => { load(); }, []);

  const handleCategory = (cat) => {
    setCategory(cat);
    load(cat, search);
  };

  const EMOJI_MAP = {
    Foundation: '🌟', Blush: '🌸', Eye: '✨', Lip: '💄',
    Skincare: '💧', Highlighter: '✦', All: '🛍',
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-b from-accent/50 to-background px-5 pt-10 pb-5">
        <h1 className="font-display text-3xl font-light">{pp.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{pp.subtitle}</p>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            className="w-full bg-card border border-border/60 rounded-2xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground"
            placeholder={pp.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(category, search)}
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="px-5 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {pp.categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                  : 'bg-secondary text-muted-foreground hover:bg-muted'
              }`}
            >
              {EMOJI_MAP[cat] || '✦'} {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">{t.common.loading}</span>
          </div>
        ) : products.length === 0 && fetched ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No products found. Try a different search.</p>
            <Button variant="outline" className="rounded-xl" onClick={() => load()}>
              Browse all products
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border/60 shadow-sm p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/40 flex items-center justify-center text-2xl shrink-0">
                    {product.emoji || EMOJI_MAP[product.category] || '✦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold leading-tight">{product.product_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>
                      </div>
                      {product.price_range && (
                        <Badge variant="gold" className="text-[10px] shrink-0">{product.price_range}</Badge>
                      )}
                    </div>

                    {product.benefit && (
                      <p className="text-xs text-foreground/70 mt-2 leading-relaxed">{product.benefit}</p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {product.category  && <Badge variant="secondary" className="text-[9px]">{product.category}</Badge>}
                      {product.skin_type && <Badge variant="outline"   className="text-[9px]">{product.skin_type}</Badge>}
                      {product.shades    && <Badge variant="blush"     className="text-[9px]">{product.shades}</Badge>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
