import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tmdb, MediaDetail, MediaType, getBackdropUrl, getImageUrl, getDisplayTitle, getYear } from '@/lib/tmdb';
import Navbar from '@/components/Navbar';
import MediaGrid from '@/components/MediaGrid';
import LibraryActions from '@/components/LibraryActions';
import SeasonsList from '@/components/SeasonsList';
import WatchProviders from '@/components/WatchProviders';
import RatingReview from '@/components/RatingReview';
import AddToListButton from '@/components/AddToListButton';
import { Star, Clock, Calendar, Loader2, ExternalLink } from 'lucide-react';

const DetailPage = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const mediaType = (type as MediaType) || 'movie';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = mediaType === 'tv'
          ? await tmdb.tvDetails(Number(id))
          : await tmdb.movieDetails(Number(id));
        setDetail(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, mediaType]);

  if (loading || !detail) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  const backdrop = getBackdropUrl(detail.backdrop_path);
  const poster = getImageUrl(detail.poster_path, 'w500');
  const title = getDisplayTitle(detail);
  const year = getYear(detail);
  const imdbId = detail.imdb_id || detail.external_ids?.imdb_id;
  const trailer = detail.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = detail.credits?.cast.slice(0, 12) || [];
  const similar = detail.similar?.results.slice(0, 6) || [];

  return (
    <>
      <Navbar />
      {/* Backdrop */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        {backdrop ? (
          <img src={backdrop} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <main className="mx-auto max-w-7xl px-4 -mt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-8 md:flex-row"
        >
          {/* Poster */}
          <div className="shrink-0">
            {poster ? (
              <img src={poster} alt={title} className="w-48 rounded-xl shadow-card md:w-56" />
            ) : (
              <div className="flex h-72 w-48 items-center justify-center rounded-xl bg-secondary text-muted-foreground md:w-56">
                No Poster
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              {title} {year && <span className="text-muted-foreground font-normal">({year})</span>}
            </h1>

            {detail.tagline && (
              <p className="text-muted-foreground italic">{detail.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {detail.vote_average > 0 && (
                <span className="flex items-center gap-1 text-primary font-semibold">
                  <Star className="h-4 w-4 fill-primary" />
                  {detail.vote_average.toFixed(1)}
                </span>
              )}
              {detail.runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {detail.runtime} min
                </span>
              )}
              {detail.number_of_seasons && (
                <span>{detail.number_of_seasons} Season{detail.number_of_seasons > 1 ? 's' : ''}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {year}
              </span>
              {detail.genres.map(g => (
                <span key={g.id} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Library Actions */}
            <LibraryActions item={detail} mediaType={mediaType} />

            {/* External Links */}
            <div className="flex gap-3 text-sm">
              {imdbId && (
                <a href={`https://www.imdb.com/title/${imdbId}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" /> IMDb
                </a>
              )}
              {trailer && (
                <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" /> Trailer
                </a>
              )}
            </div>

            <div>
              <h3 className="font-display font-semibold text-foreground mb-1">Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{detail.overview || 'No overview available.'}</p>
            </div>

            {/* Rating & Review */}
            <RatingReview item={detail} mediaType={mediaType} />

            {/* Where to Watch */}
            <WatchProviders providers={detail['watch/providers']?.results} />
          </div>
        </motion.div>

        {/* Cast - clickable */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {cast.map(person => (
                <Link key={person.id} to={`/person/${person.id}`} className="shrink-0 w-28 text-center group">
                  {person.profile_path ? (
                    <img
                      src={getImageUrl(person.profile_path, 'w185')!}
                      alt={person.name}
                      className="h-28 w-28 rounded-full object-cover mx-auto ring-2 ring-transparent group-hover:ring-primary transition-all"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-full bg-secondary mx-auto flex items-center justify-center text-muted-foreground text-xs group-hover:ring-2 group-hover:ring-primary transition-all">
                      No Photo
                    </div>
                  )}
                  <p className="mt-2 text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">{person.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{person.character}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Seasons & Episodes (TV only) */}
        {mediaType === 'tv' && detail.seasons && detail.seasons.length > 0 && (
          <SeasonsList tvId={Number(id)} seasons={detail.seasons} />
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-12 pb-12">
            <MediaGrid items={similar} title="Similar" mediaType={mediaType} />
          </section>
        )}
      </main>
    </>
  );
};

export default DetailPage;
