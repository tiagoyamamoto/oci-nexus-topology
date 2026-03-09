import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { NexusDiagram } from './NexusDiagram';
import { TerraformDiagram } from './TerraformDiagram';
import { cn } from './lib/utils';
import { Layers, Terminal } from 'lucide-react';

function Navigation() {
    const location = useLocation();

    return (
        <div className="absolute top-4 right-4 z-50 flex gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl">
            <Link
                to="/"
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                    location.pathname === '/'
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
            >
                <Layers className="w-4 h-4" />
                Topologia OCI
            </Link>

            <Link
                to="/terraform"
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                    location.pathname === '/terraform'
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
            >
                <Terminal className="w-4 h-4" />
                Topologia Terraform
            </Link>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <div className="w-screen h-screen bg-zinc-950 font-sans overflow-hidden">
                <Navigation />
                <Routes>
                    <Route path="/" element={<NexusDiagram />} />
                    <Route path="/terraform" element={<TerraformDiagram />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
