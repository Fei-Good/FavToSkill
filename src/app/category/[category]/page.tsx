/**
 * app/category/[category]/page.tsx
 *
 * 领域详情页 —— 参考截图设计
 * 顶部导航 + 机器人简介 + 三列视频网格 + 底部聊天面板
 */

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SkillPanel from "@/components/SkillPanel";

// ── 分类元数据 ─────────────────────────────────────────────────────────────
type CategoryMeta = {
  id: string;
  name: string;
  aiName: string;
  bgColor: string;
  botImage: string;
  /** mockimg 前缀，例如 "ai" 对应 /mockimg/ai_01.jpg ~ ai_05.jpg */
  imgPrefix: string;
  /** mock JSON 文件路径 */
  mockJsonPath: string;
  /** AI 文案描述 */
  description: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  tech: {
    id: "tech",
    name: "科技",
    aiName: "科技 🤖",
    bgColor: "#E8F3FF",
    botImage: "/bot/bot_tech.png",
    imgPrefix: "ai",
    mockJsonPath: "/mock/tech_favorites.json",
    description: "你的科技收藏也太硬核了吧！从AI工具测评到编程实战，Skill、MCP、RAG这些前沿概念你都在追，感觉你正在认真搞AI开发呢～我帮你把这些整理成一份「AI开发者成长路线」！",
  },
  jieshuo: {
    id: "jieshuo",
    name: "解说",
    aiName: "解说 🎬",
    bgColor: "#FFF8E8",
    botImage: "/bot/bot_film.png",
    imgPrefix: "jieshuo",
    mockJsonPath: "/mock/jieshuo.json",
    description: "看得出来你是甄嬛传的深度粉丝啊！从丫鬟说话术到隐藏伏笔，后宫那些弯弯绕绕你研究得明明白白。而且你不只是看剧，还在琢磨里面的职场生存哲学呢～要不要我帮你总结一份「甄学」精华？",
  },
  food: {
    id: "food",
    name: "美食",
    aiName: "美食 🍜",
    bgColor: "#FFF1E8",
    botImage: "/bot/bot_food.png",
    imgPrefix: "food",
    mockJsonPath: "/mock/food_favorites.json",
    description: "你这收藏夹简直就是一本「广东吃货指南」！一天两只鸡、深圳三个区吃到扶墙出、茂名本地宝藏小店...看来你是个地道的美食探险家啊！我帮你按地区整理一下，下次出门照着吃就行～",
  },
  trip: {
    id: "trip",
    name: "旅行",
    aiName: "旅行 ✈️",
    bgColor: "#E8F5FF",
    botImage: "/bot/bot_trip.png",
    imgPrefix: "lvyou",
    mockJsonPath: "/mock/lvyou.json",
    description: "从亚庇的海岛到云南的自驾路线，你的旅行收藏覆盖面也太广了！看得出来你喜欢深度游，而且做攻略超认真的那种。我帮你按季节和类型分好类，随时说走就走！",
  },
  renwen: {
    id: "renwen",
    name: "人文",
    aiName: "人文 📚",
    bgColor: "#F5E8FF",
    botImage: "/bot/bot_renwen.png",
    imgPrefix: "Knowledge",
    mockJsonPath: "/mock/knowledge_favorites.json",
    description: "你的人文收藏也太杂学家了吧！从茶文化到中国山脉地理，从十五五规划解读到大宗商品周期分析，感觉你是那种啥都想搞明白的求知型选手～我帮你把这些知识按主题梳理一下，随时复习不迷路！",
  },
  game: {
    id: "game",
    name: "游戏",
    aiName: "游戏 🎮",
    bgColor: "#EDFFF0",
    botImage: "/bot/bot_game.png",
    imgPrefix: "youxi",
    mockJsonPath: "/mock/youxi.json",
    description: "洛克王国的铁粉是你吧？异色恶魔狼、华丽宝箱这些你都在研究！不过你的口味还挺广的，独立游戏和开放世界也没少收藏。我帮你把攻略和推荐分开整理，再也不用翻半天找不到了～",
  },
};

