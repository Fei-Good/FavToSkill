"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── 类型 ──────────────────────────────────────────────────────────────────────
type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

// ── 推荐问题 ──────────────────────────────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  "五一我要去巴厘岛，给我生成个省钱攻略！",
  "给我总结我收藏甄嬛传的名台词！",
  "雪影娃娃怎么快速刷异色？",
];

// ── 推荐问题的预置回答（跳过 AI，本地流式输出） ─────────────────────────────
const PRESET_ANSWERS: Record<string, string> = {
  "五一我要去巴厘岛，给我生成个省钱攻略！": `🏝️ 巴厘岛省钱攻略来啦！根据你收藏的两条巴厘岛视频整理：

✈️ **机票**：上海/广州出发转机吉隆坡，往返约 800-1500 元！落地签说走就走，记得提前办好电子签免排队。

🏨 **住宿**：乌鲁瓦图/乌布酒店 200 多一晚就能住独栋泳池别墅！佩尼达岛同价位还能看日落火山。

🗺️ **行程安排**（5天）：
• Day1：库塔沙滩逛吃，买冰箱贴
• Day2：佩尼达岛一日游（报团 300 多，含接送免打车费 200+）
• Day3：钻石沙滩 + 苹果壁纸取景地精灵坠崖
• Day4：乌布梯田 + 乌布皇宫 + 特色脏鸭饭
• Day5：南部悬崖咖啡店看日落 + 金巴兰海边晚餐

💰 **省钱秘诀**：
• 打车用 Grab，比出租便宜一半
• 吃饭人均二三十，印尼炒饭炒面超好吃
• 按摩 1 小时才 10 块！精油 SPA 也白菜价
• 总花费 3000-5000 搞定，含机票！

📱 必备 APP：谷歌地图（下载离线）、Grab打车、库里翻译、Clock预约

> 来源：你收藏的《大学生巴厘岛5天不到5000攻略》《3000富游巴厘岛》`,

  "给我总结我收藏甄嬛传的名台词！": `🎭 从你收藏的甄嬛传解说视频中，为你提炼经典台词与深度解读：

**【职场高情商话术】**
• 剪秋："娘娘母仪天下，会跟她一般计较吗？"
  → 不是劝忍，是把领导从争执者抬回规则制定者，让对方掉身份。

• 剪秋："太后果然是最心疼娘娘的。"
  → 精准包装领导行为为最聪明、最体面的选择。

**【反面教材·绘春】**
• "华妃宫里的颂芝把好东西都挑走了！"
  → 以为替领导出气，实则一遍遍提醒领导"你什么都管不了"。

**【经典博弈·滴血验亲】**
• 甄嬛："本宫在甘露寺三年，经历九死一生还能再回来，这还不能说明问题吗？"
  → 不否认认识温实初，巧妙将缘分与皇上绑定，死局变逆风局。

• 甄嬛设问绯雯："你出来前可把紫檀桌上的琉璃花樽擦干净了？"
  → 经典两头堵陷阱，证人说谎一次，所有证词不可信。

**【生存法则】**
• 让领导开心是短期收益，让领导站得住才是长期价值。
• 真正留下来的人，不是最热心的，而是最懂分寸的。

> 来源：你收藏的《甄嬛传丫鬟说话逻辑》《滴血验亲名场面》等`,

  "雪影娃娃怎么快速刷异色？": `🎮 根据你收藏的洛克王国世界攻略视频，整理异色精灵刷取方法：

**【异色精灵获取核心方法】**

1️⃣ **炫彩球（冷静球）抓异色**
用冷静球抓异色精灵会直接变成「异色炫彩」——游戏里含金量最高的标签！优先用在：异色炫彩 > 传说精灵炫彩 > 稀有精灵炫彩。

2️⃣ **首领血脉合成法**
如果抓到异色但没有首领血脉：打 10 次首领精灵 → 放生孵化出的首领精灵 → 合成「首领血脉秘药」→ 给异色精灵使用即可获得首领血脉！

3️⃣ **国王球辅助**
• 每天远行商人处白嫖 3 个国王球（早8点刷新，4小时一轮）
• 王国城堡古币机开抽屉也能拿国王球
• 国王球捕捉必成功 + 必出了不起天分

4️⃣ **刷异色效率提升**
• 组一只带「灵巧+爱分享」特长的精灵编队，采集效率×5
• 恶水沼泽刷恶魔红钻练级——它会用二技能打自己，无伤刷经验
• 精灵升级后再去目标区域反复刷，提高遭遇异色概率

💡 **小贴士**：雪影娃娃属于冰系稀有精灵，建议在对应刷新点蹲守，配合炫彩球使用效果最佳！

> 来源：你收藏的《异色恶魔狼首领血脉》《精灵球必吃榜》《开服保姆级攻略》`,
};

// ── 解析 Vercel AI Data Stream 协议 ──────────────────────────────────────────
// 格式：`0:"text chunk"\n`  每行以数字前缀区分类型，0 = text token
function parseDataStreamLine(line: string): string | null {
  if (!line.startsWith("0:")) return null;
  try {
    return JSON.parse(line.slice(2));
  } catch {
    return null;
  }
}

