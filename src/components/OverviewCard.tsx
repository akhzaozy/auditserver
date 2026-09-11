'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { animate } from 'animejs';
import { ChevronDown } from 'lucide-react';
import { ServerRecord } from '../types/sentinel';

interface OverviewCardProps {
  server: ServerRecord;
  onOpenScoreBreakdown: () => void;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  server,
  onOpenScoreBreakdown,
}) => {
  const scoreRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [selectedPeriod] = useState('Monthly');

  const isDown = server.status === 'offline';
  const targetScore = isDown ? 0 : server.score.total;

  useEffect(() => {
    if (scoreRef.current) {
      const obj = { val: 0 };
      animate(obj, {
        val: targetScore,
        duration: 1000,
        ease: 'outExpo',
        onUpdate: () => {
          if (scoreRef.current) {
            scoreRef.current.innerHTML = Math.round(obj.val).toString();
          }
        },
      });
    }

    if (pathRef.current) {
      const pathEl = pathRef.current;
      const length = pathEl.getTotalLength ? pathEl.getTotalLength() : 600;
      pathEl.style.strokeDasharray = `${length}`;
      pathEl.style.strokeDashoffset = `${length}`;

      animate(pathEl, {
        strokeDashoffset: [length, 0],
        duration: 1400,
        ease: 'inOutCubic',
      });
    }
  }, [server.id, targetScore]);

  // Points for trend wave
  const history = server.history.length > 0 ? server.history : [
    { date: 'Jan', score: 70 },
    { date: 'Feb', score: 74 },
    { date: 'Mar', score: 79 },
    { date: 'Apr', score: targetScore },
    { date: 'May', score: targetScore },
  ];

  const svgWidth = 520;
  const svgHeight = 110;
  const paddingX = 40;
  const stepX = (svgWidth - paddingX * 2) / Math.max(1, history.length - 1);

  const points = history.map((item, index) => {
    const x = paddingX + index * stepX;
    const normalized = Math.max(0, Math.min(100, item.score)) / 100;
    const y = Math.max(18, Math.min(95, svgHeight - normalized * 75));
    return { x, y, score: item.score, date: item.date };
  });

  const curvePath = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${p.x},${p.y}`;
  }, '');

  const areaPath = `${curvePath} L ${points[points.length - 1]?.x || svgWidth},${svgHeight} L ${points[0]?.x || 0},${svgHeight} Z`;

  const activeIndex = Math.min(3, points.length - 1);
  const activePoint = points[activeIndex] || points[points.length - 1];

  return (
    <div className="relative overflow-hidden rounded-[26px] p-4 lg:p-5 text-white bg-gradient-to-b from-[#24213d] to-[#1a172e] border border-white/10 shadow-sm flex flex-col justify-between h-full">
      {/* Top Header matching reference */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">Overview</h2>
        </div>

        <button
          onClick={onOpenScoreBreakdown}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-[11px] font-medium text-stone-200 border border-white/10 transition-colors"
        >
          <span>{selectedPeriod}</span>
          <ChevronDown className="w-3 h-3 text-stone-300" />
        </button>
      </div>

      {/* SVG Wave Chart matching reference with active glowing pill indicator */}
      <div className="relative my-2 w-full h-24 md:h-28 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradientClean" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f472b6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#waveGradientClean)" />

          {/* Clean bezier stroke */}
          <path
            ref={pathRef}
            d={curvePath}
            fill="none"
            stroke="#f472b6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <React.Fragment key={idx}>
              {idx === activeIndex && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={7}
                  fill="none"
                  stroke="#f472b6"
                  strokeWidth="1.5"
                  initial={{ r: 6, opacity: 0.8 }}
                  animate={{ r: 16, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={idx === activeIndex ? 6 : 3}
                fill={idx === activeIndex ? '#ffffff' : '#f472b6'}
                stroke="#f472b6"
                strokeWidth={idx === activeIndex ? 3 : 1}
              />
            </React.Fragment>
          ))}
        </svg>

        {/* Floating Active Pill Tooltip matching reference */}
        {activePoint && (
          <div
            style={{
              left: `${Math.min(85, Math.max(15, (activePoint.x / svgWidth) * 100))}%`,
              top: `${Math.max(5, (activePoint.y / svgHeight) * 100 - 32)}%`,
            }}
            className="absolute -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-md shadow-sm pointer-events-none"
          >
            <span className="text-[11px] font-bold text-white">
              {targetScore} Score
            </span>
          </div>
        )}

        {/* Months / timeline row */}
        <div className="absolute -bottom-1 w-full flex justify-between px-7 text-[10px] text-stone-400 font-medium pointer-events-none">
          {history.map((h, i) => (
            <span
              key={i}
              className={i === activeIndex ? 'font-bold text-white px-2 py-0.5 rounded-full bg-white/15' : ''}
            >
              {h.date.includes(' ') ? `${h.date.split(' ')[0]} ${parseInt(h.date.split(' ')[1]) || h.date.split(' ')[1]}` : h.date}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom 3 Stats Columns matching reference layout */}
      <div className="relative z-10 grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
        {/* Left Column */}
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/5">
          <span className="text-[10px] font-medium text-stone-400 block">
            Total Checks
          </span>
          <span className="text-base font-bold text-white mt-0.5">
            {isDown ? '0' : '36'} Active
          </span>
        </div>

        {/* Center Column - Highlighted rounded box */}
        <div
          onClick={onOpenScoreBreakdown}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/15 border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
        >
          <span className="text-[10px] font-semibold text-stone-300 block">
            Security Score
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              ref={scoreRef}
              className="text-xl font-extrabold text-white"
            >
              {targetScore}
            </span>
            <span className="text-xs text-stone-300">/ 100</span>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/5">
          <span className="text-[10px] font-medium text-stone-400 block">
            Target
          </span>
          <span className="text-base font-bold text-white mt-0.5">
            95 / 100
          </span>
        </div>
      </div>
    </div>
  );
};
