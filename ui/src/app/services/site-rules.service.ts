import { Injectable } from '@angular/core';
import { SiteRule, SiteRuleAction } from '../models/site-rule.model';

@Injectable({
  providedIn: 'root',
})
export class SiteRulesService {
  private readonly rulesKey = 'site_rules';

  async ignoreSite(domain: string): Promise<void> {
    await this.addRule(domain, 'ignore');
    console.log(await this.getRules());
  }

  async unignoreSite(domain: string): Promise<void> {
    await this.removeRule(domain, 'ignore');
    console.log(await this.getRules());
  }

  async isSiteIgnored(domain: string): Promise<boolean> {
    return await this.ruleExists(domain, 'ignore');
  }

  async markSiteAsSafe(domain: string): Promise<void> {
    await this.addRule(domain, 'mark_as_safe');
    console.log(await this.getRules());
  }

  async unmarkSiteAsSafe(domain: string): Promise<void> {
    await this.removeRule(domain, 'mark_as_safe');
    console.log(await this.getRules());
  }

  async isSiteMarkedAsSafe(domain: string): Promise<boolean> {
    return await this.ruleExists(domain, 'mark_as_safe');
  }

  private async addRule(domain: string, action: SiteRuleAction): Promise<void> {
    if (!this.isChromeStorageAvailable()) {
      return;
    }

    if (await this.ruleExists(domain, action)) {
      return;
    }

    const rules = await this.getRules();

    const newRule: SiteRule = {
      domain,
      action,
      createdAt: new Date().toISOString(),
    };

    await chrome.storage.local.set({
      [this.rulesKey]: [...rules, newRule],
    });
  }

  private async getRules(): Promise<SiteRule[]> {
    if (!this.isChromeStorageAvailable()) {
      return [];
    }

    const items = await chrome.storage.local.get(this.rulesKey);

    return items[this.rulesKey] as SiteRule[] ?? [];
  }

  private async getRule(domain: string, action: SiteRuleAction): Promise<SiteRule | null> {
    const rules = await this.getRules();
    return rules.find(rule => rule.domain === domain && rule.action === action) ?? null;
  }

  private async removeRule(domain: string, action: SiteRuleAction): Promise<void> {
    if (!this.isChromeStorageAvailable()) {
      return;
    }

    if (!(await this.ruleExists(domain, action))) {
      return;
    }

    const rules = await this.getRules();

    const filteredRules = rules.filter(
      (rule) => !(rule.domain === domain && rule.action === action),
    );

    await chrome.storage.local.set({
      [this.rulesKey]: filteredRules,
    });
  }

  private isChromeStorageAvailable(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.storage?.local;
  }

  private async ruleExists(domain: string, action: SiteRuleAction) {
    return (await this.getRule(domain, action)) !== null;
  }
}