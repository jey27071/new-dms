// AI 이미지 생성 API 라우트
// 현재는 AI provider 미연동 상태 — placeholder 이미지(picsum.photos) 반환.
// 추후 OpenAI DALL-E 3 / Replicate / Stability 등으로 교체 시
// generateImagesStub 함수만 실제 API 호출로 바꾸면 됨.

import { NextRequest } from "next/server";

export const runtime = "nodejs";

type Body = {
  prompt: string;
  systemPrompt?: string;
  negativePrompt?: string;
  count?: number;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "잘못된 요청" }, { status: 400 });
  }
  if (!body.prompt || !body.prompt.trim()) {
    return Response.json({ ok: false, error: "프롬프트가 비어있습니다." }, { status: 400 });
  }

  const count = Math.min(Math.max(body.count ?? 3, 1), 4);
  const fullPrompt = [body.systemPrompt, body.prompt].filter(Boolean).join("\n\n");

  try {
    const imageUrls = await generateImagesStub(fullPrompt, count);
    return Response.json({
      ok: true,
      imageUrls,
      fullPrompt,
      provider: "stub",
    });
  } catch (err) {
    console.error("[/api/ai/generate]", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * 임시 이미지 생성 stub.
 * 진짜 AI 연동 시 이 함수만 교체하면 됨.
 *
 * OpenAI DALL-E 3 예시 코드 (주석):
 *   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *   const urls: string[] = [];
 *   for (let i = 0; i < count; i++) {
 *     const r = await openai.images.generate({
 *       model: "dall-e-3", prompt: fullPrompt, n: 1, size: "1024x1024"
 *     });
 *     if (r.data[0]?.url) urls.push(r.data[0].url);
 *   }
 *   return urls;
 */
async function generateImagesStub(fullPrompt: string, count: number): Promise<string[]> {
  // 프롬프트 + 타임스탬프로 시드 → 같은 프롬프트라도 매번 다른 결과 보장
  const baseSeed = `${Math.abs(hashCode(fullPrompt))}-${Date.now()}`;
  // 데모용 인공 지연 (실제 AI 호출 느낌)
  await new Promise((r) => setTimeout(r, 1500));
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/seed/${baseSeed}-${i}/1024/1024`,
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
