import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLibrary } from '@/hooks/useLibrary';
import { MediaItem, MediaType } from '@/lib/tmdb';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RatingReviewProps {
  item: MediaItem;
  mediaType: MediaType;
}

const RatingReview = ({ item, mediaType }: RatingReviewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getStatus } = useLibrary();
  const status = getStatus(item.id, mediaType);

  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load existing rating/review
  const loadExisting = async () => {
    if (!user || loaded) return;
    const { data } = await supabase
      .from('library')
      .select('user_rating, review')
      .eq('user_id', user.id)
      .eq('tmdb_id', item.id)
      .eq('media_type', mediaType)
      .single();
    if (data) {
      setRating((data as any).user_rating || null);
      setReview((data as any).review || '');
    }
    setLoaded(true);
  };

  // Load on mount if item is in library
  if (status && !loaded) loadExisting();

  if (!status) return null;

  const handleRate = async (value: number) => {
    if (!user) return;
    const newRating = rating === value ? null : value;
    setRating(newRating);
    await supabase
      .from('library')
      .update({ user_rating: newRating } as any)
      .eq('user_id', user.id)
      .eq('tmdb_id', item.id)
      .eq('media_type', mediaType);
  };

  const handleSaveReview = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from('library')
      .update({ review } as any)
      .eq('user_id', user.id)
      .eq('tmdb_id', item.id)
      .eq('media_type', mediaType);
    setSaving(false);
    toast({ title: 'Review saved' });
  };

  const displayRating = hoverRating || rating || 0;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground mb-1.5">Your Rating</p>
        <div className="flex gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => handleRate(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(null)}
              className="transition-transform hover:scale-125"
            >
              <Star
                className={`h-5 w-5 transition-colors ${
                  n <= displayRating
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground/30'
                }`}
              />
            </button>
          ))}
          {rating && (
            <span className="ml-2 text-sm font-semibold text-primary">{rating}/10</span>
          )}
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowReview(!showReview)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          {review ? 'Edit review' : 'Write a review'}
        </button>

        {showReview && (
          <div className="mt-2 space-y-2">
            <Textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="What did you think?"
              rows={3}
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{review.length}/1000</span>
              <Button size="sm" onClick={handleSaveReview} disabled={saving}>
                {saving ? 'Saving...' : 'Save Review'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingReview;
