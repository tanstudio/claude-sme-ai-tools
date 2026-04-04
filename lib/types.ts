// SEO Analysis Types
export interface KeywordData {
  keyword: string;
  intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  difficulty: number;
  cpcEstimate: string;
  volumeEstimate: string;
  longTailSuggestions: string[];
}

export interface KeywordCluster {
  pillar: string;
  description: string;
  clusters: string[];
  contentType: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CompetitorData {
  name: string;
  url: string;
  daScore: number;
  contentGaps: string[];
  serpFeatures: string[];
  backlinkStrategy: string;
  strengths: string[];
  weaknesses: string[];
}

export interface ContentCalendarItem {
  week: number;
  title: string;
  type: string;
  targetKeyword: string;
  platform: string;
  outline: string[];
}

export interface LocalSEODimension {
  name: string;
  score: number;
  maxScore: number;
  recommendation: string;
}

export interface SEOAnalysisResult {
  summary: string;
  overallScore: number;
  keywordAnalysis: KeywordData[];
  keywordClusters: KeywordCluster[];
  competitorAnalysis: CompetitorData[];
  contentStrategy: {
    articleIdeas: Array<{ title: string; outline: string[]; targetKeyword: string }>;
    contentCalendar: ContentCalendarItem[];
    contentGaps: string[];
  };
  localSEO: {
    score: number;
    dimensions: LocalSEODimension[];
    recommendations: string[];
  } | null;
  radarData: Array<{ subject: string; relevance: number; difficulty: number }>;
}

// Website Analysis Types
export interface WebsiteAnalysisDimension {
  score: number;
  maxScore: number;
  summary: string;
  details: string[];
  recommendations: string[];
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface PESTAnalysis {
  political: string[];
  economic: string[];
  social: string[];
  technological: string[];
}

export interface UserJourneyStage {
  stage: string;
  touchpoints: string[];
  userActions: string[];
  emotions: string;
  painPoints: string[];
  opportunities: string[];
}

export interface WebsiteCompetitor {
  name: string;
  url: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
}

export interface WebsiteAnalysisResult {
  url: string;
  overallScore: number;
  industry: string;
  summary: string;
  dimensions: {
    basic: WebsiteAnalysisDimension;
    seo: WebsiteAnalysisDimension;
    content: WebsiteAnalysisDimension;
    speed: WebsiteAnalysisDimension;
    brand: WebsiteAnalysisDimension;
    ux: WebsiteAnalysisDimension;
    social: WebsiteAnalysisDimension;
    trust: WebsiteAnalysisDimension;
    cro: WebsiteAnalysisDimension;
    mobile: WebsiteAnalysisDimension;
  };
  radarData: Array<{ dimension: string; score: number; benchmark: number }>;
  contentGapData: Array<{ category: string; current: number; benchmark: number }>;
  swotAnalysis: SWOTAnalysis;
  pestAnalysis: PESTAnalysis;
  userJourney: UserJourneyStage[];
  actionPlan: Array<{ priority: 'high' | 'medium' | 'low'; action: string; impact: string; effort: string }>;
  competitors: WebsiteCompetitor[];
}

// Publishing Recommendations Types
export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'xiaohongshu' | 'wordpress';

export interface PlatformRecommendation {
  platform: SocialPlatform;
  optimalTimes: string[];
  bestDays: string[];
  caption: string;
  hashtags: string[];
  contentAdaptation: string;
  imageSpecs: string;
  predictedEngagement: 'very high' | 'high' | 'medium' | 'low';
  engagementScore: number;
  tips: string[];
}

export interface ABTestSuggestion {
  variant: string;
  description: string;
  hypothesis: string;
  expectedOutcome: string;
}

export interface PublishingRecommendationsResult {
  bestOverallStrategy: string;
  contentAnalysis: {
    type: string;
    tone: string;
    targetAudience: string;
    keyMessages: string[];
  };
  platforms: PlatformRecommendation[];
  crossPlatformStrategy: string;
  abTestSuggestions: ABTestSuggestion[];
  kpis: Array<{ metric: string; target: string; platform: string }>;
}
