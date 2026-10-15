export const CATEGORY_COLORS: Record<string, string> = {
  'Lloguer & Seu': '#6366f1', // indigo
  'Subministraments': '#f59e0b', // amber
  'Software & SaaS': '#06b6d4', // cyan
  'Assessoria & Legal': '#8b5cf6', // purple
  'Màrqueting & Publicitat': '#ec4899', // pink
  'Equipament & Hardware': '#3b82f6', // blue
  'Material d\'Oficina': '#10b981', // emerald
  'Viatges & Transports': '#f97316', // orange
  'Telecomunicacions': '#14b8a6', // teal
  'Despeses Generals': '#64748b', // slate
  'Altres': '#94a3b8',
};

const COLOR_PALETTE = [
  '#6366f1',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#3b82f6',
  '#f97316',
  '#14b8a6',
  '#84cc16',
  '#e11d48',
  '#64748b',
];

export function getCategoryColor(category: string): string {
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ca-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export function formatDateLong(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('ca-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export const MONTH_NAMES_CA: Record<string, string> = {
  '01': 'Gener',
  '02': 'Febrer',
  '03': 'Març',
  '04': 'Abril',
  '05': 'Maig',
  '06': 'Juny',
  '07': 'Juliol',
  '08': 'Agost',
  '09': 'Setembre',
  '10': 'Octubre',
  '11': 'Novembre',
  '12': 'Desembre',
};

export const MONTH_SHORT_CA: Record<string, string> = {
  '01': 'Gen',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'Mai',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Set',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Des',
};
