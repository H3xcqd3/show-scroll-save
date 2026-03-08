import { useState } from 'react';
import { useLibrary } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Download, Upload, Loader2, FileText } from 'lucide-react';

const ImportExport = () => {
  const { library } = useLibrary();
  const { user } = useAuth();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [showImport, setShowImport] = useState(false);

  const handleExport = () => {
    const headers = 'tmdb_id,media_type,title,status,year,vote_average,user_rating,review';
    const rows = library.map(item => {
      return [
        item.id,
        item.mediaType,
        `"${item.title.replace(/"/g, '""')}"`,
        item.status,
        item.year,
        item.voteAverage,
        '',
        '',
      ].join(',');
    });
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinetrack-library-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Library exported', description: `${library.length} items exported to CSV.` });
  };

  const handleImport = async () => {
    if (!user || !csvInput.trim()) return;
    setImporting(true);

    try {
      const lines = csvInput.trim().split('\n');
      const header = lines[0].toLowerCase();
      const isLetterboxd = header.includes('letterboxd');

      let imported = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parse (handles quoted fields)
        const fields: string[] = [];
        let current = '';
        let inQuotes = false;
        for (const char of line) {
          if (char === '"') { inQuotes = !inQuotes; continue; }
          if (char === ',' && !inQuotes) { fields.push(current.trim()); current = ''; continue; }
          current += char;
        }
        fields.push(current.trim());

        if (isLetterboxd) {
          // Letterboxd CSV: Date,Name,Year,Letterboxd URI,Rating
          const title = fields[1];
          const year = fields[2];
          if (!title) continue;
          await supabase.from('library').upsert({
            user_id: user.id,
            tmdb_id: Math.abs(hashString(title + year)),
            media_type: 'movie',
            title,
            status: 'watched',
            year,
            vote_average: 0,
          } as any, { onConflict: 'user_id,tmdb_id,media_type' });
          imported++;
        } else {
          // CineTrack CSV format
          const [tmdb_id, media_type, title, status, year, vote_average] = fields;
          if (!tmdb_id || !title) continue;
          await supabase.from('library').upsert({
            user_id: user.id,
            tmdb_id: parseInt(tmdb_id),
            media_type: media_type || 'movie',
            title,
            status: status || 'watchlist',
            year: year || null,
            vote_average: parseFloat(vote_average) || 0,
          } as any, { onConflict: 'user_id,tmdb_id,media_type' });
          imported++;
        }
      }

      toast({ title: 'Import complete', description: `${imported} items imported.` });
      setCsvInput('');
      setShowImport(false);
    } catch (err) {
      toast({ title: 'Import failed', description: 'Check your CSV format and try again.', variant: 'destructive' });
    }
    setImporting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleExport} variant="outline" className="gap-1.5">
          <Download className="h-4 w-4" /> Export Library ({library.length})
        </Button>
        <Button onClick={() => setShowImport(!showImport)} variant="outline" className="gap-1.5">
          <Upload className="h-4 w-4" /> Import
        </Button>
      </div>

      {showImport && (
        <div className="rounded-xl bg-card p-4 shadow-card space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste CSV data below. Supports CineTrack CSV format and Letterboxd diary exports.
          </p>
          <Textarea
            value={csvInput}
            onChange={e => setCsvInput(e.target.value)}
            placeholder="Paste CSV content here..."
            rows={6}
          />
          <Button onClick={handleImport} disabled={importing || !csvInput.trim()} className="gap-1.5">
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Import Data
          </Button>
        </div>
      )}
    </div>
  );
};

// Simple string hash for Letterboxd entries without TMDB IDs
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

export default ImportExport;
