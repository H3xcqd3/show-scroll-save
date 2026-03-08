import { useState, useEffect } from 'react';
import { tmdb, TvSeasonDetail, TvEpisode, TvSeason, getImageUrl } from '@/lib/tmdb';
import { useWatchedEpisodes } from '@/hooks/useWatchedEpisodes';
import { ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

interface SeasonsListProps {
  tvId: number;
  seasons: TvSeason[];
}

const SeasonsList = ({ tvId, seasons }: SeasonsListProps) => {
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [seasonData, setSeasonData] = useState<Record<number, TvSeasonDetail>>({});
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);
  const { isWatched, toggleWatched, markSeasonWatched, unmarkSeasonWatched, getSeasonProgress } = useWatchedEpisodes();

  const filteredSeasons = seasons.filter(s => s.season_number > 0);

  const loadSeason = async (seasonNumber: number) => {
    if (seasonData[seasonNumber]) return;
    setLoadingSeason(seasonNumber);
    try {
      const data = await tmdb.tvSeasonDetails(tvId, seasonNumber);
      setSeasonData(prev => ({ ...prev, [seasonNumber]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSeason(null);
    }
  };

  const handleToggleSeason = (seasonNumber: number) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
    } else {
      setExpandedSeason(seasonNumber);
      loadSeason(seasonNumber);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-bold text-foreground mb-4">Seasons & Episodes</h2>
      <div className="space-y-2">
        {filteredSeasons.map(season => {
          const isExpanded = expandedSeason === season.season_number;
          const progress = getSeasonProgress(tvId, season.season_number, season.episode_count);
          const progressPct = season.episode_count > 0 ? (progress / season.episode_count) * 100 : 0;
          const allWatched = progress === season.episode_count && season.episode_count > 0;
          const episodes = seasonData[season.season_number]?.episodes || [];

          return (
            <div key={season.id} className="rounded-xl bg-card shadow-card overflow-hidden">
              {/* Season header */}
              <button
                onClick={() => handleToggleSeason(season.season_number)}
                className="flex w-full items-center gap-4 p-4 text-left hover:bg-secondary/50 transition-colors"
              >
                {season.poster_path && (
                  <img
                    src={getImageUrl(season.poster_path, 'w92')!}
                    alt={season.name}
                    className="h-16 w-11 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-foreground">{season.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {season.episode_count} episode{season.episode_count !== 1 ? 's' : ''}
                    {season.air_date && ` · ${season.air_date.slice(0, 4)}`}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={progressPct} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {progress}/{season.episode_count}
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Episodes */}
              {isExpanded && (
                <div className="border-t border-border">
                  {loadingSeason === season.season_number ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {/* Mark all button */}
                      <div className="flex justify-end px-4 pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const epNumbers = episodes.map(e => e.episode_number);
                            if (allWatched) unmarkSeasonWatched(tvId, season.season_number, epNumbers);
                            else markSeasonWatched(tvId, season.season_number, epNumbers);
                          }}
                          className="text-xs gap-1"
                        >
                          <Check className="h-3 w-3" />
                          {allWatched ? 'Unmark all' : 'Mark all watched'}
                        </Button>
                      </div>
                      <div className="divide-y divide-border">
                        {episodes.map((ep: TvEpisode) => (
                          <EpisodeRow
                            key={ep.id}
                            episode={ep}
                            tvId={tvId}
                            isWatched={isWatched(tvId, ep.season_number, ep.episode_number)}
                            onToggle={() => toggleWatched(tvId, ep.season_number, ep.episode_number)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const EpisodeRow = ({ episode, isWatched, onToggle }: {
  episode: TvEpisode;
  tvId: number;
  isWatched: boolean;
  onToggle: () => void;
}) => (
  <div className={`flex items-start gap-3 px-4 py-3 transition-colors ${isWatched ? 'bg-primary/5' : ''}`}>
    <Checkbox
      checked={isWatched}
      onCheckedChange={onToggle}
      className="mt-1 shrink-0"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono">E{String(episode.episode_number).padStart(2, '0')}</span>
        <p className={`text-sm font-medium truncate ${isWatched ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {episode.name}
        </p>
      </div>
      {episode.overview && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{episode.overview}</p>
      )}
      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
        {episode.air_date && <span>{episode.air_date}</span>}
        {episode.runtime && <span>{episode.runtime}m</span>}
        {episode.vote_average > 0 && <span>⭐ {episode.vote_average.toFixed(1)}</span>}
      </div>
    </div>
    {episode.still_path && (
      <img
        src={getImageUrl(episode.still_path, 'w185')!}
        alt={episode.name}
        className="h-14 w-24 rounded-lg object-cover shrink-0 hidden sm:block"
        loading="lazy"
      />
    )}
  </div>
);

export default SeasonsList;
