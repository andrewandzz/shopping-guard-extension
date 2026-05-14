import { Injectable } from '@angular/core';
import { SiteRule, SiteRuleAction } from '../models/site-rule.model';

@Injectable({
  providedIn: 'root',
})
export class SiteRulesService {
  private readonly rulesKey = 'site_rules';

  async addRule(urlPattern: string, action: SiteRuleAction): Promise<void> {
    if (!this.isChromeStorageAvailable()) {
      return;
    }

    const rules = await this.getRules();

    const newRule: SiteRule = {
      urlPattern,
      action,
      createdAt: new Date().toISOString(),
    };

    const filteredRules = rules.filter(
      (rule) => !(rule.urlPattern === urlPattern && rule.action === action),
    );

    await chrome.storage.local.set({
      [this.rulesKey]: [...filteredRules, newRule],
    });
  }

  async getRules(): Promise<SiteRule[]> {
    if (!this.isChromeStorageAvailable()) {
      return [];
    }

    const items = await chrome.storage.local.get(this.rulesKey);
    
    return items[this.rulesKey] as SiteRule[] ?? [];
  }

  private isChromeStorageAvailable(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.storage?.local;
  }
}