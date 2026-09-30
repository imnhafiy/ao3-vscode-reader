export type FontId = 'inter' | 'georgia' | 'lora' | 'merriweather' | 'atkinson';

export const FONTS: { id: FontId; label: string; stack: string }[] = [
  { id: 'inter', label: 'Inter', stack: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { id: 'georgia', label: 'Georgia', stack: "Georgia, 'Times New Roman', serif" },
  { id: 'lora', label: 'Lora', stack: "'Lora', Georgia, serif" },
  { id: 'merriweather', label: 'Merriweather', stack: "'Merriweather', Georgia, serif" },
  { id: 'atkinson', label: 'Atkinson Hyperlegible', stack: "'Atkinson Hyperlegible', system-ui, sans-serif" },
];