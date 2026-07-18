import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Heart, ShoppingBag, Settings, Wand2 } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function AppLayout() {
  const location = useLocation();
  const { t } = useLang();

  const navItems = [
    { path: '/',         icon: Home,       label: t.nav.home },
    { path: '/products', icon: ShoppingBag, label: t.nav.products },
    { path: '/glam',     icon: Wand2,       label: t.nav.glam },
    { path: '/saved',    icon: Heart,       label: t.nav.saved },
    { path: '/settings', icon: Settings,    label: t.nav.settings },
  ];

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border z-50 pb-safe">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path || (path === '/glam' && location.pathname.startsWith('/glam'));
            const isGlam   = path === '/glam';
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isGlam ? (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center -mt-5 shadow-lg transition-all ${
                    isActive
                      ? 'bg-primary shadow-primary/40 scale-110'
                      : 'bg-primary/90 shadow-primary/30'
                  }`}>
                    <Icon className="w-5 h-5 text-white" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                ) : (
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'fill-primary/20' : ''}`}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                )}
                <span className={`font-medium ${isGlam ? 'text-[9px] mt-1' : 'text-[10px]'} ${
                  isActive && !isGlam ? 'text-primary' : isGlam ? 'text-primary' : ''
                }`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
