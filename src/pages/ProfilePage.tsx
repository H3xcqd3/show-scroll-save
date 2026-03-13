import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Download, ChevronDown, Sun, Moon, User, Mail, Lock, Camera, Loader2, Key } from 'lucide-react';
import ImportExport from '@/components/ImportExport';
import ApiKeyManager from '@/components/ApiKeyManager';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const ProfilePage = () => {
  const { isDark, toggleMode } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      toast({ title: 'Avatar updated' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleEmailUpdate = async () => {
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Confirmation email sent', description: 'Check both your old and new email to confirm the change.' });
      setNewEmail('');
    }
    setEmailLoading(false);
  };

  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordUpdate = async () => {
    if (!currentPassword.trim()) {
      toast({ title: 'Please enter your current password', variant: 'destructive' });
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      toast({ title: 'New password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    setPasswordLoading(true);
    // Verify current password by re-signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    });
    if (signInError) {
      toast({ title: 'Current password is incorrect', variant: 'destructive' });
      setPasswordLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>

        {/* Profile Picture */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl bg-card p-4 shadow-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-semibold text-foreground">Profile Picture</span>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="rounded-b-xl border border-t-0 border-border bg-card px-6 py-5 shadow-card">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-secondary text-muted-foreground text-2xl">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Camera className="h-5 w-5 text-foreground" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">{profile?.display_name || user?.email}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Uploading…' : 'Change Photo'}
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Dark/Light Mode */}
        <div className="flex items-center justify-between rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <span className="font-display text-lg font-semibold text-foreground">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleMode} />
        </div>

        {/* Update Email */}
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl bg-card p-4 shadow-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-semibold text-foreground">Update Email</span>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="rounded-b-xl border border-t-0 border-border bg-card px-6 py-5 shadow-card space-y-3">
              <p className="text-sm text-muted-foreground">Current: {user?.email}</p>
              <div className="space-y-2">
                <Label htmlFor="new-email">New Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="new@example.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleEmailUpdate} disabled={emailLoading || !newEmail.trim()} className="w-full">
                {emailLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Email
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Change Password */}
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl bg-card p-4 shadow-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-semibold text-foreground">Change Password</span>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="rounded-b-xl border border-t-0 border-border bg-card px-6 py-5 shadow-card space-y-3">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handlePasswordUpdate} disabled={passwordLoading || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()} className="w-full">
                {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Import/Export */}
        <Collapsible>
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

        {/* API Keys */}
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl bg-card p-4 shadow-card hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-semibold text-foreground">API Keys</span>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="rounded-b-xl border border-t-0 border-border bg-card px-6 py-5 shadow-card">
              <ApiKeyManager />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </main>
    </>
  );
};

export default ProfilePage;
