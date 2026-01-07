import { IProduct } from '../../types/index.ts';
import { IEvents } from '../base/Events.ts';9

export class Basket {
  items: IProduct[] = [];

  constructor(protected events: IEvents) {};

  getItems(): IProduct[] {
    return this.items;
  }

  addItem(product: IProduct): void {
    this.items.push(product);
    this.events.emit('basket:changed', this.items);
  }

  removeItem(productId: string): void {
    this.items = this.items.filter(item => item.id !== productId);
    this.events.emit('basket:changed', this.items);
  }

  clear(): void {
    this.items = [];
    this.events.emit('basket:changed', this.items);
  }

  getTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }

  getCount(): number {
    return this.items.length;
  }

  hasProduct(id: string): boolean {
    return this.items.some(item => item.id === id);
  }
}