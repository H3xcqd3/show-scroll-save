import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, Trash2, Loader2, Users, Crown, UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ManagedUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: 'admin' | 'user';
  display_name: string | null;
  avatar_url: string | null;
}

const AdminPage = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && role !== 'admin') {
      navigate('/');
    }
  }, [authLoading, role, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke('admin-users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: undefined,
    });

    // workaround: invoke doesn't support query params well, use fetch directly
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=list`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    });
    const data = await response.json();
    if (response.ok) {
      setUsers(data);
    } else {
      toast({ title: 'Error loading users', description: data.error, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (role === 'admin') fetchUsers();
  }, [role]);

  const updateRole = async (userId: string, newRole: 'admin' | 'user') => {
    setActionLoading(userId);
    const { data: { session } } = await supabase.auth.getSession();
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=update-role`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, role: newRole }),
    });
    const data = await response.json();
    if (response.ok) {
      toast({ title: `Role updated to ${newRole}` });
      fetchUsers();
    } else {
      toast({ title: 'Error', description: data.error, variant: 'destructive' });
    }
    setActionLoading(null);
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setActionLoading(userId);
    const { data: { session } } = await supabase.auth.getSession();
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=delete-user`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    if (response.ok) {
      toast({ title: 'User deleted' });
      fetchUsers();
    } else {
      toast({ title: 'Error', description: data.error, variant: 'destructive' });
    }
    setActionLoading(null);
  };

  if (authLoading || (role !== 'admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-1">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users and roles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card p-4 shadow-card text-center">
            <Users className="mx-auto h-6 w-6 text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card text-center">
            <Crown className="mx-auto h-6 w-6 text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'admin').length}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card text-center">
            <UserIcon className="mx-auto h-6 w-6 text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'user').length}</p>
            <p className="text-xs text-muted-foreground">Users</p>
          </div>
        </div>

        {/* User list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {users.map(u => (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center justify-between rounded-xl bg-card p-4 shadow-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-semibold text-foreground truncate">
                          {u.display_name || u.email}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          u.role === 'admin'
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Joined {new Date(u.created_at).toLocaleDateString()}
                        {u.last_sign_in_at && ` · Last seen ${new Date(u.last_sign_in_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  {u.id !== user?.id && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                        disabled={actionLoading === u.id}
                        className="text-muted-foreground hover:text-primary"
                        title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                      >
                        {actionLoading === u.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : u.role === 'admin' ? (
                          <Shield className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteUser(u.id, u.email || '')}
                        disabled={actionLoading === u.id}
                        className="text-muted-foreground hover:text-destructive"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </>
  );
};

export default AdminPage;
