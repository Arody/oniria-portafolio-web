'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Initialize Supabase client
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
      setIsLoading(false);
      return;
    }

    // Redirect to admin dashboard
    router.push('/admin/dashboard');
    router.refresh(); // Refresh the router to ensure navbar and middleware state updates
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-6 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#F5F5F3 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Champagne accent line */}
        <div className="w-12 h-px bg-champagne mx-auto mb-10" />

        <div className="bg-charcoal border border-graphite p-10">
          <div className="mb-10 text-center">
            <h1 className="font-serif text-3xl font-light uppercase tracking-[0.15em] text-ivory mb-3">
              Acceso
            </h1>
            <p className="text-mist/40 text-[10px] uppercase tracking-[0.3em] font-sans">
              Oniria Wedding Films
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 p-4 text-red-400 text-sm font-sans animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.2em] text-mist/50 mb-3" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full bg-obsidian border border-graphite p-4 text-ivory font-sans text-sm placeholder:text-mist/20 focus:outline-none focus:border-champagne/50 transition-colors duration-400"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.2em] text-mist/50 mb-3" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-obsidian border border-graphite p-4 pr-12 text-ivory font-sans text-sm placeholder:text-mist/20 focus:outline-none focus:border-champagne/50 transition-colors duration-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-mist/30 hover:text-champagne transition-colors duration-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-champagne text-obsidian py-4 px-6 text-xs font-sans uppercase tracking-[0.3em] hover:bg-gold-dust transition-colors duration-400 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="animate-pulse tracking-[0.3em]">Verificando...</span>
              ) : (
                <>
                  Entrar <LogIn size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom accent */}
        <div className="w-12 h-px bg-champagne mx-auto mt-10" />
      </div>
    </div>
  );
}