// ── 本地流式输出预置回答 ─────────────────────────────────────────────────────
async function streamPresetAnswer(
  answer: string,
  aiMsgId: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMsg[]>>
) {
  // 模拟 2 秒思考时间，让 loading 动画展示
  await new Promise((r) => setTimeout(r, 2000));
  // 每次输出 2-4 个字符，模拟流式打字效果
  let idx = 0;
  while (idx < answer.length) {
    const chunkSize = Math.min(2 + Math.floor(Math.random() * 3), answer.length - idx);
    const chunk = answer.slice(idx, idx + chunkSize);
    idx += chunkSize;
    setMessages((prev) =>
      prev.map((m) => (m.id === aiMsgId ? { ...m, content: m.content + chunk } : m))
    );
    await new Promise((r) => setTimeout(r, 18 + Math.random() * 22));
  }
}

// ── 组件 ──────────────────────────────────────────────────────────────────────
export default function ChatPanel({
  onClose,
  initialInput = "",
}: {
  onClose: () => void;
  initialInput?: string;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);

  // 自动滚到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // 发送消息并流式读取 AI 回复
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };

      // 构建发送给 API 的消息历史
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      // 创建 AI 消息占位
      const aiMsgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: "assistant", content: "" },
      ]);

      // ── 预置回答：本地流式输出，不走 API ──
      const presetAnswer = PRESET_ANSWERS[trimmed];
      if (presetAnswer) {
        try {
          await streamPresetAnswer(presetAnswer, aiMsgId, setMessages);
        } catch {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? { ...m, content: "抱歉，回复生成失败，请稍后重试～" }
                : m
            )
          );
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // ── 其余问题走 API ──
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!res.ok || !res.body) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? { ...m, content: "抱歉，服务暂时不可用，请稍后重试～" }
                : m
            )
          );
          setIsLoading(false);
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
          // 保留最后一个可能不完整的行
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const token = parseDataStreamLine(line);
            if (token !== null) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, content: m.content + token }
                    : m
                )
              );
            }
          }
        }

        // 处理 buffer 中剩余的内容
        if (buffer) {
          const token = parseDataStreamLine(buffer);
          if (token !== null) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, content: m.content + token }
                  : m
              )
            );
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: "网络连接失败，请检查网络后重试～" }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  // 初始输入自动发送
  useEffect(() => {
    if (initialInput.trim() && !hasSentInitial.current) {
      hasSentInitial.current = true;
      send(initialInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMessages = messages.length > 0;

  return (
    <div className="relative z-10 flex flex-col h-full px-5 pt-5 pb-4">
      {/* ── 顶部拖拽条 ── */}
      <div className="flex items-center justify-center mb-3">
        <div
          className="w-10 h-1 rounded-full"
          style={{ background: "rgba(0,0,0,0.15)" }}
        />
      </div>

      {/* ── 欢迎区（无消息时显示） ── */}
      {!hasMessages && (
        <div className="flex flex-col pt-14 items-center">
          <h2
            className="text-lg font-bold text-center"
            style={{ color: "#1A1A1A" }}
          >
            嗨～我是抖小夹，你的专属收藏整理小助手！
          </h2>
          <p className="text-sm text-center mt-1" style={{ color: "#666" }}>
            快来问我♥️
          </p>

          {/* 推荐问题 */}
          <div className="flex flex-col gap-3 mt-6 w-full">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                className="text-left rounded-2xl px-4 py-3 text-sm active:scale-[0.98] transition-transform"
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
      )}

      {/* ── 消息列表 ── */}
      {hasMessages && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-3 pt-14 pr-1"
          style={{ scrollbarWidth: "none" }}
        >
          {messages.map((msg) => {
            // 跳过内容为空的 AI 消息（由 loading 指示器代替展示）
            if (msg.role === "assistant" && !msg.content) return null;
            return (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* AI 头像 */}
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs"
                  style={{ background: "#C8E6F5", color: "#2C2C2C" }}
                >
                  🤖
                </div>
              )}

              <div
                className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                style={
                  msg.role === "user"
                    ? {
                        background: "#2C2C2C",
                        color: "#FFF",
                        borderBottomRightRadius: 6,
                      }
                    : {
                        background: "rgba(255,255,255,0.8)",
                        color: "#1A1A1A",
                        borderBottomLeftRadius: 6,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }
                }
              >
                {msg.content}
              </div>
            </div>
            );
          })}

          {/* 正在输入指示器：仅在 AI 消息内容为空时显示 */}
          {isLoading &&
            messages[messages.length - 1]?.role === "assistant" &&
            !messages[messages.length - 1]?.content && (
              <div className="flex justify-start">
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs"
                  style={{ background: "#C8E6F5", color: "#2C2C2C" }}
                >
                  🤖
                </div>
                <div
                  className="rounded-2xl px-4 py-3 text-sm"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <span className="inline-flex gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                </div>
              </div>
            )}
        </div>
      )}

      {/* 弹性占位（无消息时撑开） */}
      {!hasMessages && <div className="flex-1" />}

      {/* ── 输入栏 ── */}
      <div className="flex items-center gap-2 mt-3">
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
          placeholder="收藏过的某个东西不记得了吗？快来问我"
          autoFocus={false}
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
    </div>
  );
}
