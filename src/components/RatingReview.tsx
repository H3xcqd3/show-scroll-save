import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLibrary } from '@/hooks/useLibrary';
import { MediaItem, MediaType } from '@/lib/tmdb';
import { useToast } from '@/hooks/use-toast';

interface RatingReviewProps {
  item: MediaItem;
  mediaType: MediaType;
}

const RatingReview = ({ item, mediaType }: RatingReviewProps) => {
  const { toast } = useToast();
  const { getStatus, library, updateItem } = useLibrary();
  const status = getStatus(item.id, mediaType);

  const libItem = library.find(l => l.id === item.id && l.mediaType === mediaType);

  const [rating, setRating] = useState<number | null>(libItem?.userRating ?? null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [review, setReview] = useState(libItem?.review || '');
  const [showReview, setShowReview] = useState(false);

  if (!status) return null;

  const handleRate = (value: number) => {
    const newRating = rating === value ? null : value;
    setRating(newRating);
    updateItem(item.id, mediaType, { userRating: newRating });
  };

  const handleSaveReview = () => {
    updateItem(item.id, mediaType, { review });
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
              <Button size="sm" onClick={handleSaveReview}>
                Save Review
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingReview;
