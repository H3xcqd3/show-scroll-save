import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-recommendations');
      if (fnError) throw fnError;
      setRecommendations(data.recommendations);
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">AI Recommendations</h1>
          <p className="text-muted-foreground">Personalized picks based on your viewing history</p>
        </div>

        {!recommendations && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles className="h-16 w-16 text-primary mb-4 opacity-60" />
            <p className="text-lg font-medium text-foreground mb-2">Ready for some picks?</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Our AI will analyze your watched list, ratings, and genre preferences to suggest movies and shows you'll love.
            </p>
            <Button onClick={fetchRecommendations} size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Get Recommendations
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Analyzing your taste...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {recommendations && !loading && (
          <div className="space-y-4">
            <div className="rounded-xl bg-card p-6 shadow-card">
              <div className="prose prose-invert max-w-none text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {recommendations}
              </div>
            </div>
            <Button onClick={fetchRecommendations} variant="outline" className="gap-1.5">
              <RefreshCw className="h-4 w-4" /> Get Fresh Recommendations
            </Button>
          </div>
        )}
      </main>
    </>
  );
};

export default RecommendationsPage;
