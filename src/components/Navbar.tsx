import { Link, useLocation } from 'react-router-dom';
import { Search, TrendingUp, Tv, User, BarChart3, ListPlus, Film } from 'lucide-react';

const Navbar = () => {
  const { pathname } = useLocation();

  const links = [
    { to: '/', icon: TrendingUp, label: 'Discover' },
    { to: '/films', icon: Film, label: 'Films' },
    { to: '/tv-series', icon: Tv, label: 'TV Series' },
    { to: '/lists', icon: ListPlus, label: 'Lists' },
    { to: '/stats', icon: BarChart3, label: 'Stats' },
    { to: '/search', icon: Search, label: 'Search' },
  ];

  const bottomLinks = [
    { to: '/', icon: TrendingUp, label: 'Discover' },
    { to: '/lists', icon: ListPlus, label: 'Lists' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl hidden md:block">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-2">
          <Link to="/" className="font-display text-xl font-bold text-gradient-gold mr-6">CineTrack</Link>
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
                <span>{label}</span>
              </Link>
            ))}
            <Link
              to="/profile"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === '/profile'
                  ? 'bg-secondary text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-center px-4 py-2">
          <Link to="/" className="font-display text-lg font-bold text-gradient-gold">CineTrack</Link>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl md:hidden safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {bottomLinks.map(({ to, icon: Icon, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;
