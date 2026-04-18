"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

// ── 类型 ──────────────────────────────────────────────────────────────────────
type PanelState = "initial" | "loading" | "result";

// ── 每个领域的推荐 Skill ─────────────────────────────────────────────────────
const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  tech: [
    "我收藏了一堆AI工具测评，帮我生成一个每天推送AI新玩法的skill！",
    "把我收藏的编程教程整理成一个带刷题提醒的学习skill！",
    "收藏了好多科技数码评测，帮我生成一个购物决策参谋skill！",
  ],
  jieshuo: [
    "我追甄嬛传解说停不下来，帮我生成一个「后宫话术」职场应用skill！",
    "收藏了好多电影解说，帮我搞一个观影推荐+深度解读的skill！",
    "把我收藏的名场面拆解整理成一个讲故事技巧skill！",
  ],
  food: [
    "收藏了一堆吃播和菜谱，帮我生成一个「今天吃什么」每日推荐skill！",
    "把我收藏的探店视频整理成一个按城市查美食地图的skill！",
    "减脂期收藏了好多健康餐，帮我弄个每周meal plan的skill！",
  ],
  trip: [
    "收藏了好多旅行攻略，帮我生成一个说走就走出行规划skill！",
    "我攒了一堆小众景点视频，帮我整理成一个周末去哪儿的skill！",
    "收藏的行李清单和签证攻略太多了，给我来个出行准备checklist skill！",
  ],
  renwen: [
    "收藏了好多知识科普视频，帮我生成一个每日涨知识推送skill！",
    "茶文化、地理、经济学知识都有收藏，帮我整理成一个跨学科知识库skill！",
    "收藏了一堆行业分析和趋势解读，帮我来个热点洞察参谋skill！",
  ],
  game: [
    "收藏了好多游戏攻略，帮我弄一个Boss打法速查skill！",
    "我攒了一堆Steam愿望单和评测，帮我生成一个游戏推荐决策skill！",
    "收藏了好多电竞赛事和操作教学，给我来个上分教练skill！",
  ],
};

// 默认推荐（兜底）
const DEFAULT_QUESTIONS = [
  "帮我把收藏夹里的内容整理成一个每日知识推送skill！",
  "根据我的收藏生成一个专属学习计划skill！",
  "把收藏的内容变成一个随时问答的私人顾问skill！",
];

// ── 推荐问题 → Mock Skill 文件映射 ──────────────────────────────────────────
const MOCK_SKILL_MAP: Record<string, { path: string; fileName: string }> = {
  // tech
  "我收藏了一堆AI工具测评，帮我生成一个每天推送AI新玩法的skill！": { path: "/mock/skills/tech-ai-daily-skill.md", fileName: "AI新玩法每日推送-skill.md" },
  "把我收藏的编程教程整理成一个带刷题提醒的学习skill！": { path: "/mock/skills/tech-coding-study-skill.md", fileName: "编程刷题学习助手-skill.md" },
  "收藏了好多科技数码评测，帮我生成一个购物决策参谋skill！": { path: "/mock/skills/tech-purchase-advisor-skill.md", fileName: "科技购物决策参谋-skill.md" },
  // jieshuo
  "我追甄嬛传解说停不下来，帮我生成一个「后宫话术」职场应用skill！": { path: "/mock/skills/jieshuo-workplace-skill.md", fileName: "后宫话术职场应用-skill.md" },
  "收藏了好多电影解说，帮我搞一个观影推荐+深度解读的skill！": { path: "/mock/skills/jieshuo-movie-recommend-skill.md", fileName: "观影推荐深度解读-skill.md" },
  "把我收藏的名场面拆解整理成一个讲故事技巧skill！": { path: "/mock/skills/jieshuo-storytelling-skill.md", fileName: "讲故事技巧-skill.md" },
  // food
  "收藏了一堆吃播和菜谱，帮我生成一个「今天吃什么」每日推荐skill！": { path: "/mock/skills/food-daily-recommend-skill.md", fileName: "今天吃什么每日推荐-skill.md" },
  "把我收藏的探店视频整理成一个按城市查美食地图的skill！": { path: "/mock/skills/food-city-map-skill.md", fileName: "城市美食地图-skill.md" },
  "减脂期收藏了好多健康餐，帮我弄个每周meal plan的skill！": { path: "/mock/skills/food-meal-plan-skill.md", fileName: "每周MealPlan健康餐-skill.md" },
  // trip
  "收藏了好多旅行攻略，帮我生成一个说走就走出行规划skill！": { path: "/mock/skills/trip-travel-planner-skill.md", fileName: "说走就走出行规划-skill.md" },
  "我攒了一堆小众景点视频，帮我整理成一个周末去哪儿的skill！": { path: "/mock/skills/trip-weekend-explore-skill.md", fileName: "周末去哪儿-skill.md" },
  "收藏的行李清单和签证攻略太多了，给我来个出行准备checklist skill！": { path: "/mock/skills/trip-checklist-skill.md", fileName: "出行准备Checklist-skill.md" },
  // renwen
  "收藏了好多知识科普视频，帮我生成一个每日涨知识推送skill！": { path: "/mock/skills/renwen-daily-knowledge-skill.md", fileName: "每日涨知识推送-skill.md" },
  "茶文化、地理、经济学知识都有收藏，帮我整理成一个跨学科知识库skill！": { path: "/mock/skills/renwen-interdisciplinary-skill.md", fileName: "跨学科知识库-skill.md" },
  "收藏了一堆行业分析和趋势解读，帮我来个热点洞察参谋skill！": { path: "/mock/skills/renwen-trend-insight-skill.md", fileName: "热点洞察参谋-skill.md" },
  // game
  "收藏了好多游戏攻略，帮我弄一个Boss打法速查skill！": { path: "/mock/skills/game-boss-guide-skill.md", fileName: "Boss打法速查-skill.md" },
  "我攒了一堆Steam愿望单和评测，帮我生成一个游戏推荐决策skill！": { path: "/mock/skills/game-recommend-skill.md", fileName: "游戏推荐决策-skill.md" },
  "收藏了好多电竞赛事和操作教学，给我来个上分教练skill！": { path: "/mock/skills/game-rank-coach-skill.md", fileName: "上分教练-skill.md" },
};

