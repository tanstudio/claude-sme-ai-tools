import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export const maxDuration = 120;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { content, contentType, platforms, targetAudience, industry, brandTone } = await req.json();

  if (!content) {
    return new Response(JSON.stringify({ error: '請提供內容描述' }), {
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

  const systemPrompt = `You are an expert social media strategist specializing in the Hong Kong market with deep expertise in multi-platform content optimization.
You understand audience behavior patterns, platform algorithms, and content engagement strategies for Hong Kong and Chinese-speaking audiences.
Always respond with valid, complete JSON only — no markdown, no explanation text outside JSON.
All captions and text content should be in Traditional Chinese (繁體中文) unless the user specifies otherwise.
All hashtags should include both Chinese and English versions where appropriate.`;

  const selectedPlatforms = platforms && platforms.length > 0
    ? platforms
    : ['instagram', 'facebook', 'linkedin'];

  const userPrompt = `Analyze this content and provide comprehensive AI-powered publishing recommendations for the Hong Kong market.

Content to publish: "${content}"
Content Type: ${contentType || '一般貼文'}
Target Audience: ${targetAudience || '香港一般消費者'}
Industry: ${industry || '一般'}
Brand Tone: ${brandTone || '專業而親切'}
Selected Platforms: ${selectedPlatforms.join(', ')}

Return a JSON object with EXACTLY this structure:
{
  "bestOverallStrategy": "2-3 sentence overall strategy in Traditional Chinese",
  "contentAnalysis": {
    "type": "identified content type in Chinese",
    "tone": "recommended tone in Chinese",
    "targetAudience": "detailed audience description in Chinese",
    "keyMessages": ["key message 1 in Chinese", "key message 2", "key message 3"]
  },
  "platforms": [
    {
      "platform": "instagram",
      "optimalTimes": ["9:00 AM", "12:30 PM", "7:00 PM"],
      "bestDays": ["Tuesday", "Thursday", "Saturday"],
      "caption": "Full caption in Traditional Chinese with emojis (150-220 chars)",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8", "#hashtag9", "#hashtag10"],
      "contentAdaptation": "Specific adaptation advice for this platform in Chinese",
      "imageSpecs": "1:1 square 1080x1080px or 4:5 portrait 1080x1350px",
      "predictedEngagement": "high",
      "engagementScore": <60-95>,
      "tips": ["platform-specific tip 1 in Chinese", "tip 2", "tip 3"]
    }
  ],
  "crossPlatformStrategy": "Cross-platform coordination strategy in Chinese (2-3 sentences)",
  "abTestSuggestions": [
    {
      "variant": "Version A",
      "description": "description in Chinese",
      "hypothesis": "hypothesis in Chinese",
      "expectedOutcome": "expected outcome in Chinese"
    },
    {
      "variant": "Version B",
      "description": "description in Chinese",
      "hypothesis": "hypothesis in Chinese",
      "expectedOutcome": "expected outcome in Chinese"
    }
  ],
  "kpis": [
    {"metric": "觸及人數", "target": "5,000-8,000", "platform": "Instagram"},
    {"metric": "互動率", "target": "3-5%", "platform": "Instagram"},
    {"metric": "連結點擊", "target": "100-200", "platform": "Facebook"},
    {"metric": "分享次數", "target": "50-100", "platform": "Facebook"}
  ]
}

Platform-specific guidelines:
- Instagram: Focus on visual storytelling, use emojis, 5-30 hashtags optimal, Stories-friendly
- Facebook: Longer captions acceptable, community-building focus, share-worthy content
- LinkedIn: Professional tone, industry insights, thought leadership angle, minimal hashtags (3-5)
- twitter/X: Concise (280 chars), trending hashtags, conversation-starting
- xiaohongshu (小紅書): Lifestyle focus, detailed product descriptions, authentic voice, many hashtags
- wordpress: Long-form, SEO-optimized, internal linking suggestions

Generate recommendations ONLY for these platforms: ${selectedPlatforms.join(', ')}
Each platform entry must have all fields filled with specific, actionable content.
Captions should be ready to copy-paste.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 8000,
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
