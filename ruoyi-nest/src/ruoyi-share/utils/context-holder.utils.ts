// context-holder.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class ContextHolderUtils {
  private asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

  setContext(key: string, value: any) {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  getContext(key: string) {
    const store = this.asyncLocalStorage.getStore();
    return store ? store.get(key) : null;
  }
  runWithContext<T>(callback: () => T): T {
    return this.asyncLocalStorage.run(new Map(), callback);
  }
}
