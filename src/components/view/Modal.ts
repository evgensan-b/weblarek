import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IModal {
  content: HTMLElement;
}

export class Modal extends Component<IModal> {
  closeButton: HTMLButtonElement;
  contentElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
    this.contentElement = ensureElement<HTMLElement>('.modal__content', this.container);

    this.closeButton.addEventListener('click', () => {
      this.events.emit('modal:close');
    });
    this.container.addEventListener('click', (event) => {
      if (event.target === this.container) {
        this.events.emit('modal:close');
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.container.classList.contains('modal_active')) {
        this.events.emit('modal:close');
      }
    });
  }

  set content(value: HTMLElement) {
    this.contentElement.replaceChildren(value);
  }

  open(): void {
    this.container.classList.add('modal_active');
  }

  close(): void {
    this.container.classList.remove('modal_active');
  }
}