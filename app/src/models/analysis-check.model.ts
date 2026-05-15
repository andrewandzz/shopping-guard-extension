export type AnalysisCheckId =
  | 'return_policy'
  | 'warranty'
  | 'contacts'
  | 'legal_info'
  | 'aggressive_marketing'
  | 'name_and_phone_only_form'
  | 'domain_zone';

export type AnalysisCheckStatus =
  | 'passed'
  | 'failed';

export interface AnalysisCheck {
  id: AnalysisCheckId,
  status: AnalysisCheckStatus;
  riskScore?: number;
}