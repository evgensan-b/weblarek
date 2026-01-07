import { IProduct } from '../../types/index.ts';
import { IEvents } from '../base/Events.ts';

export class ProductCatalog {
  items: IProduct[] = [];
  preview: IProduct | null = null;

  constructor(protected events: IEvents) {}

  setItems(items: IProduct[]): void {
    this.items = items;
    this.events.emit('catalog:changed', this.items);
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getProductById(id: string): IProduct | null {
    return this.items.find(item => item.id === id) || null;
  }

  setPreview(product: IProduct): void {
    this.preview = product;
    this.events.emit('product:selected', product);
  }

  getPreview(): IProduct | null {
    return this.preview;
  }
}