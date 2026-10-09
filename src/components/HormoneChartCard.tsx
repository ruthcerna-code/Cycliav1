import React, { useState } from 'react';
import { HORMONE_CURVE_DATA } from '../data/cycleData';
import { LineChart as ChartIcon, Info } from 'lucide-react';

interface HormoneChartCardProps {
  currentDay: number;
  onSelectDay: (day: number) => void;
}

export const HormoneChartCard: React.FC<HormoneChartCardProps> = ({ currentDay, onSelectDay }) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const activeInspectDay = hoveredDay ?? currentDay;
  const inspectedData = HORMONE_CURVE_DATA[activeInspectDay - 1] || HORMONE_CURVE_DATA[13];

  // SVG dimensions
  const width = 640;
  const height = 180;
  const paddingX = 30;
  const paddingY = 20;

  // Scale functions
  const getX = (day: number) => paddingX + ((day - 1) / 27) * (width - 2 * paddingX);
  const getY = (val: number) => height - paddingY - (val / 100) * (height - 2 * paddingY);

  // Generate SVG path strings
  const estrogenPath = HORMONE_CURVE_DATA.reduce((acc, pt, idx) => {
    const x = getX(pt.day);
    const y = getY(pt.estrogen);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const progesteronePath = HORMONE_CURVE_DATA.reduce((acc, pt, idx) => {
    const x = getX(pt.day);
    const y = getY(pt.progesterone);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const lhPath = HORMONE_CURVE_DATA.reduce((acc, pt, idx) => {
    const x = getX(pt.day);
    const y = getY(pt.lh);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
            <ChartIcon className="w-3.5 h-3.5 text-stone-500" />
            <span className="font-medium text-stone-700">Ritmo Endocrino de 28 Días</span>
            <span aria-hidden="true">·</span>
            <span>Fluctuación Hormonal Comparativa</span>
          </div>
          <h3 className="font-display text-lg font-medium text-stone-900">
            Ondas Hormonales y Trayectoria Fisiológica
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-stone-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-500 rounded-full" />
            <span>Estrógeno</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-indigo-500 rounded-full" />
            <span>Progesterona</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-rose-500 rounded-full" />
            <span>Oleada LH</span>
          </div>
        </div>
      </div>

      {/* Inspected values readout bar */}
      <div className="py-3 flex flex-wrap items-center justify-between text-xs border-b border-stone-100/80">
        <div className="flex items-center gap-2 text-stone-600">
          <span className="font-semibold text-stone-900">Día {activeInspectDay}:</span>
          <span>Estrógeno: <strong className="font-mono text-amber-700">{inspectedData.estrogen} pg/mL</strong></span>
          <span aria-hidden="true">·</span>
          <span>Progesterona: <strong className="font-mono text-indigo-700">{inspectedData.progesterone} ng/mL</strong></span>
          <span aria-hidden="true">·</span>
          <span>LH: <strong className="font-mono text-rose-700">{inspectedData.lh} mIU/mL</strong></span>
        </div>
        <span className="text-[11px] text-stone-500 hidden md:inline">
          Haz clic en cualquier día para explorar
        </span>
      </div>

      {/* SVG Chart Container */}
      <div className="mt-3 relative w-full overflow-x-auto">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-44 cursor-pointer select-none"
        >
          {/* Phase background zones */}
          {/* Menstrual: Days 1-5 */}
          <rect 
            x={getX(1)} 
            y={paddingY} 
            width={getX(5) - getX(1)} 
            height={height - 2 * paddingY} 
            fill="#FFE4E6" 
            opacity="0.3" 
          />
          {/* Follicular: Days 6-13 */}
          <rect 
            x={getX(6)} 
            y={paddingY} 
            width={getX(13) - getX(6)} 
            height={height - 2 * paddingY} 
            fill="#D1FAE5" 
            opacity="0.3" 
          />
          {/* Ovulatory: Days 14-16 */}
          <rect 
            x={getX(14)} 
            y={paddingY} 
            width={getX(16) - getX(14)} 
            height={height - 2 * paddingY} 
            fill="#FEF3C7" 
            opacity="0.5" 
          />
          {/* Luteal: Days 17-28 */}
          <rect 
            x={getX(17)} 
            y={paddingY} 
            width={getX(28) - getX(17)} 
            height={height - 2 * paddingY} 
            fill="#E0E7FF" 
            opacity="0.3" 
          />

          {/* Grid lines */}
          <line x1={paddingX} y1={getY(50)} x2={width - paddingX} y2={getY(50)} stroke="#E7E5E4" strokeDasharray="3 3" />
          <line x1={paddingX} y1={getY(100)} x2={width - paddingX} y2={getY(100)} stroke="#E7E5E4" />

          {/* Curves */}
          <path d={estrogenPath} fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
          <path d={progesteronePath} fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
          <path d={lhPath} fill="none" stroke="#E11D48" strokeWidth="2" strokeDasharray="4 2" />

          {/* Active day line marker */}
          <line 
            x1={getX(activeInspectDay)} 
            y1={paddingY} 
            x2={getX(activeInspectDay)} 
            y2={height - paddingY} 
            stroke="#1C1917" 
            strokeWidth="1.5" 
            strokeDasharray="2 2" 
          />
          <circle 
            cx={getX(activeInspectDay)} 
            cy={getY(inspectedData.estrogen)} 
            r="4" 
            fill="#D97706" 
            stroke="#FFFFFF" 
            strokeWidth="2" 
          />

          {/* Interactive invisible hit areas per day */}
          {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
            <rect
              key={d}
              x={getX(d) - 10}
              y={0}
              width={20}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoveredDay(d)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => onSelectDay(d)}
              className="cursor-pointer"
            />
          ))}
        </svg>

        {/* Phase labels at bottom */}
        <div className="flex justify-between text-[11px] font-medium text-stone-500 px-2 pt-1 border-t border-stone-100">
          <span>Menstrual (D1–5)</span>
          <span>Follicular (D6–13)</span>
          <span className="font-semibold text-amber-700">Ovulatory (D14–16)</span>
          <span>Luteal (D17–28)</span>
        </div>
      </div>
    </div>
  );
};
