"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

// PC端浮动分类图标 - 左右各3个
const floatingIcons = [
  // 左侧3个
  { id: 1, src: "/icon_tech.png", rotate: -8, x: "8%", y: "25%", delay: "0s", duration: "5s", scale: 1 },
  { id: 2, src: "/icon_game.png", rotate: 6, x: "5%", y: "45%", delay: "0.8s", duration: "6.5s", scale: 0.95 },
  { id: 3, src: "/icon_food.png", rotate: -10, x: "10%", y: "65%", delay: "1.2s", duration: "5.5s", scale: 1.05 },
  // 右侧3个
  { id: 4, src: "/icon_trip.png", rotate: 8, x: "85%", y: "28%", delay: "0.4s", duration: "7s", scale: 0.98 },
  { id: 5, src: "/icon_renwen.png", rotate: -6, x: "88%", y: "48%", delay: "1.6s", duration: "6s", scale: 1.02 },
  { id: 6, src: "/icon_jieshuo.png", rotate: 5, x: "83%", y: "68%", delay: "0.6s", duration: "6.8s", scale: 0.92 },
];

// 手机端浮动分类图标 - 上下各3个
const mobileFloatingIcons = [
  // 上方3个
  { id: 1, src: "/icon_tech.png", rotate: -8, x: "10%", y: "8%", delay: "0s", duration: "5s", scale: 0.9 },
  { id: 2, src: "/icon_game.png", rotate: 10, x: "45%", y: "5%", delay: "0.5s", duration: "6s", scale: 0.85 },
  { id: 3, src: "/icon_food.png", rotate: -6, x: "78%", y: "10%", delay: "1s", duration: "5.5s", scale: 0.95 },
  // 下方3个
  { id: 4, src: "/icon_trip.png", rotate: 8, x: "12%", y: "82%", delay: "0.3s", duration: "6.5s", scale: 0.88 },
  { id: 5, src: "/icon_renwen.png", rotate: -10, x: "48%", y: "85%", delay: "0.8s", duration: "6s", scale: 0.9 },
  { id: 6, src: "/icon_jieshuo.png", rotate: 6, x: "80%", y: "80%", delay: "1.2s", duration: "5.8s", scale: 0.87 },
];

function FloatingIcon({ src, rotate, x, y, delay, duration, scale }: typeof floatingIcons[0]) {
  // 根据设备判断图标大小
  const isMobileIcon = src.startsWith("/icon_");
  const iconSize = isMobileIcon ? 60 : 120;

  return (
    <div
      className="absolute select-none pointer-events-none"
      style={{ left: x, top: y, animation: `float ${duration} ease-in-out infinite`, animationDelay: delay }}
    >
      <div style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}>
        <Image src={src} alt="" width={iconSize} height={iconSize} className="drop-shadow-lg" />
      </div>
    </div>
  );
}

function GroundWave() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
      <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" className="w-full block">
        <path d="M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z" fill="#B8DBE8" fillOpacity="0.6" />
        <path d="M0,80 C200,50 500,110 800,75 C1100,40 1300,90 1440,70 L1440,120 L0,120 Z" fill="#A2D5E8" fillOpacity="0.4" />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative h-screen overflow-hidden flex items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, #C8E6F5 0%, #D5EDF7 50%, #E8F5FA 100%)" }}
    >
      {/* PC端飘浮图标 - 左右各3个 */}
      <div className="hidden md:block">
        {floatingIcons.map((icon) => <FloatingIcon key={icon.id} {...icon} />)}
      </div>

      {/* 手机端飘浮分类图标 - 上下各3个 */}
      <div className="md:hidden">
        {mobileFloatingIcons.map((icon) => <FloatingIcon key={icon.id} {...icon} />)}
      </div>

      <GroundWave />

      {/* 主卡片 - 使用 SVG 背景，缩小尺寸 */}
      <div
        className="relative z-10 w-full transition-all duration-700"
        style={{
          maxWidth: 320,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(28px)",
        }}
      >
        {/* SVG 文件夹背景卡片 */}
        <div className="relative" style={{ aspectRatio: "328/515" }}>
          {/* SVG 背景 */}
          <div className="absolute inset-0">
            <Image
              src="/home_filebg.svg"
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* 内容区域 */}
          <div className="relative pt-10 px-5 pb-6">

            {/* 标题 */}
            <div className="text-center mb-6 mt-6">
              <h1
                className="text-2xl font-bold mb-2"
                style={{
                  color: "#1A1A1A",
                  fontFamily: "'Comic Sans MS', 'Arial Rounded MT Bold', cursive",
                  letterSpacing: "0.02em"
                }}
              >
                FavToSkill
              </h1>
              <p className="text-xs leading-relaxed text-gray-600">
                你的知识收藏搭子——抖小夹！
              </p>
            </div>

            {/* 特性标签 - 散落摆放 */}
            <div className="relative h-48 mb-6">
              {[
                { icon: "📦", text: "一键导入，自动分类", x: "35%", y: "5%" },
                { icon: "👤", text: "智能提醒，告别吃灰", x: "5%", y: "30%" },
                { icon: "🔍", text: "随用随问，精准翻找", x: "42%", y: "55%" },
                { icon: "📖", text: "AI凝练，生成skill", x: "2%", y: "77%" },
              ].map((tag) => (
                <div
                  key={tag.text}
                  className="absolute flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-white/90"
                  style={{
                    left: tag.x,
                    top: tag.y,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    backdropFilter: "blur(4px)"
                  }}
                >
                  <span className="text-sm">{tag.icon}</span>
                  <span className="text-gray-700 font-medium">{tag.text}</span>
                </div>
              ))}
            </div>

            {/* CTA 按钮 */}
            <button
              onClick={() => router.push("/loading")}
              className="w-full py-3 rounded-full text-white font-bold text-sm mb-2"
              style={{
                background: "#2C2C2C",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
            >
              立即开始整理！
            </button>

            <p className="text-center text-xs text-gray-500">
              ✨Demo模式，无需账号✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
