import React, { useState } from 'react';
import { LanguageIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export interface LanguageDef { code: string; name: string; flag: string; }
interface Props {
  current: string;
  languages: LanguageDef[];
  onChange: (code: string) => void;
}
export const LanguageSelector: React.FC<Props> = ({ current, languages, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 p-2 rounded-xl surface-glass shadow-ambient hover:shadow-float transition-all"
      >
        <LanguageIcon className="h-5 w-5 text-[var(--color-text-secondary)]" />
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{languages.find(l => l.code === current)?.flag}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute top-12 right-0 bg-[var(--color-bg-elev-1)] border border-[var(--color-border)] rounded-lg shadow-float py-2 min-w-[150px] z-[var(--layer-popover)] backdrop-blur-sm"
          >
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { onChange(lang.code); setOpen(false); }}
                className={`w-full px-4 py-2 text-left flex items-center gap-2 text-sm hover:bg-[var(--color-bg-elev-2)] ${current === lang.code ? 'bg-[var(--color-bg-elev-2)] font-semibold' : ''}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
