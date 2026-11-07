import React from 'react';

export interface SmartButtonItem {
  label: string;
  count?: number | string;
  icon?: React.ElementType;
  onClick?: () => void;
  active?: boolean;
}

interface SmartButtonsProps {
  buttons: SmartButtonItem[];
}

export const SmartButtons: React.FC<SmartButtonsProps> = ({ buttons }) => {
  if (buttons.length === 0) return null;

  return (
    <div className="flex items-center gap-2 justify-end mb-4 flex-wrap">
      {buttons.map((btn, idx) => {
        const Icon = btn.icon;

        return (
          <button
            key={idx}
            type="button"
            onClick={btn.onClick}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all shadow-2xs ${
              btn.active
                ? 'bg-[#171717] text-white border-[#171717]'
                : 'bg-white hover:bg-[#F5F0E8] text-[#171717] border-[#E7E3DD]'
            }`}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${btn.active ? 'text-white' : 'text-[#8C8983]'}`} />}
            <span>{btn.label}</span>
            {btn.count !== undefined && (
              <span
                className={`font-mono text-[11px] px-1.5 py-0.2 rounded font-bold ${
                  btn.active ? 'bg-white/20 text-white' : 'bg-[#F5F0E8] text-[#171717]'
                }`}
              >
                {btn.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
