import Link from 'next/link';
import { Search, Globe, Send, ArrowRight, FileText, Zap, Star } from 'lucide-react';

const tools = [
  {
    href: '/seo',
    icon: Search,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    title: 'SEO 分析工具',
    titleEn: 'SEO Analysis Tool',
    description: '深度關鍵字分析、競爭對手研究、AI 內容策略及本地 SEO 評分，並支援 PDF 報告匯出。',
    features: ['關鍵字意圖分析', 'Pillar-Cluster 模型', '競爭差距分析', '4 週內容日曆', 'PDF 報告匯出'],
    badge: '每次 3 點',
    badgeColor: 'bg-blue-100 text-blue-700',
    isNew: false,
  },
  {
    href: '/website-analysis',
    icon: Globe,
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    title: '網站分析報告',
    titleEn: 'Website Analysis Report',
    description: '21 個維度深度分析，包含 SEO、UX、CRO、SWOT、用戶旅程，全面提升網站表現，並支援 PDF 報告匯出。',
    features: ['21 維度分析', '競爭對手對比', '雷達圖視覺化', 'SWOT/PEST 分析', 'PDF 報告匯出'],
    badge: '每次 5 點 · Beta',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    isNew: false,
  },
  {
    href: '/publishing',
    icon: Send,
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50',
    textColor: 'text-violet-600',
    title: 'AI 智能發佈建議',
    titleEn: 'AI Smart Publishing',
    description: '根據內容類型和目標受眾，AI 分析最佳發佈時間、各平台文案優化策略及互動預測。',
    features: ['多平台最佳發佈時間', '平台內容自動適配', 'Hashtag 智能建議', '互動率預測', 'A/B 測試方案'],
    badge: '全新功能',
    badgeColor: 'bg-violet-100 text-violet-700',
    isNew: true,
  },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Claude SME AI Tools
        </h1>
        <p className="text-slate-500 text-lg">
          為中小企業打造的 AI 行銷工具平台 — 由 Claude Opus 4.6 驅動
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { icon: FileText, label: '分析工具', value: '3', sub: 'AI powered' },
          { icon: Zap, label: '分析維度', value: '21+', sub: '網站分析' },
          { icon: Star, label: '支援平台', value: '6', sub: '社交媒體' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Icon size={16} className="text-slate-600" />
                </div>
                <span className="text-sm text-slate-500">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Tool Cards */}
      <div className="space-y-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
            >
              <div className="p-6">
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-semibold text-slate-900">{tool.title}</h2>
                      {tool.isNew && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 rounded-full">NEW</span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{tool.titleEn}</p>
                    <p className="text-sm text-slate-600 mb-4">{tool.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {tool.features.map((feature) => (
                        <span
                          key={feature}
                          className={`px-2.5 py-1 text-xs rounded-full ${tool.lightColor} ${tool.textColor} font-medium`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 self-center">
                    <ArrowRight
                      size={20}
                      className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
