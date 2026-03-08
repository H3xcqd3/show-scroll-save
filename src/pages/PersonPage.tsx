import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb, PersonDetail, getImageUrl } from '@/lib/tmdb';
import Navbar from '@/components/Navbar';
import { Loader2, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const PersonPage = () => {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await tmdb.personDetails(Number(id));
        setPerson(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading || !person) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  const photo = getImageUrl(person.profile_path, 'w500');
  const imdbId = person.external_ids?.imdb_id;
  const credits = person.combined_credits?.cast
    ?.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
    .slice(0, 24) || [];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-8 md:flex-row"
        >
          <div className="shrink-0">
            {photo ? (
              <img src={photo} alt={person.name} className="w-48 rounded-xl shadow-card md:w-56" />
            ) : (
              <div className="flex h-72 w-48 items-center justify-center rounded-xl bg-secondary text-muted-foreground md:w-56">
                No Photo
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{person.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{person.known_for_department}</span>
              {person.birthday && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {person.birthday}
                  {person.deathday && ` — ${person.deathday}`}
                </span>
              )}
              {person.place_of_birth && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {person.place_of_birth}
                </span>
              )}
            </div>

            {imdbId && (
              <a href={`https://www.imdb.com/name/${imdbId}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> IMDb
              </a>
            )}

            {person.biography && (
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">Biography</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {person.biography}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Known For */}
        {credits.length > 0 && (
          <section className="mt-12 pb-12">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Known For</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {credits.map((item) => {
                const type = item.media_type || 'movie';
                const title = item.title || item.name || 'Unknown';
                const poster = getImageUrl(item.poster_path, 'w342');
                return (
                  <Link key={`${item.id}-${type}`} to={`/${type}/${item.id}`}>
                    <div className="group overflow-hidden rounded-xl bg-card shadow-card">
                      <div className="aspect-[2/3] overflow-hidden">
                        {poster ? (
                          <img src={poster} alt={title} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground text-xs">No Image</div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-foreground line-clamp-1">{title}</p>
                        {item.character && <p className="text-[10px] text-muted-foreground line-clamp-1">as {item.character}</p>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default PersonPage;
