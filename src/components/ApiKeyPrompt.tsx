import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Film, Key } from 'lucide-react';

interface ApiKeyPromptProps {
  onSubmit: (key: string) => void;
}

const ApiKeyPrompt = ({ onSubmit }: ApiKeyPromptProps) => {
  const [key, setKey] = useState('');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-2xl bg-secondary p-4">
            <Film className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">MPTL</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your TMDB API key to get started. Get one free at{' '}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              themoviedb.org
            </a>
          </p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); if (key.trim()) onSubmit(key.trim()); }}
          className="space-y-4"
        >
          <div className="relative">
            <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Your TMDB API key..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="bg-secondary border-border pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" className="w-full" disabled={!key.trim()}>
            Start Tracking
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;
