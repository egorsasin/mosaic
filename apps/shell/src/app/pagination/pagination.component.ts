import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Maybe } from '../types';

@Component({
  imports: [CommonModule],
  standalone: true,
  selector: 'mos-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnChanges {
  @Input() public length: Maybe<number> = 0;
  @Input() public pageSize: number = 12;
  @Input() public pageIndex: Maybe<number> = 0;

  @Output() public onPageChange: EventEmitter<number> =
    new EventEmitter<number>();

  public pages?: number[];
  private rotate: boolean = true;
  private size: number = 7;

  public ngOnChanges(changes: SimpleChanges): void {
    this.updatePages();
  }

  public setPage(page: number) {
    this.pageIndex = page - 1;
    this.onPageChange.emit(this.pageIndex);
  }

  public hasPreviousPage(): boolean {
    return this.pageIndex! >= 1 && this.pageSize != 0;
  }

  public hasNextPage(): boolean {
    const { pageIndex = 0, pageSize } = this;
    const maxPageIndex = this.getNumberOfPages() - 1;
    return pageIndex! < maxPageIndex && pageSize != 0;
  }

  private getNumberOfPages(): number {
    return this.pageSize && this.length
      ? Math.ceil(this.length / this.pageSize)
      : 0;
  }

  private updatePages(): void {
    this.pages = this.length ? this.getPages() : [];
  }

  private getPages(): number[] {
    const pages: number[] = [];
    const { startPage, endPage, totalPages, isMaxSized } =
      this.computePageLimits();

    const currentPage = this.pageIndex! + 1;

    const middlePosition = Math.ceil(this.size / 2);
    const middleIndex = middlePosition - 1;

    let outOfRange = false;
    let rightEllipsisOffset = 0;
    let leftEllipsisOffset = 1;

    if (currentPage - 2 > middlePosition) {
      rightEllipsisOffset = middleIndex;
      leftEllipsisOffset =
        middlePosition - (this.hasNextPage() ? totalPages - currentPage : 1);
    } else if (currentPage < middlePosition) {
      rightEllipsisOffset = this.hasPreviousPage()
        ? middlePosition - this.pageIndex!
        : middleIndex;
      leftEllipsisOffset = this.hasPreviousPage()
        ? leftEllipsisOffset
        : middleIndex;
    } else if (currentPage < totalPages - 1) {
      rightEllipsisOffset = 1;
    }

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      if (
        !isMaxSized ||
        pageNumber <= leftEllipsisOffset ||
        pageNumber > totalPages - rightEllipsisOffset ||
        Math.abs(pageNumber - currentPage) <= 1
      ) {
        outOfRange = false;
        pages.push(pageNumber);
      } else {
        if (!outOfRange) {
          pages.push(0);
        }
        outOfRange = true;
      }
    }

    return pages;
  }

  private computePageLimits() {
    const { pageSize, size, rotate, pageIndex, length } = this;
    const totalPages = pageSize && length ? Math.ceil(length / pageSize) : 0;

    let startPage = 1;
    let endPage = totalPages;

    const isMaxSized = this.size ? this.size < totalPages : false;

    if (isMaxSized && size) {
      if (rotate) {
        startPage = Math.max(pageIndex! - Math.floor(size / 2), 1);
        endPage = startPage + size - 1;

        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = endPage - size + 1;
        }
      } else {
        startPage = (Math.ceil(pageIndex! / size) - 1) * size + 1;
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
