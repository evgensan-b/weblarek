import { IProduct } from '../../types/index.ts';

export class ProductCatalog {
  items: IProduct[] = [];
  preview: IProduct | null = null;

  setItems(items: IProduct[]): void {
    this.items = items;
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getProductById(id: string): IProduct | null {
    return this.items.find(item => item.id === id) || null;
  }

  setPreview(product: IProduct): void {
    this.preview = product;
  }

  getPreview(): IProduct | null {
    return this.preview;
  }
}