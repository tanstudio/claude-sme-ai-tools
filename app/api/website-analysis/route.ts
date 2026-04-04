import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { url, competitors } = await req.json();

  if (!url) {
    return new Response(JSON.stringify({ error: '請提供網站 URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY 未設定' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const systemPrompt = `You are a world-class digital marketing analyst specializing in website analysis for the Hong Kong SME market.
You provide comprehensive, data-driven website audits across 10 key dimensions.
Always respond with valid, complete JSON only — no markdown, no explanation text outside JSON.
All text content should be in Traditional Chinese (繁體中文) unless it's a URL, technical term, or metric name.`;

  const userPrompt = `Perform a comprehensive 10-dimension website analysis for: ${url}
Competitors to compare: ${competitors || 'Identify and analyze 2 relevant competitors'}

Return a JSON object with EXACTLY this structure:
{
  "url": "${url}",
  "overallScore": <0-100>,
  "industry": "identified industry in Chinese",
  "summary": "3-sentence executive summary in Traditional Chinese",
  "dimensions": {
    "basic": {
      "score": <0-100>,
      "maxScore": 100,
      "summary": "summary in Chinese",
      "details": ["detail 1", "detail 2", "detail 3"],
      "recommendations": ["rec 1", "rec 2", "rec 3"]
    },
    "seo": {
      "score": <0-100>,
      "maxScore": 100,
      "summary": "SEO summary",
      "details": ["detail 1", "detail 2", "detail 3"],
      "recommendations": ["rec 1", "rec 2"]
    },
    "content": {
      "score": <0-100>,
      "maxScore": 100,
      "summary": "content summary",
      "details": ["detail 1", "detail 2", "detail 3"],
      "recommendations": ["rec 1", "rec 2"]
    },
    "speed": {
      "score": <0-100>,
      "maxScore": 100,
      "summary": "speed summary",
      "details": ["LCP: X.Xs", "FID: XXms", "CLS: 0.XX", "detail 3"],
      "recommendations": ["rec 1", "rec 2"]
    },
    "brand": {
      "score": <0-100>,
      "maxScore": 100,
      "summary": "brand summary",
      "details": ["detail 1", "detail 2", "detail 3"],
      "recommendations": ["rec 1", "rec 2"]
    },
    "ux": {
      "score": <0-100>,
      "maxScore": 100,
      "summary": "UX summary",
      "details": ["detail 1", "detail 2", "detail 3"],
      "recommendations": ["rec 1", "rec 2"]
    },
    "social": {
      "score": <0-100>,
      "maxScore": 100,
      "summary": "social media summary",
      "details": ["detail 1", "detail 2", "detail 3"],
      "recommendations": ["rec 1", "rec 2"]
    },
    "trust": {
      "score": <0-100>,
      "maxScore": 100,
      "summary": "trust summary",
      "details": ["detail 1", "detail 2", "detail 3"],
      "recommendations": ["rec 1", "rec 2"]
    },
    "cro": {
      "score": <0-100>,
      "maxScore": 100,
      "summary": "CRO summary",
      "details": ["detail 1", "detail 2", "detail 3"],
      "recommendations": ["rec 1", "rec 2"]
    },
    "mobile": {
      "score": <0-100>,
      "maxScore": 100,
      "summary": "mobile summary",
      "details": ["detail 1", "detail 2", "detail 3"],
      "recommendations": ["rec 1", "rec 2"]
    }
  },
  "radarData": [
    {"dimension": "基礎技術", "score": <0-100>, "benchmark": <0-100>},
    {"dimension": "SEO優化", "score": <0-100>, "benchmark": <0-100>},
    {"dimension": "內容品質", "score": <0-100>, "benchmark": <0-100>},
    {"dimension": "載入速度", "score": <0-100>, "benchmark": <0-100>},
    {"dimension": "品牌定位", "score": <0-100>, "benchmark": <0-100>},
    {"dimension": "用戶體驗", "score": <0-100>, "benchmark": <0-100>},
    {"dimension": "社交媒體", "score": <0-100>, "benchmark": <0-100>},
    {"dimension": "信任度", "score": <0-100>, "benchmark": <0-100>},
    {"dimension": "轉化優化", "score": <0-100>, "benchmark": <0-100>},
    {"dimension": "移動優化", "score": <0-100>, "benchmark": <0-100>}
  ],
  "contentGapData": [
    {"category": "博客/文章", "current": <0-100>, "benchmark": <0-100>},
    {"category": "視頻內容", "current": <0-100>, "benchmark": <0-100>},
    {"category": "個案研究", "current": <0-100>, "benchmark": <0-100>},
    {"category": "常見問題", "current": <0-100>, "benchmark": <0-100>},
    {"category": "產品詳情", "current": <0-100>, "benchmark": <0-100>},
    {"category": "用戶評論", "current": <0-100>, "benchmark": <0-100>}
  ],
  "swotAnalysis": {
    "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
    "weaknesses": ["weakness 1", "weakness 2", "weakness 3", "weakness 4"],
    "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3", "opportunity 4"],
    "threats": ["threat 1", "threat 2", "threat 3", "threat 4"]
  },
  "pestAnalysis": {
    "political": ["factor 1", "factor 2"],
    "economic": ["factor 1", "factor 2"],
    "social": ["factor 1", "factor 2"],
    "technological": ["factor 1", "factor 2"]
  },
  "userJourney": [
    {
      "stage": "認知 (Awareness)",
      "touchpoints": ["touchpoint 1", "touchpoint 2"],
      "userActions": ["action 1", "action 2"],
      "emotions": "emotion description",
      "painPoints": ["pain point 1", "pain point 2"],
      "opportunities": ["opportunity 1", "opportunity 2"]
    },
    {
      "stage": "考慮 (Consideration)",
      "touchpoints": ["touchpoint 1", "touchpoint 2"],
      "userActions": ["action 1", "action 2"],
      "emotions": "emotion description",
      "painPoints": ["pain point 1", "pain point 2"],
      "opportunities": ["opportunity 1", "opportunity 2"]
    },
    {
      "stage": "決策 (Decision)",
      "touchpoints": ["touchpoint 1", "touchpoint 2"],
      "userActions": ["action 1", "action 2"],
      "emotions": "emotion description",
      "painPoints": ["pain point 1", "pain point 2"],
      "opportunities": ["opportunity 1", "opportunity 2"]
    },
    {
      "stage": "購買 (Purchase)",
      "touchpoints": ["touchpoint 1", "touchpoint 2"],
      "userActions": ["action 1", "action 2"],
      "emotions": "emotion description",
      "painPoints": ["pain point 1", "pain point 2"],
      "opportunities": ["opportunity 1", "opportunity 2"]
    },
    {
      "stage": "留存 (Retention)",
      "touchpoints": ["touchpoint 1", "touchpoint 2"],
      "userActions": ["action 1", "action 2"],
      "emotions": "emotion description",
      "painPoints": ["pain point 1", "pain point 2"],
      "opportunities": ["opportunity 1", "opportunity 2"]
    }
  ],
  "actionPlan": [
    {"priority": "high", "action": "action in Chinese", "impact": "impact description", "effort": "low|medium|high"},
    {"priority": "high", "action": "action in Chinese", "impact": "impact description", "effort": "low|medium|high"},
    {"priority": "medium", "action": "action in Chinese", "impact": "impact description", "effort": "low|medium|high"},
    {"priority": "medium", "action": "action in Chinese", "impact": "impact description", "effort": "low|medium|high"},
    {"priority": "low", "action": "action in Chinese", "impact": "impact description", "effort": "low|medium|high"},
    {"priority": "low", "action": "action in Chinese", "impact": "impact description", "effort": "low|medium|high"}
  ],
  "competitors": [
    {
      "name": "Competitor Name",
      "url": "competitor.com",
      "overallScore": <0-100>,
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2"]
    }
  ]
}

Provide realistic, specific analysis based on what you can infer about this type of website/business. Be specific and actionable in all recommendations.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: 'claude-opus-4-6',
          max_tokens: 10000,
          thinking: { type: 'adaptive' } as unknown as Parameters<typeof anthropic.messages.stream>[0]['thinking'],
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        });

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        controller.close();
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue(encoder.encode(JSON.stringify({ error: errMsg })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
