import { GoogleGenAI, Modality } from '@google/genai';
import { NextRequest } from 'next/server';

export const maxDuration = 60;

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });

export async function POST(req: NextRequest) {
  let body: { prompt?: string; platform?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: '無效的請求格式' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { prompt, platform } = body;

  if (!prompt) {
    return new Response(JSON.stringify({ error: '請提供圖片描述' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const googleApiKey = process.env.GOOGLE_API_KEY;
  if (!googleApiKey) {
    return new Response(JSON.stringify({ error: 'GOOGLE_API_KEY 未設定' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Build platform-aware image prompt
  const platformHints: Record<string, string> = {
    instagram: 'square 1:1 aspect ratio, vibrant colors, lifestyle photography style',
    facebook: 'horizontal 1.91:1 aspect ratio, eye-catching, shareable',
    linkedin: 'professional, clean, corporate style, horizontal format',
    twitter: 'bold, high contrast, simple composition, horizontal',
    xiaohongshu: 'aesthetic, soft tones, lifestyle, vertical 3:4 format, trendy',
    wordpress: 'wide banner, professional, editorial style, 16:9 horizontal',
  };

  const platformHint = platform ? (platformHints[platform] || '') : '';
  const fullPrompt = `Create a social media marketing image for Hong Kong audience. ${prompt}. ${platformHint}. High quality, professional, modern design. No text overlay.`;

  try {
    const response = await genai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: fullPrompt,
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Find image part in response
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith('image/'));

    if (!imagePart?.inlineData) {
      return new Response(JSON.stringify({ error: '圖片生成失敗，請重試' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        imageData: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : '圖片生成失敗';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