// ── Mock 视频封面图映射 ──────────────────────────────────────────────────────
// 每个分类实际图片数量
const IMG_COUNT: Record<string, number> = {
  ai: 13,
  jieshuo: 12,
  food: 12,
  lvyou: 12,
  Knowledge: 12,
  youxi: 12,
};

function getCoverImage(prefix: string, index: number): string {
  const total = IMG_COUNT[prefix] || 12;
  const num = (index % total) + 1;
  // Knowledge 系列不补零：Knowledge_1.jpg
  if (prefix === "Knowledge") {
    return `/mockimg/${prefix}_${num}.jpg`;
  }
  const padded = num.toString().padStart(2, "0");
  // food: 01-05 用 "_"，06-12 用 "-"
  if (prefix === "food") {
    const sep = num <= 5 ? "_" : "-";
    return `/mockimg/${prefix}${sep}${padded}.jpg`;
  }
  // jieshuo / lvyou / youxi 使用 "-"，ai 使用 "_"
  const sep = prefix === "jieshuo" || prefix === "lvyou" || prefix === "youxi" ? "-" : "_";
  return `/mockimg/${prefix}${sep}${padded}.jpg`;
}

// ── 视频数据类型 ─────────────────────────────────────────────────────────────
type VideoItem = {
  id: string;
  title: string;
  cover: string;
};

// ── 静态 fallback 数据（每个分类 12 条） ─────────────────────────────────────
function generateFallbackVideos(categoryId: string, prefix: string): VideoItem[] {
  const titles: Record<string, string[]> = {
    tech: [
      "年度好用AI大分享", "再见AI抽卡", "拆穿Skill/MCP/RAG",
      "拒绝智障Gemini", "手把手学会Agent Skills", "AI编程新时代",
      "大模型最新进展", "开源AI工具推荐", "AI视频生成对比",
      "AI音乐创作指南", "AI浏览器体验", "AI全家桶盘点",
    ],
    jieshuo: [
      "甄嬛传丫鬟说话术", "甄嬛传深度解说", "隐藏伏笔大揭秘",
      "后宫生存哲学", "职场高情商分析", "经典角色解读",
      "剧情反转盘点", "名场面深度解析", "编剧手法拆解",
      "台词背后的含义", "人物关系图谱", "结局深层解读",
    ],
    food: [
      "广东一天两只鸡", "深圳两天吃垮三区", "茂名美食攻略",
      "街边小吃探店", "家常菜谱分享", "海鲜大餐实录",
      "夜市美食地图", "甜品制作教程", "地方特色小吃",
      "早餐速成攻略", "减脂餐推荐", "年夜饭菜单",
    ],
    trip: [
      "亚庇五天四晚攻略", "深圳一日游", "海岛度假推荐",
      "云南自驾路线", "日本自由行", "露营装备清单",
      "摄影技巧分享", "民宿推荐合集", "签证攻略指南",
      "行李打包清单", "旅行vlog拍摄", "日落打卡攻略",
    ],
    renwen: [
      "三个角度讲透茶文化", "十五五规划行业解读", "拼豆经济深度分析",
      "中国31座主要山脉", "大宗商品百年周期", "茶叶六大分类入门",
      "高考专业选择指南", "地理知识一口气看懂", "新兴产业趋势分析",
      "商业财经深度解读", "文化常识科普合集", "知识型博主精选",
    ],
    game: [
      "洛克王国攻略", "异色恶魔狼", "华丽宝箱获取",
      "开放世界推荐", "独立游戏精选", "手游排行榜",
      "Steam特卖推荐", "剧情神作盘点", "多人联机推荐",
      "怀旧经典回顾", "攻略教程合集", "电竞赛事速递",
    ],
  };
  const catTitles = titles[categoryId] || titles.tech;
  return catTitles.map((title, i) => ({
    id: `${categoryId}-${i}`,
    title,
    cover: getCoverImage(prefix, i),
  }));
}

