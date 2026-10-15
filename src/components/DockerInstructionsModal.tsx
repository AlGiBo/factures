import { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  X,
  Server,
  Layers,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

interface DockerInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DockerInstructionsModal({
  isOpen,
  onClose,
}: DockerInstructionsModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const dockerComposeCode = `version: '3.8'

services:
  facturasheet:
    build: .
    container_name: facturasheet_app
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000`;

  const dockerRunCode = `# 1. Construir la imatge Docker
docker build -t facturasheet .

# 2. Executar el contenidor a localhost:3000
docker run -d --name facturasheet -p 3000:3000 facturasheet`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Server className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Execució en Local amb Docker
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guia completa per allotjar i arrencar l'aplicació en un contenidor Docker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice on OAuth in Docker */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/40 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <p className="font-semibold">Com funciona la connexió amb Google Sheets a Docker:</p>
            <p className="leading-relaxed opacity-90">
              L'autenticació amb Google és 100% al navegador de l'usuari (client-side Firebase Auth). Quan executeu el contenidor a <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded text-[11px]">http://localhost:3000</code>, no necessiteu servidors OAuth complexos ni secrets al servidor. Tot el trànsit cap a Google Sheets es fa de forma segura des del vostre propi navegador.
            </p>
          </div>
        </div>

        {/* Option 1: Docker Compose (Recommended) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              Opció 1: Amb Docker Compose (Recomanat)
            </span>
            <button
              onClick={() => copyToClipboard('docker compose up -d --build', 1)}
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {copiedIndex === 1 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 1 ? 'Copiat!' : 'Copiar comanda'}</span>
            </button>
          </div>

          <div className="relative group bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto">
            <div className="text-emerald-400">docker compose up -d --build</div>
          </div>
          <p className="text-[11px] text-slate-400">
            Aquesta comanda compilarà el codi i aixecarà el contenidor automàticament en segon pla. Després obriu <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="text-indigo-500 underline font-medium">http://localhost:3000</a>.
          </p>
        </div>

        {/* Option 2: Docker CLI Direct */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-500" />
              Opció 2: Comandes de Docker CLI
            </span>
            <button
              onClick={() => copyToClipboard(dockerRunCode, 2)}
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {copiedIndex === 2 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 2 ? 'Copiat!' : 'Copiar comandes'}</span>
            </button>
          </div>

          <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
            {dockerRunCode}
          </pre>
        </div>

        {/* docker-compose.yml Reference */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              Fitxer <code className="font-mono text-slate-800 dark:text-slate-200">docker-compose.yml</code> inclòs al projecte:
            </span>
            <button
              onClick={() => copyToClipboard(dockerComposeCode, 3)}
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              {copiedIndex === 3 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 3 ? 'Copiat!' : 'Copiar fitxer'}</span>
            </button>
          </div>

          <pre className="bg-slate-950/80 text-slate-300 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre">
            {dockerComposeCode}
          </pre>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Entès
          </button>
        </div>
      </div>
    </div>
  );
}
