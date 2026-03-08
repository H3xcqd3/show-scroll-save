import Navbar from '@/components/Navbar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Download, ChevronDown, Palette } from 'lucide-react';
import ImportExport from '@/components/ImportExport';
import { useTheme, themes } from '@/hooks/useTheme';

const ProfilePage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>

        {/* Color Theme */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl bg-card p-4 shadow-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-semibold text-foreground">Color Theme</span>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="rounded-b-xl border border-t-0 border-border bg-card px-6 py-5 shadow-card">
              <p className="text-sm text-muted-foreground mb-4">Choose your accent color</p>
              <div className="grid grid-cols-3 gap-3">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-3 rounded-lg p-3 transition-all border-2 ${
                      theme === t.id
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <div
                      className="h-6 w-6 rounded-full shrink-0 ring-2 ring-background"
                      style={{ background: t.preview }}
                    />
                    <div className="text-left min-w-0">
                      <span className="text-xs font-medium text-foreground block truncate">{t.label}</span>
                      <span className="text-[10px] text-muted-foreground">{t.mode}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Import/Export */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl bg-card p-4 shadow-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-semibold text-foreground">Import / Export</span>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="rounded-b-xl border border-t-0 border-border bg-card px-6 py-5 shadow-card">
              <ImportExport />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </main>
    </>
  );
};

export default ProfilePage;
