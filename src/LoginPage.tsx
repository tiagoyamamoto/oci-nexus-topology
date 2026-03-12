import { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
    onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            if (username === 'invista' && password === 'nexus@2026') {
                sessionStorage.setItem('oci-topology-auth', '1');
                onLogin();
            } else {
                setError('Usuário ou senha incorretos.');
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className="w-screen h-screen bg-zinc-950 flex items-center justify-center">
            <div className="w-full max-w-sm px-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                        <h1 className="text-2xl font-black italic tracking-tighter text-white">
                            NEXUS TOPOLOGY
                        </h1>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        OCI · Invista FIDC · cmp-dev-nexus
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Username */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                Usuário
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="usuário"
                                    autoComplete="username"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-xs text-red-400 font-medium">{error}</p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !username || !password}
                            className="mt-2 w-full bg-white text-zinc-950 font-bold text-sm py-2.5 rounded-lg hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Autenticando...' : 'Entrar'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[10px] text-zinc-600 mt-6 font-mono uppercase tracking-widest">
                    Acesso restrito · Inventcloud
                </p>
            </div>
        </div>
    );
}
