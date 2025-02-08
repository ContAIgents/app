export class ConfigManager {
  constructor(private readonly storagePrefix: string = 'app_config_') {}

  public save<T>(key: string, data: T): void {
    localStorage.setItem(this.getKey(key), JSON.stringify(data));
  }

  public load<T>(key: string): T | null {
    const data = localStorage.getItem(this.getKey(key));
    return data ? JSON.parse(data) : null;
  }

  public remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  private getKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }
}