// ── 页面组件 ─────────────────────────────────────────────────────────────────
interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = use(params);
  const router = useRouter();
  const categoryId = decodeURIComponent(category);
  const meta = CATEGORY_META[categoryId];
  const [skillOpen, setSkillOpen] = useState(true);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  // 加载 mock 数据或使用 fallback
  useEffect(() => {
    if (!meta) return;

    if (meta.mockJsonPath) {
      fetch(meta.mockJsonPath)
        .then((res) => res.json())
        .then((data: { id: string; title: string }[]) => {
          const items = Array.isArray(data) ? data : [data];
          const mapped = items.map((item, i) => ({
            id: item.id,
            title: item.title,
            cover: getCoverImage(meta.imgPrefix, i),
          }));
          // 如果 JSON 数据不足 12 条，用 fallback 补齐
          if (mapped.length < 12) {
            const fallback = generateFallbackVideos(categoryId, meta.imgPrefix);
            const merged = [...mapped];
            for (let i = mapped.length; i < 12 && i < fallback.length; i++) {
              merged.push({
                ...fallback[i],
                cover: getCoverImage(meta.imgPrefix, i),
              });
            }
            setVideos(merged);
          } else {
            setVideos(mapped);
          }
        })
        .catch(() => {
          setVideos(generateFallbackVideos(categoryId, meta.imgPrefix));
        });
    } else {
      setVideos(generateFallbackVideos(categoryId, meta.imgPrefix));
    }
  }, [categoryId, meta]);

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">未知分类</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #C8E6F5 0%, #D5EDF7 50%, #E8F5FA 100%)" }}>
      {/* ── 顶部导航栏 ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-center px-4 py-3"
        style={{ background: "rgba(200,230,245,0.85)", backdropFilter: "blur(10px)" }}
      >
        <button
          onClick={() => router.back()}
          className="absolute left-4 text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>
          {meta.aiName}
        </h1>
      </header>

      {/* ── 机器人简介 ── */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: "rgba(255,255,255,0.45)", borderBottom: "1px solid rgba(255,255,255,0.6)" }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
          style={{ background: meta.bgColor }}
        >
          <Image src={meta.botImage} alt={meta.name} width={32} height={32} className="object-contain" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>抖小夹</p>
          <p className="text-xs" style={{ color: "#999" }}>根据你的收藏视频智能总结</p>
        </div>
      </div>

      {/* ── AI 文案区 ── */}
      <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.35)" }}>
        <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
          {meta.description}
        </p>
      </div>

      {/* ── 三列视频网格 ── */}
      <main className="flex-1 px-3 py-3 overflow-y-auto" style={{ paddingBottom: skillOpen ? "60vh" : "1rem" }}>
        <div className="grid grid-cols-3 gap-2">
          {videos.slice(0, 12).map((video) => (
            <div
              key={video.id}
              className="rounded-xl overflow-hidden relative"
              style={{ aspectRatio: "3/4" }}
            >
              <Image
                src={video.cover}
                alt={video.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 120px"
              />
              {/* 底部标题蒙版 */}
              <div
                className="absolute inset-x-0 bottom-0 p-2"
                style={{
                  background: "linear-gradient(transparent, rgba(0,0,0,0.5))",
                }}
              >
                <span
                  className="text-xs font-medium line-clamp-2 leading-tight"
                  style={{ color: "#fff" }}
                >
                  {video.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── 固定半屏 Skill 面板 ── */}
      {skillOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[60]">
          <div
            className="relative overflow-hidden"
            style={{ animation: "slideUp 0.35s ease both" }}
          >
            <SkillPanel onClose={() => setSkillOpen(false)} categoryId={categoryId} />
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