// ── 解析 Vercel AI Data Stream 协议 ──────────────────────────────────────────
function parseDataStreamLine(line: string): string | null {
  if (!line.startsWith("0:")) return null;
  try {
    return JSON.parse(line.slice(2));
  } catch {
    return null;
  }
}

// ── 组件 ──────────────────────────────────────────────────────────────────────
export default function SkillPanel({ onClose, categoryId }: { onClose: () => void; categoryId?: string; }) {
  const questions = (categoryId && SUGGESTED_QUESTIONS[categoryId]) || DEFAULT_QUESTIONS;
  const [panelState, setPanelState] = useState<PanelState>("initial");
  const [input, setInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [skillFileName, setSkillFileName] = useState("");
  const [skillContent, setSkillContent] = useState("");
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  // 发送消息并流式生成 Skill
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || panelState === "loading") return;

      setInput("");
      setPanelState("loading");
      setProgress(0);

      // 检查是否有对应的 mock skill 文件
      const mockSkill = MOCK_SKILL_MAP[trimmed];

      // 模拟进度条
      let currentProgress = 0;
      progressTimer.current = setInterval(() => {
        currentProgress += Math.random() * 8 + 2;
        if (currentProgress >= 95) currentProgress = 95;
        setProgress(Math.round(currentProgress));
      }, 300);

      try {
        let fullContent = "";

        if (mockSkill) {
          // 有 mock 文件：直接 fetch 静态文件
          const res = await fetch(mockSkill.path);
          if (!res.ok) throw new Error("fetch mock failed");
          fullContent = await res.text();
        } else {
          // 无 mock：走 AI 流式生成
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                {
                  role: "user",
                  content: `请根据以下需求生成一个 Claude Code Skill 的 Markdown 文件内容：\n\n${trimmed}\n\n要求：\n1. 输出完整的 SKILL.md 内容\n2. 包含使用场景、核心能力、使用示例、约束条件和核心指令\n3. 保持实用、具体、可操作`,
                },
              ],
            }),
          });

          if (!res.ok || !res.body) {
            if (progressTimer.current) clearInterval(progressTimer.current);
            setPanelState("initial");
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const token = parseDataStreamLine(line);
              if (token !== null) {
                fullContent += token;
              }
            }
          }

          // 处理 buffer 中剩余的内容
          if (buffer) {
            const token = parseDataStreamLine(buffer);
            if (token !== null) {
              fullContent += token;
            }
          }
        }

        // 完成：停止进度条，在 95% 停留 8 秒后切换到结果状态
        if (progressTimer.current) clearInterval(progressTimer.current);
        setProgress(95);

        // 设置文件名：mock 有预设名，否则从输入提取
        if (mockSkill) {
          setSkillFileName(mockSkill.fileName);
        } else {
          const nameMatch = trimmed.match(/(?:生成|创建)(.+?)(?:skill|技能)/i);
          const skillName = nameMatch
            ? nameMatch[1].trim().replace(/[的了一个]/g, "")
            : "自定义技能";
          setSkillFileName(`${skillName}-skill.md`);
        }
        setSkillContent(fullContent);

        // 95% → 100%：8 秒内缓慢爬升，有感知地增长
        let slow = 95;
        const totalDuration = 8000; // 总时长 8 秒
        const interval = 200; // 每 200ms 更新一次
        const totalSteps = totalDuration / interval; // 40 步
        let step = 0;
        const slowTimer = setInterval(() => {
          step++;
          // easeOutCubic：前面走得快一点，后面越来越慢，模拟"快完成了"的感觉
          const t = step / totalSteps;
          const eased = 1 - Math.pow(1 - t, 3);
          slow = 95 + eased * 5; // 95 → 100
          setProgress(Math.min(Math.round(slow * 10) / 10, 100));
          if (step >= totalSteps) {
            clearInterval(slowTimer);
            setProgress(100);
            setTimeout(() => {
              setPanelState("result");
            }, 400);
          }
        }, interval);
      } catch {
        if (progressTimer.current) clearInterval(progressTimer.current);
        setPanelState("initial");
      }
    },
    [panelState]
  );

  // 导出技能包
  const handleExport = useCallback(() => {
    const blob = new Blob([skillContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = skillFileName || "skill.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [skillContent, skillFileName]);

  // 重新开始
  const handleReset = useCallback(() => {
    setPanelState("initial");
    setInput("");
    setProgress(0);
    setSkillFileName("");
    setSkillContent("");
  }, []);

  // 根据状态选择背景图和面板高度
  const bgImage =
    panelState === "loading" ? "/bot/bot_tab.png" : "/bot/click_bot.png";

  // 不同状态不同高度：initial 需要更多空间放 3 个推荐问题 + 输入栏
  const panelHeight =
    panelState === "loading"
      ? "28vh"
      : panelState === "result"
        ? "55vh"
        : "65vh";

  return (
    <div
      className="relative"
      style={{
        height: panelHeight,
        transition: "height 0.35s ease",
      }}
    >
      {/* 背景图 */}
      <Image
        src={bgImage}
        alt="skill-bg"
        fill
        className="object-fill pointer-events-none"
        style={{ zIndex: 0 }}
      />

      <div className="relative z-10 flex flex-col h-full px-5 pt-5" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
      {/* ── 顶部关闭按钮 ── */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            if (progressTimer.current) clearInterval(progressTimer.current);
            setPanelState("initial");
            setProgress(0);
          }}
          className="w-8 h-8 flex items-center justify-center"
        >
        </button>

        {/* loading 状态的关闭按钮 */}
        {panelState === "loading" && (
          <button
            onClick={() => {
              if (progressTimer.current) clearInterval(progressTimer.current);
              setPanelState("initial");
            }}
            className="w-8 h-8 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* ════════════════ 初始状态 ════════════════ */}
      {panelState === "initial" && (
        <>
          <div className="flex flex-col pt-1 items-center flex-1 overflow-y-auto min-h-0">
            <h2
              className="text-lg font-bold text-center"
              style={{ color: "#1A1A1A" }}
            >
              你想学习什么技能？
            </h2>
            <p
              className="text-sm text-center mt-1"
              style={{ color: "#666" }}
            >
              根据你的收藏，告诉抖夹你希望掌握的具体主题或技能
            </p>

            {/* 推荐问题 */}
            <div className="flex flex-col gap-2.5 mt-4 w-full">
              {questions.map((q) => (
                <button
                  key={q}
                  className="text-left rounded-2xl px-4 py-2.5 text-sm active:scale-[0.98] transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.65)",
                    color: "#333",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                  onClick={() => send(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* 输入栏 */}
          <div className="flex items-center gap-2 pt-3 mt-auto flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="凝练收藏，一键生成技能包！"
              autoFocus
              className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(200,230,245,0.8)",
                color: "#1A1A1A",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            />
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
              style={{
                background: input.trim() ? "#2C2C2C" : "#999",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
              onClick={() => send(input)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* ════════════════ Loading 状态 ════════════════ */}
      {panelState === "loading" && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p
            className="text-base font-semibold text-center"
            style={{ color: "#1A1A1A" }}
          >
            正在为你整理输出技能中......&nbsp;&nbsp;{progress}%
          </p>

          {/* 进度条 */}
          <div
            className="w-3/4 h-1.5 rounded-full mt-4 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.4)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #7BB8F0, #5A9DE6)",
              }}
            />
          </div>
        </div>
      )}

      {/* ════════════════ 结果状态 ════════════════ */}
      {panelState === "result" && (
        <>
          <div className="flex flex-col pt-4 items-center flex-1">
            <h2
              className="text-lg font-bold text-center"
              style={{ color: "#1A1A1A" }}
            >
              你的专属技能包已生成！
            </h2>
            <p
              className="text-sm text-center mt-2 px-2 leading-relaxed"
              style={{ color: "#666" }}
            >
              我已经根据你的需求，整理好了专属的 AI 技能指令包～
              导出.md文件后，就能直接导入其他大模型使用，给你的 AI 加上定制 buff✨
            </p>

            {/* Skill 文件卡片 */}
            <div
              className="mt-6 w-full rounded-2xl px-5 py-5 flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.7)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <span
                className="text-base font-semibold"
                style={{ color: "#1A1A1A" }}
              >
                {skillFileName}
              </span>
            </div>

            <div className="flex-1" />

            {/* 导出按钮 */}
            <button
              className="w-full rounded-full py-3.5 text-base font-semibold active:scale-[0.98] transition-transform"
              style={{
                background: "#2C2C2C",
                color: "#FFF",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
              onClick={handleExport}
            >
              一键导出技能包
            </button>

            {/* 重新生成 */}
            <button
              className="mt-3 text-sm underline"
              style={{ color: "#666" }}
              onClick={handleReset}
            >
              重新生成
            </button>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
