'use client';

import { useState, useRef } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Globe, Download, Loader2, AlertCircle, CheckCircle,
  TrendingUp, AlertTriangle, Zap, ChevronDown, ChevronUp, Users, Target
} from 'lucide-react';
import clsx from 'clsx';
import type { WebsiteAnalysisResult } from '@/lib/types';

const DIMENSION_LABELS: Record<string, string> = {
  basic: '基礎技術',
  seo: 'SEO 優化',
  content: '內容品質',
  speed: '載入速度',
  brand: '品牌定位',
  ux: '用戶體驗',
  social: '社交媒體',
  trust: '信任度',
  cro: '轉化優化',
  mobile: '移動優化',
};

const DIMENSION_COLORS: Record<string, string> = {
  basic: '#3b82f6',
  seo: '#10b981',
  content: '#8b5cf6',
  speed: '#f59e0b',
  brand: '#ec4899',
  ux: '#06b6d4',
  social: '#f97316',
  trust: '#6366f1',
  cro: '#14b8a6',
  mobile: '#84cc16',
};

const PRIORITY_CONFIG = {
  high: { label: '高優先', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  medium: { label: '中優先', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  low: { label: '低優先', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

const EFFORT_LABELS: Record<string, string> = {
  low: '低', medium: '中', high: '高',
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-bold w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

export default function WebsiteAnalysisPage() {
  const [url, setUrl] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WebsiteAnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [streamText, setStreamText] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['dimensions', 'radar', 'swot', 'actionplan'])
  );
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
    if (!url) {
      setError('請提供網站 URL');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setStreamText('');

    try {
      const res = await fetch('/api/website-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, competitors }),
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

      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('無法解析回應，請重試');

      const parsed = JSON.parse(jsonMatch[0]) as WebsiteAnalysisResult;
      if ((parsed as { error?: string }).error) throw new Error((parsed as { error?: string }).error);

      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const { exportToPDF } = await import('@/lib/pdf-export');
      await exportToPDF('website-report', `網站分析報告_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch {
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
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Globe size={20} className="text-white" />
            </div>
            網站分析報告
          </h1>
          <p className="text-slate-500 mt-1">21 維度深度分析 · SWOT · 用戶旅程 · 競爭對比</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-medium">
            每次 5 點 · Beta
          </span>
          {result && (
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium no-print"
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
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">網站 URL <span className="text-red-500">*</span></label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">競爭對手 <span className="text-slate-400">(最多 3 個，逗號分隔)</span></label>
            <input
              type="text"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="competitor1.com, competitor2.com"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
          className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              深度分析中... ({streamText.length > 0 ? `${streamText.length} 字元` : '初始化'})
            </>
          ) : (
            <>
              <Globe size={18} />
              開始網站深度分析
            </>
          )}
        </button>
      </div>

      {/* Report */}
      {result && (
        <div id="website-report" ref={reportRef} className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Report Header */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-t-xl text-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold">網站分析報告</h2>
                <p className="text-emerald-200 text-sm mt-0.5">{result.url}</p>
                <p className="text-emerald-300 text-xs mt-1">行業：{result.industry}</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">{result.overallScore}</div>
                <div className="text-emerald-200 text-xs">總體評分 / 100</div>
                <div className={clsx(
                  'mt-1 text-xs px-2 py-0.5 rounded-full inline-block',
                  result.overallScore >= 80 ? 'bg-green-400/30 text-green-100' :
                  result.overallScore >= 60 ? 'bg-amber-400/30 text-amber-100' :
                  'bg-red-400/30 text-red-100'
                )}>
                  {result.overallScore >= 80 ? '優秀' : result.overallScore >= 60 ? '良好' : '需改善'}
                </div>
              </div>
            </div>
            <p className="text-emerald-100 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* 10-Dimension Overview */}
          <div className="border-b border-slate-100">
            <SectionHeader id="dimensions" title="10 維度評分概覽" icon={TrendingUp} color="bg-emerald-500" />
            {expandedSections.has('dimensions') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.dimensions).map(([key, dim]) => (
                    <div key={key} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          {DIMENSION_LABELS[key] || key}
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: DIMENSION_COLORS[key] || '#64748b' }}
                        >
                          {dim.score}/100
                        </span>
                      </div>
                      <ScoreBar score={dim.score} color={DIMENSION_COLORS[key] || '#64748b'} />
                      <p className="text-xs text-slate-500 mt-2">{dim.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Radar Chart */}
          <div className="border-b border-slate-100">
            <SectionHeader id="radar" title="10 維度雷達圖 vs 行業基準" icon={Target} color="bg-blue-500" />
            {expandedSections.has('radar') && (
              <div className="px-6 pb-6">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={result.radarData} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Radar name="您的網站" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                    <Radar name="行業基準" dataKey="benchmark" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} strokeDasharray="5 5" />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Content Gap Analysis */}
          <div className="border-b border-slate-100">
            <SectionHeader id="contentgap" title="內容差距分析" icon={Zap} color="bg-purple-500" />
            {expandedSections.has('contentgap') && (
              <div className="px-6 pb-6">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.contentGapData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar name="當前水平" dataKey="current" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar name="行業基準" dataKey="benchmark" fill="#ddd6fe" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* SWOT Analysis */}
          <div className="border-b border-slate-100">
            <SectionHeader id="swot" title="SWOT 分析" icon={AlertTriangle} color="bg-amber-500" />
            {expandedSections.has('swot') && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'strengths', label: '優勢 Strengths', color: 'bg-green-50 border-green-200', textColor: 'text-green-700', dotColor: 'bg-green-500' },
                    { key: 'weaknesses', label: '劣勢 Weaknesses', color: 'bg-red-50 border-red-200', textColor: 'text-red-700', dotColor: 'bg-red-500' },
                    { key: 'opportunities', label: '機遇 Opportunities', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', dotColor: 'bg-blue-500' },
                    { key: 'threats', label: '威脅 Threats', color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', dotColor: 'bg-amber-500' },
                  ].map(({ key, label, color, textColor, dotColor }) => (
                    <div key={key} className={`border rounded-xl p-4 ${color}`}>
                      <h4 className={`font-semibold text-sm mb-2 ${textColor}`}>{label}</h4>
                      <ul className="space-y-1.5">
                        {(result.swotAnalysis[key as keyof typeof result.swotAnalysis] || []).map((item, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className={`w-1.5 h-1.5 ${dotColor} rounded-full mt-1.5 flex-shrink-0`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Journey */}
          <div className="border-b border-slate-100">
            <SectionHeader id="journey" title="用戶旅程地圖" icon={Users} color="bg-cyan-500" />
            {expandedSections.has('journey') && (
              <div className="px-6 pb-6">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {result.userJourney.map((stage, i) => (
                    <div
                      key={i}
                      className="min-w-[180px] border border-slate-200 rounded-xl p-3 flex-1"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-cyan-500 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-xs font-semibold text-slate-800 leading-tight">{stage.stage}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs font-medium text-slate-500 mb-0.5">觸點</div>
                          {stage.touchpoints.slice(0, 2).map((t, j) => (
                            <div key={j} className="text-xs text-slate-600">• {t}</div>
                          ))}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-500 mb-0.5">痛點</div>
                          {stage.painPoints.slice(0, 2).map((p, j) => (
                            <div key={j} className="text-xs text-red-600">• {p}</div>
                          ))}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-500 mb-0.5">機會</div>
                          {stage.opportunities.slice(0, 2).map((o, j) => (
                            <div key={j} className="text-xs text-green-600">• {o}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Competitor Comparison */}
          {result.competitors && result.competitors.length > 0 && (
            <div className="border-b border-slate-100">
              <SectionHeader id="competitors" title="競爭對手對比" icon={Users} color="bg-orange-500" />
              {expandedSections.has('competitors') && (
                <div className="px-6 pb-6">
                  <div className="space-y-4">
                    {/* Score comparison */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">網站</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">總分</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">優勢</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">劣勢</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="bg-emerald-50">
                            <td className="px-4 py-2.5 font-medium text-emerald-800 text-xs">{result.url} <span className="text-emerald-500">(您)</span></td>
                            <td className="px-4 py-2.5 font-bold text-emerald-700">{result.overallScore}</td>
                            <td className="px-4 py-2.5 text-xs text-slate-600">-</td>
                            <td className="px-4 py-2.5 text-xs text-slate-600">-</td>
                          </tr>
                          {result.competitors.map((comp, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2.5 text-xs text-slate-700">{comp.name}</td>
                              <td className="px-4 py-2.5 font-bold text-slate-700">{comp.overallScore}</td>
                              <td className="px-4 py-2.5 text-xs text-slate-600">{comp.strengths.slice(0, 2).join('、')}</td>
                              <td className="px-4 py-2.5 text-xs text-slate-600">{comp.weaknesses.slice(0, 1).join('、')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dimension Details */}
          <div className="border-b border-slate-100">
            <SectionHeader id="dimdetails" title="各維度詳細建議" icon={CheckCircle} color="bg-indigo-500" />
            {expandedSections.has('dimdetails') && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  {Object.entries(result.dimensions).map(([key, dim]) => (
                    <div key={key} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900">
                          {DIMENSION_LABELS[key] || key}
                        </h4>
                        <div className="flex items-center gap-2">
                          <ScoreBar score={dim.score} color={DIMENSION_COLORS[key] || '#64748b'} />
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{dim.summary}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs font-medium text-slate-500 mb-1">現況</div>
                          <ul className="space-y-1">
                            {dim.details.map((d, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                <span className="text-slate-400 mt-0.5">•</span>
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-500 mb-1">改善建議</div>
                          <ul className="space-y-1">
                            {dim.recommendations.map((r, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                <CheckCircle size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Plan */}
          <div className="border-b border-slate-100">
            <SectionHeader id="actionplan" title="行動計劃" icon={CheckCircle} color="bg-green-500" />
            {expandedSections.has('actionplan') && (
              <div className="px-6 pb-6">
                <div className="space-y-2">
                  {result.actionPlan.map((item, i) => {
                    const config = PRIORITY_CONFIG[item.priority];
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                        <div className={`w-5 h-5 rounded-full ${config.dot} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <span className="text-white text-xs font-bold">{i + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900">{item.action}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.impact}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                            難度：{EFFORT_LABELS[item.effort] || item.effort}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Report Footer */}
          <div className="p-4 bg-slate-50 rounded-b-xl text-center text-xs text-slate-400">
            由 Claude Opus 4.6 生成 · Beta 版本 · {new Date().toLocaleString('zh-HK')}
          </div>
        </div>
      )}
    </div>
  );
}
