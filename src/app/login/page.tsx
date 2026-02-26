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
    <div className="min-h-screen bg-brutalist-white font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md border-4 border-brutalist-black bg-brutalist-white p-8 brutalist-shadow">
        
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold uppercase tracking-tight text-brutalist-black mb-2">
            Acceso
          </h1>
          <p className="text-brutalist-gray text-sm uppercase tracking-wider font-semibold">
            Oniria Weddings Panel
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-900 p-4 text-red-900 text-sm font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-brutalist-black mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full border-2 border-brutalist-black bg-brutalist-white p-3 text-brutalist-black placeholder:text-brutalist-gray/50 focus:outline-none focus:ring-2 focus:ring-brutalist-black transition-shadow hover:shadow-[4px_4px_0_0_#000]"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-brutalist-black mb-2" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full border-2 border-brutalist-black bg-brutalist-white p-3 pr-12 text-brutalist-black placeholder:text-brutalist-gray/50 focus:outline-none focus:ring-2 focus:ring-brutalist-black transition-shadow hover:shadow-[4px_4px_0_0_#000]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brutalist-gray hover:text-brutalist-black transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brutalist-black text-brutalist-white py-4 px-6 text-sm font-bold uppercase tracking-widest hover:bg-brutalist-gray transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brutalist-black disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="animate-pulse">Verificando...</span>
            ) : (
              <>
                Entrar <LogIn size={18} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
