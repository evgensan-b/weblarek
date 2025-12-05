import { IBuyer, BuyerValidationErrors } from '../../types/index.ts';

export class Buyer {
  data: IBuyer = {
    payment: '',
    email: '',
    phone: '',
    address: '',
  };

  setBuyerData(data: Partial<IBuyer>): void {
    this.data = {
      ...this.data,
      ...data,
    };
  }

  getBuyerData(): IBuyer {
    return this.data;
  }

  clearBuyerData(): void {
    this.data = {
      payment: '',
      email: '',
      phone: '',
      address: '',
    };
  }

  validBuyerData(): BuyerValidationErrors {
    const errors: BuyerValidationErrors = {};

    if (!this.data.payment) {
      errors.payment = 'Не выбран вид оплаты';
    }

    if (!this.data.email) {
      errors.email = 'Укажите емэйл';
    }

    if (!this.data.phone) {
      errors.phone = 'Укажите номер телефона';
    }

    if (!this.data.address) {
      errors.address = 'Укажите адрес доставки заказа';
    }

    return errors;
  }
}