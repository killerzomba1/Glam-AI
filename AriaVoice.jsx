import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { ariaChat, extractLookFromAria } from '@/api';
import { useLang } from '@/lib/LanguageContext';

const LANG_CODES  = { en: 'en-US', ar: 'ar-SA', ru: 'ru-RU', zh: 'zh-CN' };
const VOICE_LANGS = { en: 'en',    ar: 'ar',    ru: 'ru',    zh: 'zh' };

export default function AriaVoice({ onLookGenerated }) {
  const { lang, t } = useLang();
  const at = t.glamPage.aria;

  const [phase,    setPhase]    = useState('idle'); // idle | listening | thinking | speaking
  const [ariaText, setAriaText] = useState('');
  const [isMuted,  setIsMuted]  = useState(false);
  const [history,  setHistory]  = useState([]);
  const [error,    setError]    = useState('');

  const recognitionRef = useRef(null);
  const synthRef        = useRef(window.speechSynthesis);

  useEffect(() => {
    // Prime voices list
    synthRef.current?.getVoices();
    const handler = () => {};
    synthRef.current?.addEventListener('voiceschanged', handler);
    return () => synthRef.current?.removeEventListener('voiceschanged', handler);
  }, []);

  const speak = useCallback((text) => {
    if (isMuted || !synthRef.current) return;
    synthRef.current.cancel();
    const utt   = new SpeechSynthesisUtterance(text);
    utt.rate    = 1.0;
    utt.pitch   = 1.08;
    const voices     = synthRef.current.getVoices();
    const targetLang = VOICE_LANGS[lang] || 'en';
    const voice =
      voices.find(v => v.lang.startsWith(targetLang) && /female|samantha|google/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith(targetLang)) ||
      voices.find(v => v.lang.startsWith('en'));
    if (voice) utt.voice = voice;
    utt.onend  = () => setPhase('idle');
    utt.onerror = () => setPhase('idle');
    synthRef.current.speak(utt);
    setPhase('speaking');
  }, [isMuted, lang]);

  const handleUserSpeech = useCallback(async (transcript) => {
    setPhase('thinking');
    setError('');
    const newHistory = [...history, { role: 'user', content: transcript }];
    setHistory(newHistory);
    try {
      const response = await ariaChat({ history, userMessage: transcript, lang });
      setHistory([...newHistory, { role: 'assistant', content: response }]);
      setAriaText(response);
      speak(response);

      // Try to extract a look
      if (/look|occasion|makeup|wedding|party|event|date|office|glam|مكياج|образ|妆容/i.test(transcript)) {
        const extracted = await extractLookFromAria({ userMessage: transcript, ariaReply: response });
        if (extracted?.has_look && extracted?.title && onLookGenerated) {
          onLookGenerated(extracted);
        }
      }
    } catch {
      setError(t.common.error);
      setPhase('idle');
    }
  }, [history, speak, lang, t, onLookGenerated]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Speech recognition not supported in this browser.'); return; }
    synthRef.current?.cancel();
    const rec    = new SR();
    rec.lang     = LANG_CODES[lang] || 'en-US';
    rec.interimResults = false;
    recognitionRef.current = rec;
    let final = '';
    rec.onresult = e => { final = e.results[0][0].transcript; };
    rec.onend    = () => { setPhase('idle'); if (final.trim()) handleUserSpeech(final.trim()); };
    rec.onerror  = () => setPhase('idle');
    rec.start();
    setPhase('listening');
  }, [lang, handleUserSpeech]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setPhase('idle');
  }, []);

  const reset = () => {
    synthRef.current?.cancel();
    setHistory([]);
    setAriaText('');
    setPhase('idle');
    setError('');
  };

  const isListening = phase === 'listening';
  const isThinking  = phase === 'thinking';
  const isSpeaking  = phase === 'speaking';

  const statusText = isListening ? at.listening
    : isThinking  ? at.thinking
    : isSpeaking  ? at.speaking
    : at.tap;

  return (
    <div className="flex flex-col items-center gap-6 px-5 py-8 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="font-display text-2xl font-light">{at.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{at.subtitle}</p>
      </div>

      {/* Orb */}
      <div className="relative flex items-center justify-center w-40 h-40">
        {/* Pulse rings */}
        {(isListening || isSpeaking) && [0, 1, 2].map(i => (
          <motion.div
            key={i}
            className={`absolute rounded-full border ${isListening ? 'border-destructive/40' : 'border-primary/30'}`}
            style={{ inset: -(i * 20) }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, delay: i * 0.35, repeat: Infinity }}
          />
        ))}

        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={isListening ? stopListening : startListening}
          disabled={isThinking}
          className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isListening
              ? 'bg-gradient-to-br from-red-400 to-rose-600 shadow-red-400/40'
              : isThinking
              ? 'bg-gradient-to-br from-amber-300 to-yellow-500 shadow-amber-300/40'
              : 'bg-gradient-to-br from-primary to-amber-600 shadow-primary/40'
          } disabled:cursor-not-allowed`}
        >
          {isThinking ? (
            <Loader2 className="w-9 h-9 text-white animate-spin" />
          ) : isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <MicOff className="w-9 h-9 text-white" />
            </motion.div>
          ) : isSpeaking ? (
            <div className="flex gap-1 items-end h-8">
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-white rounded-full"
                  animate={{ scaleY: [0.3, 1.2, 0.3] }}
                  transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                  style={{ height: 24 }}
                />
              ))}
            </div>
          ) : (
            <Mic className="w-9 h-9 text-white" />
          )}
        </motion.button>
      </div>

      {/* Status text */}
      <p className="text-sm text-muted-foreground font-medium">{statusText}</p>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => { setIsMuted(v => !v); synthRef.current?.cancel(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {isMuted ? at.unmute : at.mute}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Aria bubble */}
      <AnimatePresence>
        {ariaText && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="w-full bg-card rounded-2xl border border-border/60 p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-wide">ARIA</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{ariaText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>
      )}

      {/* Conversation log */}
      {history.length > 0 && (
        <div className="w-full space-y-2">
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">Conversation</p>
          {history.map((m, i) => (
            <div
              key={i}
              className={`text-sm px-3 py-2 rounded-xl ${
                m.role === 'user'
                  ? 'bg-primary/10 text-foreground ml-6'
                  : 'bg-card border border-border/60 text-foreground/80 mr-6'
              }`}
            >
              <span className="text-[10px] font-semibold text-primary block mb-0.5">
                {m.role === 'user' ? 'You' : 'Aria'}
              </span>
              {m.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
