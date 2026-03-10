import { useState } from 'react';
import { useLibrary } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileText } from 'lucide-react';
import { MediaType } from '@/lib/tmdb';

const ImportExport = () => {
  const { library, addToLibrary } = useLibrary();
  const { toast } = useToast();
  const [csvInput, setCsvInput] = useState('');
  const [showImport, setShowImport] = useState(false);

  const handleExportCSV = () => {
    const headers = 'tmdb_id,media_type,title,status,year,vote_average,user_rating,review';
    const rows = library.map(item => {
      return [
        item.id,
        item.mediaType,
        `"${item.title.replace(/"/g, '""')}"`,
        item.status,
        item.year,
        item.voteAverage,
        item.userRating || '',
        item.review ? `"${item.review.replace(/"/g, '""')}"` : '',
      ].join(',');
    });
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mptl-library-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Library exported', description: `${library.length} items exported to CSV.` });
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(library, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mptl-library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Library exported', description: `${library.length} items exported to JSON.` });
  };

  const handleImport = () => {
    if (!csvInput.trim()) return;
    try {
      const lines = csvInput.trim().split('\n');
      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const fields: string[] = [];
        let current = '';
        let inQuotes = false;
        for (const char of line) {
          if (char === '"') { inQuotes = !inQuotes; continue; }
          if (char === ',' && !inQuotes) { fields.push(current.trim()); current = ''; continue; }
          current += char;
        }
        fields.push(current.trim());
        const [tmdb_id, media_type, title, status, year] = fields;
        if (!tmdb_id || !title) continue;
        addToLibrary(
          { id: parseInt(tmdb_id), title, poster_path: null, vote_average: 0, release_date: year } as any,
          (media_type || 'movie') as MediaType,
          (status as any) || 'watchlist'
        );
        imported++;
      }
      toast({ title: 'Import complete', description: `${imported} items imported.` });
      setCsvInput('');
      setShowImport(false);
    } catch {
      toast({ title: 'Import failed', description: 'Check your CSV format and try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleExportCSV} variant="outline" className="gap-1.5">
          <Download className="h-4 w-4" /> Export CSV ({library.length})
        </Button>
        <Button onClick={handleExportJSON} variant="outline" className="gap-1.5">
          <Download className="h-4 w-4" /> Export JSON
        </Button>
        <Button onClick={() => setShowImport(!showImport)} variant="outline" className="gap-1.5">
          <Upload className="h-4 w-4" /> Import
        </Button>
      </div>

      {showImport && (
        <div className="rounded-xl bg-card p-4 shadow-card space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste CSV data below. Supports CineTrack CSV format.
          </p>
          <Textarea
            value={csvInput}
            onChange={e => setCsvInput(e.target.value)}
            placeholder="Paste CSV content here..."
            rows={6}
          />
          <Button onClick={handleImport} disabled={!csvInput.trim()} className="gap-1.5">
            <FileText className="h-4 w-4" />
            Import Data
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImportExport;
