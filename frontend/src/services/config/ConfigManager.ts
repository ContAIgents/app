export class ConfigManager {
  private readonly storagePrefix: string;
  private readonly apiUrl: string;

  constructor(storagePrefix: string = 'app_config_', apiUrl: string = 'http://localhost:2668') {
    this.storagePrefix = storagePrefix;
    this.apiUrl = apiUrl;
  }

  public async save<T>(key: string, data: T): Promise<void> {
    // Save to localStorage
    localStorage.setItem(this.getKey(key), JSON.stringify(data));
    
    // Sync with CLI server asynchronously
    this.syncWithCLI(key, data).catch(error => {
      console.error(`Failed to sync ${key} with CLI:`, error);
    });
  }

  public load<T>(key: string): T | null {
    const data = localStorage.getItem(this.getKey(key));
    return data ? JSON.parse(data) : null;
  }

  public remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
    
    // Remove from CLI server asynchronously
    this.deleteFromCLI(key).catch(error => {
      console.error(`Failed to delete ${key} from CLI:`, error);
    });
  }

  private getKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }

  private getConfigPath(key: string): string {
    // Convert storage prefix and key to a valid filename
    // Remove any special characters and replace spaces with underscores
    const sanitizedPrefix = this.storagePrefix.replace(/[^a-zA-Z0-9_]/g, '_');
    const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
    return `${sanitizedPrefix}${sanitizedKey}.json`;
  }

  private async syncWithCLI<T>(key: string, data: T): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/files/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `.config/${this.getConfigPath(key)}`,
          content: JSON.stringify(data, null, 2),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      // Log error but don't throw - we want the local save to succeed even if sync fails
      console.error('CLI sync failed:', error);
      
      // Optionally, queue for retry later
      this.queueForRetry(key, data);
    }
  }

  private async deleteFromCLI(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/files/${encodeURIComponent(`.config/${this.getConfigPath(key)}`)}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('CLI delete failed:', error);
    }
  }

  private queueForRetry<T>(key: string, data: T): void {
    const retryQueue = JSON.parse(localStorage.getItem('config_retry_queue') || '[]');
    retryQueue.push({
      key,
      data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('config_retry_queue', JSON.stringify(retryQueue));
  }

  public async processPendingSync(): Promise<void> {
    const retryQueue = JSON.parse(localStorage.getItem('config_retry_queue') || '[]');
    if (retryQueue.length === 0) return;

    const newQueue = [];
    for (const item of retryQueue) {
      try {
        await this.syncWithCLI(item.key, item.data);
      } catch (error) {
        // If still failing, keep in queue if less than 24 hours old
        const itemAge = new Date().getTime() - new Date(item.timestamp).getTime();
        if (itemAge < 24 * 60 * 60 * 1000) {
          newQueue.push(item);
        }
      }
    }

    localStorage.setItem('config_retry_queue', JSON.stringify(newQueue));
  }
}
