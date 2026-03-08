import { Link, useLocation } from 'react-router-dom';
import { Film, Search, BookOpen, TrendingUp, Tv } from 'lucide-react';

const Navbar = () => {
  const { pathname } = useLocation();

  const links = [
    { to: '/', icon: TrendingUp, label: 'Discover' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/films', icon: Film, label: 'Films' },
    { to: '/tv-series', icon: Tv, label: 'TV Series' },
    { to: '/library', icon: BookOpen, label: 'Library' },
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
