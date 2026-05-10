import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ImagePlus, Loader2, Sparkles, BookmarkPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { artistChat, generateFullLook, uploadImage } from '@/api';
import { AI_ARTISTS } from '@/i18n';
import { useLang } from '@/lib/LanguageContext';

export default function ArtistTab({ onSaveLook }) {
  const { t } = useLang();
  const at = t.glamPage.artist;

  const [selectedArtist, setSelectedArtist] = useState(AI_ARTISTS[0]);
  const [messages,       setMessages]        = useState([{
    role: 'ai',
    text: `Hi! I'm ${AI_ARTISTS[0].name}, specialising in ${AI_ARTISTS[0].specialty}. Describe the look you'd love — or set your preferences and tap Generate.`,
  }]);
  const [input,          setInput]           = useState('');
  const [loading,        setLoading]         = useState(false);
  const [saving,         setSaving]          = useState(false);
  const [savedMsg,       setSavedMsg]        = useState('');
  const [occasion,       setOccasion]        = useState('');
  const [skinTone,       setSkinTone]        = useState('');
  const [eyeColor,       setEyeColor]        = useState('');
  const [outfitColor,    setOutfitColor]     = useState('#C9A96E');
  const [imagePreview,   setImagePreview]    = useState(null);
  const [imageFile,      setImageFile]       = useState(null);
  const [generatedLook,  setGeneratedLook]   = useState(null);
  const [showPrefs,      setShowPrefs]       = useState(false);

  const endRef  = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const changeArtist = (artist) => {
    setSelectedArtist(artist);
    setMessages([{ role: 'ai', text: `Hi! I'm ${artist.name} from ${artist.origin}, specialising in ${artist.specialty}. Ready to create your perfect look!` }]);
    setGeneratedLook(null);
  };

  const send = async () => {
    const msg = input.trim() || (imagePreview ? 'Please analyse my photo and suggest a makeup look.' : '');
    if (!msg) return;
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    try {
      const context = { occasion, 'skin tone': skinTone, 'eye color': eyeColor, 'outfit': outfitColor };
      if (imagePreview) context.note = 'User uploaded a photo';
      const hist = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
      const reply = await artistChat({ artist: selectedArtist, history: hist, userMessage: msg, context });
      setMessages(m => [...m, { role: 'ai', text: reply, artist: selectedArtist }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', text: t.common.error, artist: selectedArtist }]);
    }
    setLoading(false);
  };

  const generate = async () => {
    setLoading(true);
    try {
      const look = await generateFullLook({ artist: selectedArtist, occasion, skinTone, eyeColor, outfitColor, hasPhoto: !!imagePreview });
      const full = { ...look, artist: selectedArtist.name };
      setGeneratedLook(full);
      setMessages(m => [...m, {
        role: 'ai',
        text: look.look_details || `Here's your ${look.title || 'custom'} look! Tap "Save Look" to keep it.`,
        artist: selectedArtist,
        look: full,
      }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', text: t.common.error, artist: selectedArtist }]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!generatedLook) return;
    setSaving(true);
    try {
      let imageUrl = null;
      if (imageFile) { try { imageUrl = await uploadImage(imageFile); } catch {} }
      await onSaveLook({
        ...generatedLook,
        skin_tone: skinTone,
        eye_color: eyeColor,
        dress_color: outfitColor,
        image_url: imageUrl || undefined,
        is_favorite: false,
      });
      setSavedMsg(at.saved);
      setTimeout(() => { setSavedMsg(''); setGeneratedLook(null); }, 3000);
    } catch {}
    setSaving(false);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      {/* Artist picker */}
      <div className="px-4 pt-4 pb-3 border-b border-border/50">
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium mb-2">{at.chooseArtist}</p>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {AI_ARTISTS.map(a => (
            <button
              key={a.id}
              onClick={() => changeArtist(a)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 transition-all`}
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${a.color} flex items-center justify-center text-xl shadow-md transition-all ${
                selectedArtist.id === a.id ? 'scale-110 ring-2 ring-primary ring-offset-2' : 'opacity-70'
              }`}>
                {a.avatar}
              </div>
              <span className={`text-[9px] font-medium w-12 text-center leading-tight truncate ${selectedArtist.id === a.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {a.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Preferences toggle */}
      <div className="px-4 py-2.5 border-b border-border/50">
        <button
          onClick={() => setShowPrefs(v => !v)}
          className="text-xs text-primary font-semibold flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {showPrefs ? 'Hide preferences' : 'Set preferences & generate'}
        </button>

        {showPrefs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              {/* Occasion */}
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block mb-1">{at.occasion}</label>
                <select className="w-full text-xs bg-secondary border-0 rounded-xl px-3 py-2 text-foreground appearance-none" value={occasion} onChange={e => setOccasion(e.target.value)}>
                  <option value="">Any</option>
                  {at.occasions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              {/* Skin tone */}
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block mb-1">{at.skinTone}</label>
                <select className="w-full text-xs bg-secondary border-0 rounded-xl px-3 py-2 text-foreground appearance-none" value={skinTone} onChange={e => setSkinTone(e.target.value)}>
                  <option value="">Any</option>
                  {at.skinTones.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {/* Eye color */}
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block mb-1">{at.eyeColor}</label>
                <select className="w-full text-xs bg-secondary border-0 rounded-xl px-3 py-2 text-foreground appearance-none" value={eyeColor} onChange={e => setEyeColor(e.target.value)}>
                  <option value="">Any</option>
                  {at.eyeColors.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              {/* Outfit color */}
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block mb-1">{at.outfitColor}</label>
                <input type="color" className="w-full h-9 rounded-xl border border-border/60 bg-secondary cursor-pointer px-1" value={outfitColor} onChange={e => setOutfitColor(e.target.value)} />
              </div>
            </div>

            {/* Photo + Generate */}
            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/60 bg-card text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ImagePlus className="w-3.5 h-3.5" />
                {imagePreview ? 'Photo added ✓' : at.upload}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <Button variant="gold" size="sm" className="flex-1 rounded-xl text-xs" onClick={generate} disabled={loading}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {at.generate}
              </Button>
            </div>

            {imagePreview && (
              <img src={imagePreview} alt="" className="w-full h-28 object-cover rounded-xl border border-border/50" />
            )}
          </motion.div>
        )}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0" style={{ maxHeight: '38vh' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-card border border-border/60 text-foreground rounded-bl-sm shadow-sm'
            }`}>
              {m.role === 'ai' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-base">{(m.artist || selectedArtist).avatar}</span>
                  <span className="text-[10px] font-semibold text-primary">{(m.artist || selectedArtist).name}</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{m.text}</p>
              {/* Product chips if look attached */}
              {m.look?.products?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {m.look.products.slice(0, 3).map((p, j) => (
                    <Badge key={j} variant="gold" className="text-[9px]">{p.brand} {p.product_name}</Badge>
                  ))}
                  {m.look.products.length > 3 && <Badge variant="outline" className="text-[9px]">+{m.look.products.length - 3} more</Badge>}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-base">{selectedArtist.avatar}</span>
                <span className="text-[10px] font-semibold text-primary">{selectedArtist.name}</span>
              </div>
              <div className="flex gap-1 items-center">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Save look banner */}
      {generatedLook && !savedMsg && (
        <div className="px-4 py-2 bg-accent/40 border-t border-border/50">
          <Button variant="gold" size="sm" className="w-full rounded-xl gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            {saving ? at.saving : at.saveLook}
          </Button>
        </div>
      )}
      {savedMsg && (
        <div className="px-4 py-2 bg-green-50 dark:bg-green-950/30 border-t border-green-200/50 text-center text-sm text-green-700 dark:text-green-400 font-medium flex items-center justify-center gap-1.5">
          <Check className="w-4 h-4" /> {savedMsg}
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-border/50 flex gap-2 items-end bg-background/80 backdrop-blur-sm">
        <textarea
          className="flex-1 bg-secondary rounded-2xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30 transition-all min-h-[40px] max-h-[100px] placeholder:text-muted-foreground"
          placeholder={at.placeholder}
          value={input}
          rows={1}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button
          onClick={send}
          disabled={loading || (!input.trim() && !imagePreview)}
          className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}
