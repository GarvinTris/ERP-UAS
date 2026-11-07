import React from 'react';
import { Check } from 'lucide-react';

interface Stage {
  key: string;
  label: string;
}

interface StatusBarProps {
  stages: Stage[];
  currentStage: string;
  actionButtons?: React.ReactNode;
}

export const StatusBar: React.FC<StatusBarProps> = ({ stages, currentStage, actionButtons }) => {
  const currentIndex = stages.findIndex((s) => s.key === currentStage);

  return (
    <div className="bg-[#FFFEFC] border-b border-[#E7E3DD] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
      {/* Action buttons (e.g., Confirm, Validate, Register Payment, Cancel) */}
      <div className="flex items-center gap-2 flex-wrap">{actionButtons}</div>

      {/* Breadcrumb stages */}
      <div className="flex items-center text-xs font-medium ml-auto overflow-x-auto py-1">
        {stages.map((stage, idx) => {
          const isCurrent = stage.key === currentStage;
          const isPassed = idx < currentIndex;

          return (
            <div key={stage.key} className="flex items-center">
              <div
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                  isCurrent
                    ? 'bg-[#171717] text-white font-semibold shadow-xs'
                    : isPassed
                    ? 'text-[#54745B] font-semibold bg-[#54745B]/10'
                    : 'text-[#8C8983]'
                }`}
              >
                {isPassed && <Check className="w-3 h-3 text-[#54745B]" />}
                <span>{stage.label}</span>
              </div>
              {idx < stages.length - 1 && <span className="text-[#D5CEBF] mx-1">›</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
