import { Injectable } from '@angular/core';
import { Settings } from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly settingsKey = 'settings';

  private readonly defaultSettings: Settings = {
    showDetailsAutomatically: false,
  };

  async getSettings(): Promise<Settings> {
    if (!this.isChromeStorageAvailable()) {
      return this.defaultSettings;
    }

    const items = await chrome.storage.local.get(this.settingsKey);

    return {
      ...this.defaultSettings,
      ...(items[this.settingsKey] ?? {}),
    };
  }

  async saveSettings(settings: Settings): Promise<void> {
    if (!this.isChromeStorageAvailable()) {
      return;
    }

    await chrome.storage.local.set({
      [this.settingsKey]: settings,
    });
  }

  private isChromeStorageAvailable(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.storage?.local;
  }
}