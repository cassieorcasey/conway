import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { sb } from './lib/supabase';
import { Login } from './components/Login';
import { Logo } from './components/Logo';
import { Roadmap } from './components/Roadmap';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!sb);

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setAuthReady(true));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!authReady) return <div className="splash"><Logo size={48} /></div>;
  if (sb && !session) return <Login />;
  return <Roadmap userId={session?.user.id ?? null} />;
}
