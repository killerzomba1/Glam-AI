import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '@/lib/LanguageContext';
import { useLooks } from '@/hooks/useLooks';
import ArtistTab from './ArtistTab';
import SkinTab from './SkinTab';
import { VirtualTab, SeasonalTab } from './VirtualAndSeasonalTabs';
import AriaVoice from './AriaVoice';

const TAB_KEYS = ['artist', 'skin', 'virtual', 'seasonal', 'aria'];

export default function GlamPage() {
  const { t }           = useLang();
  const tabs            = t.glamPage.tabs;
  const [searchParams]  = useSearchParams();
  const { saveLook }    = useLooks();

  const initialTab = TAB_KEYS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'artist';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (TAB_KEYS.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  const tabLabels = [
    { key: 'artist',   label: tabs.artist },
    { key: 'skin',     label: tabs.skin },
    { key: 'virtual',  label: tabs.virtual },
    { key: 'seasonal', label: tabs.seasonal },
    { key: 'aria',     label: tabs.aria },
  ];

  const handleSaveLook = async (look) => {
    try { await saveLook(look); } catch {}
  };

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto">
      {/* Top tab bar */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 pt-10 pb-0">
        <div className="flex gap-0 overflow-x-auto no-scrollbar">
          {tabLabels.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'artist'   && <ArtistTab   onSaveLook={handleSaveLook} />}
        {activeTab === 'skin'     && <SkinTab />}
        {activeTab === 'virtual'  && <VirtualTab />}
        {activeTab === 'seasonal' && <SeasonalTab />}
        {activeTab === 'aria'     && <AriaVoice onLookGenerated={handleSaveLook} />}
      </div>
    </div>
  );
}
