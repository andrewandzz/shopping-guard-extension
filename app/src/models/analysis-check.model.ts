export interface AnalysisCheck {
  label: string;
  value: string;
  status?: 'positive' | 'negative' | 'neutral';
}