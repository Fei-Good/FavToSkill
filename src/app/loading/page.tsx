"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, text: "正在拉取你的抖音精选收藏夹...", icon: "📥" },
  { id: 2, text: "AI 正在分析视频内容...", icon: "🤖" },
  { id: 3, text: "按知识领域自动分类中...", icon: "🗂️" },
  { id: 4, text: "唤醒你的知识收藏搭子...", icon: "🐾" },
  { id: 5, text: "绘制专属知识地图...", icon: "🗺️" },
];

export default function LoadingPage() {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let step = 0;

    const tick = () => {
      if (step >= STEPS.length) {
        setTimeout(() => router.push("/map"), 600);
        return;
      }
      setActiveStep(step);
      const targetProgress = Math.round(((step + 1) / STEPS.length) * 100);
      let cur = Math.round((step / STEPS.length) * 100);

      const interval = setInterval(() => {
        cur += 2;
        if (cur >= targetProgress) {
          cur = targetProgress;
          clearInterval(interval);
          setCompletedSteps((prev) => [...prev, step]);
          step++;
          setTimeout(tick, 280);
        }
        setProgress(cur);
      }, 18);
    };

    const timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #E8F5FA 0%, #F0F8FB 100%)" }}
    >
      {/* 底部文件夹装饰 */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0,80 L0,200 L1440,200 L1440,80 C1200,120 960,60 720,80 C480,100 240,60 0,80 Z" fill="#C8E6F5" fillOpacity="0.6" />
        </svg>
      </div>

      {/* 文件夹眼睛装饰 */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="flex items-center justify-center gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                animation: "float 2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`
              }}
            >
              <div className="w-5 h-5 rounded-full bg-gray-800" />
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative z-10 w-full rounded-3xl p-8 md:p-10"
        style={{
          maxWidth: 480,
          background: "white",
          boxShadow: "0 24px 64px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.05)",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-blue-50"
            style={{
              animation: "float 3s ease-in-out infinite",
            }}
          >
            🗺️
          </div>
        </div>

        <h2
          className="text-center text-xl font-bold mb-8"
          style={{ color: "#1A1A1A", fontFamily: "Georgia, serif" }}
        >
          正在整理你的抖音收藏夹
        </h2>

        {/* 步骤列表 */}
        <div className="flex flex-col gap-3 mb-8">
          {STEPS.map((step, idx) => {
            const isDone = completedSteps.includes(idx);
            const isActive = activeStep === idx && !isDone;
            const isPending = idx > activeStep;

            return (
              <div
                key={step.id}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300"
                style={{
                  background: isDone
                    ? "#E8F5FA"
                    : isActive
                    ? "#F0F8FB"
                    : "#F8FBFC",
                  border: `1px solid ${
                    isDone
                      ? "#C8E6F5"
                      : isActive
                      ? "#D5EDF7"
                      : "#E8F5FA"
                  }`,
                  opacity: isPending ? 0.45 : 1,
                }}
              >
                <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                  {isDone ? (
                    <span style={{ color: "#6DBF9E", fontSize: 16 }}>✓</span>
                  ) : (
                    <span
                      style={{
                        fontSize: 16,
                        opacity: isPending ? 0.4 : 1,
                        animation: isActive ? "float 1.2s ease-in-out infinite" : undefined,
                      }}
                    >
                      {step.icon}
                    </span>
                  )}
                </div>

                <span
                  className="text-sm flex-1"
                  style={{
                    color: isDone || isActive ? "#1A1A1A" : "#888888",
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {step.text}
                </span>

                {isActive && (
                  <div className="flex gap-1 flex-shrink-0">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: "#4BBFD4",
                          animation: "blink 1.2s ease-in-out infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 进度条 */}
        <div
          className="w-full rounded-full overflow-hidden mb-2 relative"
          style={{ height: 8, background: "#E8F5FA" }}
        >
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #6DBF9E 0%, #4BBFD4 100%)",
              boxShadow: "0 0 12px rgba(109,191,158,0.4)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translate(50%, -50%)",
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#6DBF9E",
                boxShadow: "0 0 8px 3px rgba(109,191,158,0.5)",
              }}
            />
          </div>
        </div>

        <p className="text-center text-sm" style={{ color: "#888888" }}>
          {progress}%
        </p>
      </div>
    </div>
  );
}
