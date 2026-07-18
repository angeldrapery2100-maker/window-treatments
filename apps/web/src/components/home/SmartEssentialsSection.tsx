'use client'
import { m as motion } from 'framer-motion'
import { useState } from 'react'

export const SmartEssentialsSection = () => {
  // 初始状态设定为 53%
  const [openPercentage, setOpenPercentage] = useState(53);

  // 滑块交互逻辑：点击或拖动得越靠下，遮挡越多（openPercentage越小）
  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const shadeDroppedPercent = Math.round((y / rect.height) * 100);
    setOpenPercentage(Math.max(0, Math.min(100, 100 - shadeDroppedPercent)));
  };

  // 动态计算卷帘底杆的 Y 坐标 (窗口顶部 150，最大高度 350)
  const bottomBarY = 150 + (350 * (100 - openPercentage)) / 100;

  return (
    <section className="relative w-full py-32 bg-[#1C1E26] text-white overflow-hidden min-h-[800px] flex items-center">
      {/* 极简背景光晕 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 -left-[10%] w-[40vw] h-[40vw] bg-[#5BC1F5] rounded-full mix-blend-overlay filter blur-[180px] opacity-20" />
         <div className="absolute bottom-1/4 right-[10%] w-[30vw] h-[30vw] bg-[#60A5FA] rounded-full mix-blend-overlay filter blur-[150px] opacity-10" />
      </div>

      <div className="relative z-10 max-w-[1500px] mx-auto px-6 lg:px-12 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* ================= 左侧：文字与 HomeKit 滑块 ================= */}
          <div className="lg:col-span-4 flex flex-col space-y-12">

            {/* 文字介绍 */}
            <div className="space-y-6">
              <span className="text-[#5BC1F5] text-xs font-bold tracking-[0.3em] uppercase drop-shadow-md">
                Apple Home Integration
              </span>
              <h2 className="text-5xl lg:text-6xl font-light leading-[1.1] tracking-tighter">
                Seamless Vision. <br/>
                <span className="font-semibold text-white">Complete Control.</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-[320px] pt-4 font-medium">
                Experience true smart home luxury. Our chainless, motorized shades sync flawlessly with your ecosystem, offering silent precision at your fingertips.
              </p>
            </div>

            {/* HomeKit 比例滑块区块 */}
            <div className="flex items-center gap-10">
              {/* 滑块 */}
              <div
                className="relative w-28 h-[260px] bg-[#4A463B] rounded-[40px] cursor-pointer overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform active:scale-[0.98]"
                onMouseMove={(e) => e.buttons === 1 && handleInteraction(e)}
                onClick={handleInteraction}
              >
                {/* 🔵 关键修复：蓝色从顶部向下填充，与卷帘下降完全同步 */}
                <motion.div
                  className="absolute top-0 left-0 w-full bg-[#5BC1F5]"
                  animate={{ height: `${100 - openPercentage}%` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
                <div className="absolute bottom-6 w-full flex justify-center pointer-events-none">
                   <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-none stroke-current stroke-[1.5]">
                      <rect x="4" y="4" width="16" height="16" rx="1" />
                      <line x1="4" y1="8" x2="20" y2="8" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="4" y1="16" x2="20" y2="16" />
                   </svg>
                </div>
              </div>

              {/* 实时状态数字 */}
              <div className="flex flex-col space-y-2">
                <span className="text-2xl font-medium tracking-wide">Blinds</span>
                <span className="text-[#5BC1F5] text-sm font-bold tracking-widest uppercase">
                  Opened {openPercentage}%
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14m-4-4l4 4 4-4m-4-10L8 9m4-4l4 4" strokeWidth="2"/></svg>
                  Slide to adjust
                </span>
              </div>
            </div>

          </div>

          {/* ================= 右侧：科技信息图 SVG 动画 ================= */}
          <div className="lg:col-span-8 relative flex justify-center w-full">
            <div className="w-full max-w-[900px]">
              <svg viewBox="0 0 800 600" width="800" height="600" className="w-full h-auto drop-shadow-2xl">
                <defs>
                  <linearGradient id="shadeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#334155" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#1E293B" stopOpacity="0.95" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <clipPath id="windowClip"><rect x="250" y="150" width="300" height="350" /></clipPath>
                </defs>

                {/* 背景窗外光源 */}
                <rect x="250" y="150" width="300" height="350" fill="#E2E8F0" />
                <path d="M250 500 L320 380 L400 450 L480 320 L550 500 Z" fill="#CBD5E1" opacity="0.6" />

                {/* 窗框实体 */}
                <path d="M230 130 L570 130 L570 520 L230 520 Z" fill="none" stroke="#334155" strokeWidth="20" />
                <line x1="240" y1="325" x2="560" y2="325" stroke="#334155" strokeWidth="8" />
                <line x1="400" y1="325" x2="400" y2="510" stroke="#334155" strokeWidth="8" />

                {/* 顶部卷轴外壳 (Fascia) */}
                <rect x="230" y="110" width="340" height="30" rx="4" fill="#0F172A" />
                <rect x="240" y="140" width="320" height="10" fill="#000" opacity="0.5" />

                {/* 电动卷帘 (核心联动) */}
                <g clipPath="url(#windowClip)">
                  <motion.rect
                    x="250" y="150" width="300"
                    fill="url(#shadeGrad)"
                    animate={{ height: `${(350 * (100 - openPercentage)) / 100}` }}
                    transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                  />
                  {/* 底杆 */}
                  <motion.rect
                    x="250" width="300" height="12" fill="#0F172A"
                    animate={{ y: bottomBarY }}
                    transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                  />
                </g>

                {/* 科技连线 (动态跟随卷帘底杆) */}
                <g stroke="#60A5FA" strokeWidth="1.5" opacity="0.7">
                  <motion.line x1="180" y1="180" x2="400" animate={{ y2: bottomBarY }} transition={{ type: 'spring', stiffness: 150, damping: 20 }} />
                  <motion.line x1="180" y1="420" x2="400" animate={{ y2: bottomBarY }} transition={{ type: 'spring', stiffness: 150, damping: 20 }} />
                  <motion.line x1="620" y1="220" x2="400" animate={{ y2: bottomBarY }} transition={{ type: 'spring', stiffness: 150, damping: 20 }} />
                  <motion.line x1="620" y1="450" x2="400" animate={{ y2: bottomBarY }} transition={{ type: 'spring', stiffness: 150, damping: 20 }} />
                </g>

                {/* 动态中心发光点 */}
                <motion.circle
                  cx="400" r="6" fill="#BFDBFE" filter="url(#glow)"
                  animate={{ cy: bottomBarY }}
                  transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                />
                <motion.circle
                  cx="400" r="14" fill="none" stroke="#60A5FA" strokeWidth="2" opacity="0.5"
                  animate={{ cy: bottomBarY, scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ cy: { type: 'spring', stiffness: 150, damping: 20 }, scale: { duration: 2, repeat: Infinity }, opacity: { duration: 2, repeat: Infinity } }}
                />

                {/* 信息图节点 */}
                <g fill="#94A3B8" fontSize="12" fontFamily="sans-serif">
                  <circle cx="150" cy="180" r="25" fill="#1E293B" stroke="#334155" strokeWidth="2" />
                  <circle cx="150" cy="180" r="10" fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4 4" />
                  <text x="110" y="175" textAnchor="end">Smooth &amp; silent</text>
                  <text x="110" y="190" textAnchor="end">motor movement</text>

                  <circle cx="150" cy="420" r="25" fill="#1E293B" stroke="#334155" strokeWidth="2" />
                  <rect x="142" y="412" width="16" height="16" rx="3" fill="none" stroke="#60A5FA" strokeWidth="2" />
                  <text x="110" y="415" textAnchor="end">Seamless smart</text>
                  <text x="110" y="430" textAnchor="end">home automation</text>

                  <circle cx="650" cy="220" r="25" fill="#1E293B" stroke="#334155" strokeWidth="2" />
                  <circle cx="650" cy="220" r="8" fill="none" stroke="#60A5FA" strokeWidth="2" />
                  <path d="M650 205 v-3 M650 238 v-3 M635 220 h-3 M668 220 h-3" stroke="#60A5FA" strokeWidth="2" />
                  <text x="690" y="215" textAnchor="start">Sensor-triggered</text>
                  <text x="690" y="230" textAnchor="start">scenes</text>

                  <circle cx="650" cy="450" r="25" fill="#1E293B" stroke="#334155" strokeWidth="2" />
                  <path d="M642 445 v10 M646 440 v20 M650 435 v30 M654 440 v20 M658 445 v10" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
                  <text x="690" y="445" textAnchor="start">Multi-language</text>
                  <text x="690" y="460" textAnchor="start">voice control</text>
                </g>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
