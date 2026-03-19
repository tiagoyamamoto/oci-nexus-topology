import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { NexusDiagram } from './NexusDiagram';
import { LoginPage } from './LoginPage';
import { cn } from './lib/utils';
import { Layers, LogOut } from 'lucide-react';

function Navigation({ onLogout }: { onLogout: () => void }) {
    const location = useLocation();

    return (
        <div className="absolute top-4 right-4 z-50 flex gap-2 bg-zinc-950/85 p-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl">
            <Link
                to="/"
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                title="Sair"
            >
                <LogOut className="w-4 h-4" />
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
