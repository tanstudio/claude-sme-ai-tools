'use client';

import { useState, useRef } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';
import {
  Search, Download, Loader2, AlertCircle, CheckCircle,
  Target, TrendingUp, Users, MapPin, Calendar, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import clsx from 'clsx';
import type { SEOAnalysisResult } from '@/lib/types';

const INTENT_COLORS: Record<string, string> = {
  informational: '#3b82f6',
  transactional: '#10b981',
  navigational: '#f59e0b',
  commercial: '#8b5cf6',
};

const INTENT_LABELS: Record<string, string> = {
  informational: '資訊型',
  transactional: '交易型',
  navigational: '導航型',
  commercial: '商業型',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

export default function SEOAnalysisPage() {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('Hong Kong');
  const [competitors, setCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOAnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [streamText, setStreamText] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['keywords', 'clusters']));
  const reportRef = useRef<HTMLDivElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleAnalyze = async () => {
    if (!url && !keywords) {
      setError('請提供網站 URL 或目標關鍵字');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setStreamText('');

    try {
      const res = await fetch('/api/seo-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, keywords, location, competitors }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        accumulated += chunk;
        setStreamText(accumulated);
      }

      // Extract JSON from accumulated text (handle thinking blocks)
      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('無法解析回應，請重試');

      const parsed = JSON.parse(jsonMatch[0]) as SEOAnalysisResult;
      if ((parsed as { error?: string }).error) throw new Error((parsed as { error?: string }).error);

      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const { exportToPDF } = await import('@/lib/pdf-export');
      await exportToPDF('seo-report', `SEO分析報告_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      alert('PDF 匯出失敗，請重試');
    }
  };

  const SectionHeader = ({
    id, title, icon: Icon, color
  }: { id: string; title: string; icon: React.ElementType; color: string }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
          <Icon size={16} className="text-white" />
        </div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      {expandedSections.has(id) ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
              <Search size={20} className="text-white" />
            </div>
            SEO 分析工具
          </h1>
          <p className="text-slate-500 mt-1">深度關鍵字分析 · AI 內容策略 · 競爭對手研究</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">每次 3 點</span>
          {result && (
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium no-print"
            >
              <Download size={16} />
              匯出 PDF 報告
            </button>
          )}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 no-print">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">網站 URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">目標關鍵字 <span className="text-slate-400">(逗號分隔)</span></label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="香港美食, 旺角餐廳, 港式下午茶"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">地區 <span className="text-slate-400">(本地 SEO)</span></label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Hong Kong / 旺角 / 香港島"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">競爭對手 <span className="text-slate-400">(可選，逗號分隔)</span></label>
            <input
              type="text"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="competitor1.com, competitor2.com"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              AI 分析中... ({streamText.length > 0 ? `${streamText.length} 字元` : '初始化'})
            </>
          ) : (
            <>
              <Search size={18} />
              開始 SEO 深度分析
            </>
          )}
        </button>
      </div>

      {/* Report */}
      {result && (
        <div id="seo-report" ref={reportRef} className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Report Header */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-xl text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold">SEO 分析報告</h2>
                <p className="text-blue-200 text-sm mt-0.5">{url || keywords} · {location}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{result.overallScore}</div>
                <div className="text-blue-200 text-xs">總體評分 / 100</div>
              </div>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Radar Chart */}
          {result.radarData && result.radarData.length > 0 && (
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                關鍵字相關性 vs 難度雷達圖
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={result.radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Radar name="相關性" dataKey="relevance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="難度" dataKey="difficulty" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Keyword Analysis */}
          <div className="border-b border-slate-100">
            <SectionHeader id="keywords" title="關鍵字深度分析" icon={Target} color="bg-blue-500" />
            {expandedSections.has('keywords') && (
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {result.keywordAnalysis.map((kw, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="font-semibold text-slate-900 text-base">{kw.keyword}</span>
                          <span
                            className="ml-2 px-2 py-0.5 text-xs rounded-full text-white font-medium"
                            style={{ backgroundColor: INTENT_COLORS[kw.intent] || '#64748b' }}
                          >
                            {INTENT_LABELS[kw.intent] || kw.intent}
                          </span>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-slate-500">月搜尋量</div>
                          <div className="font-semibold text-slate-900">{kw.volumeEstimate}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <div className="text-xs text-slate-500 mb-1">難度</div>
                          <div className="font-bold text-slate-900">{kw.difficulty}/100</div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5">
                            <div
                              className={clsx('h-1.5 rounded-full', kw.difficulty > 70 ? 'bg-red-500' : kw.difficulty > 40 ? 'bg-amber-500' : 'bg-green-500')}
                              style={{ width: `${kw.difficulty}%` }}
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <div className="text-xs text-slate-500 mb-1">CPC 估算</div>
                          <div className="font-bold text-slate-900">{kw.cpcEstimate}</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <div className="text-xs text-slate-500 mb-1">搜尋意圖</div>
                          <div className="font-bold text-slate-900" style={{ color: INTENT_COLORS[kw.intent] }}>
                            {INTENT_LABELS[kw.intent] || kw.intent}
                          </div>
                        </div>
                      </div>
                      {kw.longTailSuggestions.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1.5">長尾關鍵字建議</div>
                          <div className="flex flex-wrap gap-1.5">
                            {kw.longTailSuggestions.map((lt, j) => (
                              <span key={j} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                {lt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Keyword Clusters */}
          <div className="border-b border-slate-100">
            <SectionHeader id="clusters" title="關鍵字群組 (Pillar-Cluster 模型)" icon={TrendingUp} color="bg-purple-500" />
            {expandedSections.has('clusters') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 gap-4">
                  {result.keywordClusters.map((cluster, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{cluster.pillar}</h4>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">{cluster.contentType}</span>
                          <span
                            className="px-2 py-0.5 text-xs rounded-full text-white font-medium"
                            style={{ backgroundColor: PRIORITY_COLORS[cluster.priority] || '#64748b' }}
                          >
                            {cluster.priority === 'high' ? '高優先' : cluster.priority === 'medium' ? '中優先' : '低優先'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{cluster.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cluster.clusters.map((c, j) => (
                          <span key={j} className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Competitor Analysis */}
          <div className="border-b border-slate-100">
            <SectionHeader id="competitors" title="競爭對手分析" icon={Users} color="bg-orange-500" />
            {expandedSections.has('competitors') && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  {result.competitorAnalysis.map((comp, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{comp.name}</h4>
                          <span className="text-xs text-slate-400">{comp.url}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">{comp.daScore}</div>
                          <div className="text-xs text-slate-400">DA 評分</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-slate-500 mb-1.5">內容差距</div>
                          <ul className="space-y-1">
                            {comp.contentGaps.slice(0, 3).map((g, j) => (
                              <li key={j} className="text-xs text-slate-600 flex items-start gap-1.5">
                                <span className="text-green-500 mt-0.5">●</span>
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-500 mb-1.5">SERP 特徵</div>
                          <div className="flex flex-wrap gap-1">
                            {comp.serpFeatures.map((f, j) => (
                              <span key={j} className="px-1.5 py-0.5 bg-orange-50 text-orange-700 text-xs rounded">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="text-xs font-medium text-slate-500 mb-1">反向連結策略</div>
                        <p className="text-xs text-slate-600">{comp.backlinkStrategy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content Strategy */}
          <div className="border-b border-slate-100">
            <SectionHeader id="content" title="AI 內容策略" icon={FileText} color="bg-teal-500" />
            {expandedSections.has('content') && (
              <div className="px-6 pb-6">
                {/* Article Ideas */}
                <div className="mb-5">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">文章題目建議</h4>
                  <div className="space-y-3">
                    {result.contentStrategy.articleIdeas.map((article, i) => (
                      <div key={i} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-slate-900 text-sm">{article.title}</h5>
                          <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                            {article.targetKeyword}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {article.outline.map((point, j) => (
                            <div key={j} className="text-xs text-slate-500 flex items-center gap-2">
                              <span className="w-5 h-5 bg-slate-100 rounded text-center text-slate-600 font-medium flex-shrink-0 flex items-center justify-center text-[10px]">
                                {j + 1}
                              </span>
                              {point}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Calendar */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Calendar size={15} />
                    4 週內容日曆
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-left">
                          <th className="px-3 py-2 text-xs font-medium text-slate-500 border border-slate-200 w-12">週次</th>
                          <th className="px-3 py-2 text-xs font-medium text-slate-500 border border-slate-200">標題</th>
                          <th className="px-3 py-2 text-xs font-medium text-slate-500 border border-slate-200 w-20">類型</th>
                          <th className="px-3 py-2 text-xs font-medium text-slate-500 border border-slate-200 w-20">平台</th>
                          <th className="px-3 py-2 text-xs font-medium text-slate-500 border border-slate-200 w-24">目標關鍵字</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.contentStrategy.contentCalendar.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-2 text-center border border-slate-200">
                              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center mx-auto">
                                {item.week}
                              </span>
                            </td>
                            <td className="px-3 py-2 border border-slate-200 text-slate-800">{item.title}</td>
                            <td className="px-3 py-2 border border-slate-200">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{item.type}</span>
                            </td>
                            <td className="px-3 py-2 border border-slate-200">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">{item.platform}</span>
                            </td>
                            <td className="px-3 py-2 border border-slate-200 text-xs text-slate-600">{item.targetKeyword}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Content Gaps */}
                {result.contentStrategy.contentGaps.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">內容差距</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.contentStrategy.contentGaps.map((gap, i) => (
                        <span key={i} className="px-3 py-1.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Local SEO */}
          {result.localSEO && (
            <div className="border-b border-slate-100">
              <SectionHeader id="local" title={`本地 SEO 評分 — ${location}`} icon={MapPin} color="bg-rose-500" />
              {expandedSections.has('local') && (
                <div className="px-6 pb-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="text-5xl font-bold text-rose-600">{result.localSEO.score}</div>
                    <div>
                      <div className="text-slate-500 text-sm">本地 SEO 總分</div>
                      <div className="w-48 bg-slate-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-rose-500 h-2.5 rounded-full"
                          style={{ width: `${result.localSEO.score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart for Local SEO */}
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={result.localSEO.dimensions} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="maxScore" fill="#fecdd3" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">改善建議</h4>
                    <ul className="space-y-1.5">
                      {result.localSEO.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Report Footer */}
          <div className="p-4 bg-slate-50 rounded-b-xl text-center text-xs text-slate-400">
            由 Claude Opus 4.6 生成 · {new Date().toLocaleString('zh-HK')}
          </div>
        </div>
      )}
    </div>
  );
}
