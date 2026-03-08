import { getImageUrl, WatchProviderData } from '@/lib/tmdb';

interface WatchProvidersProps {
  providers?: Record<string, WatchProviderData>;
}

const WatchProviders = ({ providers }: WatchProvidersProps) => {
  if (!providers) return null;

  // Try user's locale, fallback to US/GB
  const locale = navigator.language?.split('-')[1]?.toUpperCase() || 'US';
  const data = providers[locale] || providers['US'] || providers['GB'];
  if (!data) return null;

  const sections = [
    { label: 'Stream', items: data.flatrate },
    { label: 'Free', items: data.free },
    { label: 'Rent', items: data.rent },
    { label: 'Buy', items: data.buy },
  ].filter(s => s.items && s.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-foreground">Where to Watch</h3>
      {sections.map(({ label, items }) => (
        <div key={label}>
          <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
          <div className="flex flex-wrap gap-2">
            {items!.map(p => (
              <a
                key={p.provider_id}
                href={data.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                title={p.provider_name}
              >
                <img
                  src={getImageUrl(p.logo_path, 'w92')!}
                  alt={p.provider_name}
                  className="h-10 w-10 rounded-lg ring-1 ring-border transition-transform group-hover:scale-110"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground">Data from JustWatch via TMDB</p>
    </div>
  );
};

export default WatchProviders;
