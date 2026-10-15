import { useState } from 'react';
import { FileSpreadsheet, Copy, Check, X, Info } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateModal({ isOpen, onClose }: TemplateModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleCsv = `Data,Núm. Factura,Proveïdor,Concepte,Categoria,Base Imposable,IVA,Import Total,Estat,Mètode Pagament
2024-01-05,FAC-2024-001,Immobiliària Diagonal S.L.,Lloguer oficines planta 3,Lloguer & Seu,1800.00,378.00,2178.00,Pagada,Transferència
2024-01-12,FAC-2024-002,Endesa Energia S.A.,Subministrament elèctric,Subministraments,345.50,72.56,418.06,Pagada,Domiciliació
2024-01-18,FAC-2024-003,Amazon Web Services (AWS),Servidors cloud i base dades,Software & SaaS,620.00,130.20,750.20,Pagada,Targeta
2024-01-25,FAC-2024-004,Gestoria Balmes Assessors,Assessorament fiscal i comptable,Assessoria & Legal,550.00,115.50,665.50,Pagada,Transferència
2024-02-14,FAC-2024-008,Meta Platforms Ireland,Publicitat digital Instagram,Màrqueting & Publicitat,850.00,178.50,1028.50,Pagada,Targeta
2024-02-20,FAC-2024-009,Lyreco Ibèrica,Papereria i material d'oficina,Material d'Oficina,280.40,58.88,339.28,Pagada,Transferència`;

  const copyCsv = () => {
    navigator.clipboard.writeText(sampleCsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Plantilla Recomanada de Google Sheets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estructura de columnes per importar factures automàticament
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

        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/40 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            El sistema detecta automàticament els encapçalaments en català, castellà o anglès (ex. "Data", "Fecha", "Date", "Total", "Import", "Proveïdor", "Categoria", "Estat"). Si alguna columna no coincideix exactament, l'algoritme intel·ligent farà la correspondència automàtica.
          </p>
        </div>

        {/* Column Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Columna</th>
                <th className="p-3">Exemple</th>
                <th className="p-3">Obligatòria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">Data</td>
                <td className="p-3">2024-05-15 o 15/05/2024</td>
                <td className="p-3 text-emerald-600 font-medium">Sí</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">Núm. Factura</td>
                <td className="p-3">FAC-2024-001</td>
                <td className="p-3 text-slate-400">Opcional</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">Proveïdor</td>
                <td className="p-3">Endesa, AWS, Gestoria...</td>
                <td className="p-3 text-emerald-600 font-medium">Sí</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">Concepte</td>
                <td className="p-3">Subministrament elèctric</td>
                <td className="p-3 text-slate-400">Opcional</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">Categoria</td>
                <td className="p-3">Subministraments, Software...</td>
                <td className="p-3 text-emerald-600 font-medium">Sí (o auto)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">Import Total</td>
                <td className="p-3">1.250,50 €</td>
                <td className="p-3 text-emerald-600 font-medium">Sí</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">Estat</td>
                <td className="p-3">Pagada, Pendent, Vençuda</td>
                <td className="p-3 text-slate-400">Opcional</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Copy CSV action */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={copyCsv}
            className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'CSV Copiat al porta-retalls!' : 'Copiar CSV d\'exemple per enganxar al Sheets'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  );
}
