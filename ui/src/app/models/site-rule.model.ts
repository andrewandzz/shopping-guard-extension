export type SiteRuleAction = 'mark_as_safe' | 'ignore';

export interface SiteRule {
  urlPattern: string;
  action: SiteRuleAction;
  createdAt: string;
}