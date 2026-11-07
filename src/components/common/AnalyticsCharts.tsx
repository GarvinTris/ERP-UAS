import React, { useState } from 'react';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface SalesTrendProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const SalesTrendChart: React.FC<SalesTrendProps> = ({
  title = 'Sales Trend',
  subtitle = 'Tren volume & nilai penjualan harian (Oktober 2025)',
  compact = false,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Exact data points matching storyboard S-03 & S-04 sketch:
  // Dates: Oct 5, 8, 12, 18, 21, 26, 30
  // Values: ~18, ~24, ~20, ~28, ~35, ~30, ~42
  const points = [
    { date: 'Oct 5', val: 18, label: 'Rp1.850.000 (18 pcs)' },
    { date: 'Oct 8', val: 26, label: 'Rp2.600.000 (26 pcs)' },
    { date: 'Oct 12', val: 21, label: 'Rp2.100.000 (21 pcs)' },
    { date: 'Oct 18', val: 29, label: 'Rp2.950.000 (29 pcs)' },
    { date: 'Oct 21', val: 36, label: 'Rp3.720.000 (36 pcs)' },
    { date: 'Oct 26', val: 31, label: 'Rp3.150.000 (31 pcs)' },
    { date: 'Oct 30', val: 43, label: 'Rp4.359.500 (43 pcs)' },
  ];

  const maxVal = 45;
  const height = compact ? 120 : 160;
  const width = 420;
  const paddingX = 40;
  const paddingY = 25;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const getCoordinates = (index: number, val: number) => {
    const x = paddingX + (index / (points.length - 1)) * chartWidth;
    const y = height - paddingY - (val / maxVal) * chartHeight;
    return { x, y };
  };

  const polylineCoords = points
    .map((p, i) => {
      const { x, y } = getCoordinates(i, p.val);
      return `${x},${y}`;
    })
    .join(' ');

  const areaCoords = `${paddingX},${height - paddingY} ${polylineCoords} ${
    paddingX + chartWidth
  },${height - paddingY}`;

  return (
    <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] p-4 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#C18B42]" />
          <div>
            <h4 className="font-bold text-xs text-[#171717] uppercase tracking-wider">{title}</h4>
            {!compact && <p className="text-[10px] text-[#8C8983]">{subtitle}</p>}
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold text-[#54745B] bg-[#54745B]/10 px-2 py-0.5 rounded">
          +12% MoM
        </span>
      </div>

      <div className="relative w-full flex justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none max-h-48"
        >
          {/* Grid lines & Y-axis labels */}
          {[0, 10, 20, 30, 45].map((yVal) => {
            const y = height - paddingY - (yVal / maxVal) * chartHeight;
            return (
              <g key={yVal}>
                <line
                  x1={paddingX - 6}
                  y1={y}
                  x2={width - paddingX + 6}
                  y2={y}
                  stroke="#E7E3DD"
                  strokeWidth="1"
                  strokeDasharray={yVal === 0 ? 'none' : '3,3'}
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontFamily="monospace"
                  fill="#8C8983"
                >
                  {yVal}
                </text>
              </g>
            );
          })}

          {/* Fill area beneath curve */}
          <polygon points={areaCoords} fill="rgba(193, 139, 66, 0.08)" />

          {/* Trend Line */}
          <polyline
            points={polylineCoords}
            fill="none"
            stroke="#171717"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots and interactive tooltips */}
          {points.map((p, i) => {
            const { x, y } = getCoordinates(i, p.val);
            const isHovered = hoveredPoint === i;

            return (
              <g
                key={p.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Connecting vertical guideline on hover */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={height - paddingY}
                    x2={x}
                    y2={y}
                    stroke="#C18B42"
                    strokeWidth="1.2"
                    strokeDasharray="2,2"
                  />
                )}

                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? '#C18B42' : '#171717'}
                  stroke="#FFFEFC"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* X-axis date labels */}
                <text
                  x={x}
                  y={height - paddingY + 14}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontFamily="sans-serif"
                  fill={isHovered ? '#171717' : '#8C8983'}
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {p.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover floating tooltip */}
        {hoveredPoint !== null && (
          <div className="absolute top-2 right-4 bg-[#171717] text-white text-[10px] font-mono px-2 py-1 rounded shadow-md pointer-events-none">
            {points[hoveredPoint].date}: {points[hoveredPoint].label}
          </div>
        )}
      </div>
    </div>
  );
};

export const SalesByProductChart: React.FC<{ title?: string; compact?: boolean }> = ({
  title = 'Sales by Product',
  compact = false,
}) => {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  // Exact data from storyboard:
  // Kaos: 40%
  // Hoodie: 25%
  // Dress: 20%
  // Celana / Bestie: 10%
  // Others: 5%
  const segments = [
    { label: 'Kaos', pct: 40, color: '#171717', amount: 'Rp4.291.800', units: '34 pcs' },
    { label: 'Hoodie', pct: 25, color: '#C18B42', amount: 'Rp2.682.375', units: '22 pcs' },
    { label: 'Dress', pct: 20, color: '#54745B', amount: 'Rp2.145.900', units: '17 pcs' },
    { label: 'Celana', pct: 10, color: '#8C8983', amount: 'Rp1.072.950', units: '9 pcs' },
    { label: 'Others', pct: 5, color: '#D5CEBF', amount: 'Rp536.475', units: '4 pcs' },
  ];

  // Calculate SVG arc paths for donut
  const size = compact ? 120 : 150;
  const radius = compact ? 46 : 56;
  const strokeWidth = compact ? 18 : 22;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="bg-[#FFFEFC] rounded-xl border border-[#E7E3DD] p-4 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-[#54745B]" />
          <div>
            <h4 className="font-bold text-xs text-[#171717] uppercase tracking-wider">{title}</h4>
            {!compact && <p className="text-[10px] text-[#8C8983]">Porsi kategori produk busana</p>}
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#8C8983]">100% Total</span>
      </div>

      <div className="flex items-center justify-around gap-3">
        {/* Donut SVG */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90 select-none">
            {segments.map((seg) => {
              const strokeDasharray = `${(seg.pct / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativeOffset;
              cumulativeOffset += (seg.pct / 100) * circumference;

              const isHighlighted = activeSegment === seg.label || activeSegment === null;

              return (
                <circle
                  key={seg.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={activeSegment === seg.label ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  opacity={isHighlighted ? 1 : 0.4}
                  onMouseEnter={() => setActiveSegment(seg.label)}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              );
            })}
          </svg>

          {/* Center text inside donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] font-mono text-[#8C8983]">
              {activeSegment || 'Total'}
            </span>
            <span className="text-xs font-bold font-mono text-[#171717]">
              {activeSegment
                ? segments.find((s) => s.label === activeSegment)?.pct + '%'
                : '86 pcs'}
            </span>
          </div>
        </div>

        {/* Legend matching storyboard S-03 */}
        <div className="space-y-1.5 text-xs flex-1 max-w-[160px]">
          {segments.map((seg) => (
            <div
              key={seg.label}
              onMouseEnter={() => setActiveSegment(seg.label)}
              onMouseLeave={() => setActiveSegment(null)}
              className={`flex items-center justify-between px-2 py-0.5 rounded cursor-pointer transition-colors ${
                activeSegment === seg.label ? 'bg-[#F5F0E8] font-bold' : 'hover:bg-[#F5F0E8]/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-[11px] text-[#171717]">{seg.label}</span>
              </div>
              <span className="text-[11px] font-mono text-[#8C8983]">{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
