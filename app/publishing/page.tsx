'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Send, Loader2, AlertCircle, Copy, Check, Clock, Hash,
  TrendingUp, Target, Lightbulb, ChevronDown, ChevronUp, ImageIcon
} from 'lucide-react';
import clsx from 'clsx';
import type { PublishingRecommendationsResult, SocialPlatform, PlatformRecommendation } from '@/lib/types';

const PLATFORM_CONFIG: Record<SocialPlatform, {
  label: string; icon: string; color: string; bgColor: string; textColor: string;
}> = {
  instagram: { label: 'Instagram', icon: '📸', color: '#e1306c', bgColor: 'bg-pink-50', textColor: 'text-pink-700' },
  facebook: { label: 'Facebook', icon: '👍', color: '#1877f2', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  linkedin: { label: 'LinkedIn', icon: '💼', color: '#0a66c2', bgColor: 'bg-sky-50', textColor: 'text-sky-700' },
  twitter: { label: 'X / Twitter', icon: '🐦', color: '#1da1f2', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700' },
  xiaohongshu: { label: '小紅書', icon: '📕', color: '#ff2442', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  wordpress: { label: 'WordPress', icon: '🌐', color: '#21759b', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
};

const ENGAGEMENT_COLORS = {
  'very high': '#10b981',
  'high': '#3b82f6',
  'medium': '#f59e0b',
  'low': '#94a3b8',
};

const ENGAGEMENT_LABELS = {
  'very high': '非常高',
  'high': '高',
  'medium': '中等',
  'low': '一般',
};

const PLATFORM_OPTIONS = Object.entries(PLATFORM_CONFIG).map(([value, config]) => ({
  value: value as SocialPlatform,
  ...config,
}));

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      title="複製"
    >
      {copied ? (
        <Check size={14} className="text-green-500" />
      ) : (
        <Copy size={14} className="text-slate-400" />
      )}
    </button>
  );
}

function PlatformCard({ rec, contentDescription }: { rec: PlatformRecommendation; contentDescription: string }) {
  const [expanded, setExpanded] = useState(true);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const config = PLATFORM_CONFIG[rec.platform];
  if (!config) return null;

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    setImageError('');
    setGeneratedImage(null);
    try {
      const prompt = `${contentDescription}. Platform: ${config.label}. Style: ${rec.contentAdaptation}`;
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, platform: rec.platform }),
      });
      const data = await res.json() as { imageData?: string; mimeType?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error || '生成失敗');
      setGeneratedImage(`data:${data.mimeType};base64,${data.imageData}`);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'AI 生成圖片失敗');
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Platform Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${config.color}15` }}
          >
            {config.icon}
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900">{config.label}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${ENGAGEMENT_COLORS[rec.predictedEngagement]}20`, color: ENGAGEMENT_COLORS[rec.predictedEngagement] }}
              >
                預測互動：{ENGAGEMENT_LABELS[rec.predictedEngagement] || rec.predictedEngagement}
              </span>
              <span className="text-xs text-slate-400">互動分：{rec.engagementScore}/100</span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100">
          {/* Optimal Times */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className={`rounded-lg p-3 ${config.bgColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} style={{ color: config.color }} />
                <span className="text-xs font-medium text-slate-600">最佳發佈時間</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rec.optimalTimes.map((time, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor} border`}
                    style={{ borderColor: `${config.color}30` }}
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs font-medium text-slate-600 mb-2">最佳發佈日</div>
              <div className="flex flex-wrap gap-1.5">
                {rec.bestDays.map((day, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-white text-slate-700 rounded-full border border-slate-200 font-medium">
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Caption */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-600">建議文案</span>
              <CopyButton text={rec.caption} />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {rec.caption}
            </div>
          </div>

          {/* Hashtags */}
          {rec.hashtags && rec.hashtags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Hash size={13} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-600">Hashtags ({rec.hashtags.length})</span>
                </div>
                <CopyButton text={rec.hashtags.join(' ')} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rec.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 text-xs rounded-full ${config.bgColor} ${config.textColor} font-medium cursor-pointer hover:opacity-80`}
                    onClick={() => navigator.clipboard.writeText(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Image Specs */}
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs font-medium text-slate-600 mb-1">圖片規格</div>
            <div className="text-xs text-slate-500">{rec.imageSpecs}</div>
          </div>

          {/* Content Adaptation */}
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1.5">內容適配建議</div>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">{rec.contentAdaptation}</p>
          </div>

          {/* Tips */}
          {rec.tips && rec.tips.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1.5">平台技巧</div>
              <ul className="space-y-1">
                {rec.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">★</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Image Generation */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <ImageIcon size={13} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-600">Gemini AI 配圖生成</span>
              </div>
              <button
                onClick={handleGenerateImage}
                disabled={generatingImage}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: `${config.color}15`, color: config.color }}
              >
                {generatingImage ? (
                  <><Loader2 size={12} className="animate-spin" />生成中...</>
                ) : (
                  <><ImageIcon size={12} />生成配圖</>
                )}
              </button>
            </div>
            {imageError && (
              <p className="text-xs text-red-500 mb-2">{imageError}</p>
            )}
            {generatedImage && (
              <div className="relative">
                <img
                  src={generatedImage}
                  alt={`${config.label} AI 生成配圖`}
                  className="w-full rounded-lg border border-slate-200 object-cover"
                  style={{ maxHeight: '300px' }}
                />
                <a
                  href={generatedImage}
                  download={`${config.label}_配圖.png`}
                  className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-xs rounded-lg hover:bg-black/80 transition-colors"
                >
                  下載圖片
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublishingPage() {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('產品推廣');
  const [targetAudience, setTargetAudience] = useState('');
  const [industry, setIndustry] = useState('');
  const [brandTone, setBrandTone] = useState('專業而親切');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['instagram', 'facebook']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublishingRecommendationsResult | null>(null);
  const [error, setError] = useState('');
  const [streamText, setStreamText] = useState('');

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleAnalyze = async () => {
    if (!content) {
      setError('請描述您要發佈的內容');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError('請選擇至少一個發佈平台');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setStreamText('');

    try {
      const res = await fetch('/api/publishing-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contentType, platforms: selectedPlatforms, targetAudience, industry, brandTone }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error('無回應串流');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        accumulated += chunk;
        setStreamText(accumulated);
      }

      if (accumulated.includes('__STREAM_ERROR__')) {
        const errPart = accumulated.split('__STREAM_ERROR__')[1];
        const errObj = JSON.parse(errPart) as { error: string };
        throw new Error(errObj.error);
      }

      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('無法解析回應，請重試');

      const parsed = JSON.parse(jsonMatch[0]) as PublishingRecommendationsResult;
      if ((parsed as { error?: string }).error) throw new Error((parsed as { error?: string }).error);

      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const engagementChartData = result?.platforms.map((p) => ({
    name: PLATFORM_CONFIG[p.platform]?.label || p.platform,
    score: p.engagementScore,
    platform: p.platform,
  })) || [];

  const CONTENT_TYPES = ['產品推廣', '品牌故事', '活動宣傳', '教育內容', '用戶見證', '幕後花絮', '限時優惠', '節日問候'];
  const BRAND_TONES = ['專業而親切', '活潑有趣', '高端優雅', '真實樸實', '鼓舞人心', '教育性強'];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center">
            <Send size={20} className="text-white" />
          </div>
          AI 智能發佈建議
          <span className="text-xs font-normal bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full ml-1">全新功能</span>
        </h1>
        <p className="text-slate-500 mt-1">AI 分析最佳發佈時機 · 各平台文案優化 · 互動率預測 · A/B 測試建議</p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        {/* Content Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            內容描述 <span className="text-red-500">*</span>
            <span className="text-xs text-slate-400 font-normal ml-2">描述您要發佈的內容、產品或想傳遞的訊息</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="例如：我們新推出夏日限定芒果雪糕系列，使用本地農場新鮮芒果製作，口感濃郁清爽。包含原味、鹽焦糖、抹茶三款口味，售價 $38/個。現於全港各分店有售..."
            rows={4}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">內容類型</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              {CONTENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">品牌語調</label>
            <select
              value={brandTone}
              onChange={(e) => setBrandTone(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              {BRAND_TONES.map((tone) => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">目標受眾</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="例如：25-40歲香港女性，注重生活品質"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">行業</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="例如：餐飲、零售、美容、教育"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Platform Selection */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            選擇發佈平台 <span className="text-red-500">*</span>
            <span className="text-xs text-slate-400 font-normal ml-2">可多選</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PLATFORM_OPTIONS.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.value);
              return (
                <button
                  key={platform.value}
                  onClick={() => togglePlatform(platform.value)}
                  className={clsx(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all text-sm font-medium',
                    isSelected
                      ? 'border-violet-500 bg-violet-50 text-violet-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  )}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span>{platform.label}</span>
                  {isSelected && (
                    <Check size={14} className="text-violet-500 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 px-3 py-2.5 rounded-lg">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              AI 分析中... ({streamText.length > 0 ? `${streamText.length} 字元` : '初始化'})
            </>
          ) : (
            <>
              <Send size={18} />
              生成智能發佈建議
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Strategy Overview */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={20} className="text-yellow-300" />
              <h2 className="font-semibold text-lg">AI 整體策略建議</h2>
            </div>
            <p className="text-violet-100 leading-relaxed">{result.bestOverallStrategy}</p>

            {/* Content Analysis */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: '內容類型', value: result.contentAnalysis.type },
                { label: '語調風格', value: result.contentAnalysis.tone },
                { label: '目標受眾', value: result.contentAnalysis.targetAudience },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 rounded-lg p-3 col-span-1">
                  <div className="text-xs text-violet-200 mb-1">{item.label}</div>
                  <div className="text-sm font-medium text-white">{item.value}</div>
                </div>
              ))}
              <div className="bg-white/10 rounded-lg p-3 col-span-1">
                <div className="text-xs text-violet-200 mb-1">核心訊息</div>
                <div className="text-xs font-medium text-white">
                  {result.contentAnalysis.keyMessages[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Score Chart */}
          {engagementChartData.length > 1 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-violet-500" />
                <h3 className="font-semibold text-slate-900">各平台預測互動分數</h3>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={engagementChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${value}/100`, '互動預測分']}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {engagementChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PLATFORM_CONFIG[entry.platform as SocialPlatform]?.color || '#8b5cf6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Platform Cards */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-violet-500" />
              <h3 className="font-semibold text-slate-900">各平台發佈建議</h3>
            </div>
            <div className="space-y-4">
              {result.platforms.map((rec, i) => (
                <PlatformCard key={i} rec={rec} contentDescription={content} />
              ))}
            </div>
          </div>

          {/* Cross-Platform Strategy */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-violet-500" />
              <h3 className="font-semibold text-slate-900">跨平台協調策略</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{result.crossPlatformStrategy}</p>
          </div>

          {/* A/B Test Suggestions */}
          {result.abTestSuggestions && result.abTestSuggestions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={18} className="text-amber-500" />
                <h3 className="font-semibold text-slate-900">A/B 測試建議</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {result.abTestSuggestions.map((test, i) => (
                  <div key={i} className={clsx(
                    'rounded-xl border p-4',
                    i % 2 === 0 ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'
                  )}>
                    <div className={clsx(
                      'text-sm font-bold mb-2',
                      i % 2 === 0 ? 'text-blue-700' : 'text-amber-700'
                    )}>
                      {test.variant}
                    </div>
                    <p className="text-xs text-slate-700 mb-2">{test.description}</p>
                    <div className="text-xs text-slate-500">
                      <span className="font-medium">假設：</span>{test.hypothesis}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      <span className="font-medium">預期結果：</span>{test.expectedOutcome}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPIs */}
          {result.kpis && result.kpis.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target size={18} className="text-violet-500" />
                <h3 className="font-semibold text-slate-900">建議 KPI 目標</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {result.kpis.map((kpi, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{kpi.metric}</div>
                      <div className="text-xs text-slate-400">{kpi.platform}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-violet-600">{kpi.target}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
