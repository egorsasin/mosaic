import { Directive, Input } from '@angular/core';

export interface Page {
  number: number;
  text: string;
  active: boolean;
}

@Directive({
  selector: '[mosPagination]',
  exportAs: 'mosPagination',
  standalone: true,
})
export class PaginationDirective {
  @Input() public size?: number;
  @Input() public pageSize?: number;
  @Input() public length?: number;
  @Input() public pageIndex: number = 0;
  @Input() public rotate: boolean = true;

  public pages: Page[] = [];

  constructor() {}

  private updatePages(): void {
    this.pages = this.getPages();
  }

  private getPages(): Page[] {
    const pages: Page[] = [];
    const { startPage, endPage, totalPages, isMaxSized } =
      this.computePageLimits();

    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
      pages.push({
        number: pageNumber,
        text: pageNumber.toString(),
        active: pageNumber === this.pageIndex + 1,
      });
    }

    return pages;
  }

  private computePageLimits() {
    const { pageSize, size, rotate, pageIndex } = this;
    const totalPages = pageSize ? Math.ceil(length / pageSize) : 0;

    let startPage = 1;
    let endPage = totalPages;

    const isMaxSized = this.size ? this.size < totalPages : false;

    if (isMaxSized && size) {
      if (rotate) {
        startPage = Math.max(pageIndex - Math.floor(size / 2), 1);
        endPage = startPage + size - 1;

        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = endPage - size + 1;
        }
      } else {
        startPage = (Math.ceil(pageIndex / size) - 1) * size + 1;
        endPage = Math.min(startPage + size - 1, totalPages);
      }
    }

    return {
      startPage,
      endPage,
      totalPages,
      isMaxSized,
    };
  }
}
