import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[mosaicUpload]',
})
export class FileDropDirective {
  @Output()
  public mosaicUpload: EventEmitter<FileList> = new EventEmitter();

  @HostListener('dragover', ['$event'])
  public onDragOver(event: Event) {
    this.prevent(event);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: Event) {
    this.prevent(event);
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: DragEvent) {
    this.prevent(event);

    const files: FileList | undefined = event.dataTransfer?.files;

    if (files?.length) {
      this.mosaicUpload.emit(files);
    }
  }

  private prevent(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
