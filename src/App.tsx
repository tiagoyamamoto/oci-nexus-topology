import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { NexusDiagram } from './NexusDiagram';
import { LoginPage } from './LoginPage';
import { cn } from './lib/utils';
import { Layers, LogOut } from 'lucide-react';

function Navigation({ onLogout }: { onLogout: () => void }) {
    const location = useLocation();

    return (
        <div className="absolute top-4 right-4 z-50 flex w-[220px] flex-col gap-2 rounded-2xl border border-white/10 bg-zinc-950/85 p-2 backdrop-blur-md shadow-2xl">
            <Link
                to="/"
                className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                    location.pathname === '/' || location.pathname === '/terraform'
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
            >
                <Layers className="w-4 h-4" />
                Topologia Unificada
            </Link>

            <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
                title="Sair"
            >
                <LogOut className="w-4 h-4" />
                Sair
            </button>
        </div>
    );
}

export default function App() {
    const [authed, setAuthed] = useState(
        () => sessionStorage.getItem('oci-topology-auth') === '1'
    );

    const handleLogout = () => {
        sessionStorage.removeItem('oci-topology-auth');
        setAuthed(false);
    };

    if (!authed) {
        return <LoginPage onLogin={() => setAuthed(true)} />;
    }

    return (
        <BrowserRouter>
            <div className="w-screen h-screen bg-zinc-950 font-sans overflow-hidden">
                <Navigation onLogout={handleLogout} />
                <Routes>
                    <Route path="/" element={<NexusDiagram />} />
                    <Route path="/terraform" element={<NexusDiagram />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
