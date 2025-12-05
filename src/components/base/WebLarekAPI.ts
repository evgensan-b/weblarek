import { IApi, IProduct, IOrderData, IOrderResponse, IProductListResponse } from '../../types/index.ts';

export class WebLarekAPI {
  api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  getProductList(): Promise<IProduct[]> {
    return this.api.get<IProductListResponse>('/product/').then(data => data.items)
  }

  orderProducts(orderData: IOrderData): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('/order/', orderData);
  }
}