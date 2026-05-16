export type SiteRuleAction = 'mark_as_safe' | 'ignore';

export interface SiteRule {
  domain: string;
  action: SiteRuleAction;
  createdAt: string;
}