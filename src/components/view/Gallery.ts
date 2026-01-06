import { Component } from '../base/Component';

interface IGallery {
  catalog: HTMLElement[];
}

export class Gallery extends Component<IGallery> {
  catalogElement: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this.catalogElement = container;
  }

  set catalog(items: HTMLElement[]) {
    this.catalogElement.replaceChildren(...items);
  }
}