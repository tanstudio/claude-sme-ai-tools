import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

// Increase Next.js route timeout (Vercel: max 300s on Pro, 60s on Hobby)
export const maxDuration = 120;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { url, keywords, location, competitors } = await req.json();

  if (!url && !keywords) {
    return new Response(JSON.stringify({ error: '請提供網站 URL 或目標關鍵字' }), {
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

  const systemPrompt = `You are an expert SEO strategist with deep knowledge of Hong Kong and Chinese markets.
You analyze websites and keywords to provide comprehensive, actionable SEO insights.
Always respond with valid, complete JSON only — no markdown, no explanation text outside JSON.
All text content should be in Traditional Chinese (繁體中文) unless it's a URL, technical term, or English keyword.`;

  const userPrompt = `Perform a comprehensive SEO analysis for the following:
- Website/Business: ${url || 'Not provided'}
- Target Keywords: ${keywords || 'Not provided'}
- Location: ${location || 'Hong Kong'}
- Competitors to analyze: ${competitors || 'Identify top 3 competitors'}

Return a JSON object with EXACTLY this structure (fill with realistic, specific data):
{
  "summary": "2-3 sentence executive summary in Traditional Chinese",
  "overallScore": <number 0-100>,
  "keywordAnalysis": [
    {
      "keyword": "keyword text",
      "intent": "informational|transactional|navigational|commercial",
      "difficulty": <0-100>,
      "cpcEstimate": "HKD X-Y",
      "volumeEstimate": "X-X monthly searches",
      "longTailSuggestions": ["long tail 1", "long tail 2", "long tail 3"]
    }
  ],
  "keywordClusters": [
    {
      "pillar": "main topic pillar",
      "description": "description of the pillar",
      "clusters": ["cluster 1", "cluster 2", "cluster 3"],
      "contentType": "blog|product|landing page|etc",
      "priority": "high|medium|low"
    }
  ],
  "competitorAnalysis": [
    {
      "name": "Competitor Name",
      "url": "competitor.com",
      "daScore": <0-100>,
      "contentGaps": ["gap 1", "gap 2", "gap 3"],
      "serpFeatures": ["Featured Snippet", "Local Pack", "etc"],
      "backlinkStrategy": "description",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"]
    }
  ],
  "contentStrategy": {
    "articleIdeas": [
      {
        "title": "Article title in Chinese",
        "targetKeyword": "keyword",
        "outline": ["Section 1", "Section 2", "Section 3", "Section 4"]
      }
    ],
    "contentCalendar": [
      {
        "week": 1,
        "title": "Content title",
        "type": "blog|social|video|etc",
        "targetKeyword": "keyword",
        "platform": "Website|Instagram|Facebook|etc",
        "outline": ["Point 1", "Point 2", "Point 3"]
      }
    ],
    "contentGaps": ["gap 1", "gap 2", "gap 3", "gap 4", "gap 5"]
  },
  "localSEO": ${location ? `{
    "score": <0-100>,
    "dimensions": [
      {"name": "Google Business Profile", "score": <0-20>, "maxScore": 20, "recommendation": "recommendation"},
      {"name": "本地引用一致性", "score": <0-15>, "maxScore": 15, "recommendation": "recommendation"},
      {"name": "本地關鍵字優化", "score": <0-15>, "maxScore": 15, "recommendation": "recommendation"},
      {"name": "評論管理", "score": <0-15>, "maxScore": 15, "recommendation": "recommendation"},
      {"name": "本地內容策略", "score": <0-15>, "maxScore": 15, "recommendation": "recommendation"},
      {"name": "地圖嵌入及NAP", "score": <0-10>, "maxScore": 10, "recommendation": "recommendation"},
      {"name": "社區互動", "score": <0-10>, "maxScore": 10, "recommendation": "recommendation"}
    ],
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4"]
  }` : 'null'},
  "radarData": [
    {"subject": "Keyword Relevance", "relevance": <0-100>, "difficulty": <0-100>}
  ]
}

Provide realistic estimates based on Hong Kong market data. Generate exactly 3-5 keywords, 3 clusters, 3 competitors, 4 article ideas, and 4 weeks of content calendar items.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        });

        let fullText = '';

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullText += event.delta.text;
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
