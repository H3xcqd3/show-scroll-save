import { Link, useLocation } from 'react-router-dom';
import { Film, Search, TrendingUp, Tv, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  const links = [
    { to: '/', icon: TrendingUp, label: 'Discover' },
    { to: '/films', icon: Film, label: 'Films' },
    { to: '/tv-series', icon: Tv, label: 'TV Series' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/search', icon: Search, label: 'Search' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold text-gradient-gold">CineTrack</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === to
                  ? 'bg-secondary text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          {user && (
            <Button variant="ghost" size="icon" onClick={signOut} className="ml-2 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
