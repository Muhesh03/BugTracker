import { Component, Inject, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-image-preview-dialog',
  templateUrl: './image-preview-dialog.component.html',
  styleUrls: ['./image-preview-dialog.component.css'],
})
export class ShowImageDialogComponent implements AfterViewInit {

  images: string[] = [];
  environment = environment;

  // Zoom — start at 100%
  zoomLevel: number = 100;
  zoomFactor: number = 1;

  // Base size matches container width
  baseWidth: number = 0;
  baseHeight: number = 0;

  // Drag
  isDragging: boolean = false;
  hasDragged: boolean = false;
  dragStartX: number = 0;
  dragStartY: number = 0;
  scrollStartX: number = 0;
  scrollStartY: number = 0;
  currentContainer: HTMLElement | null = null;

  constructor(
    private dialogRef: MatDialogRef<ShowImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[],
    private el: ElementRef
  ) {
    this.images = data;
  }

  ngAfterViewInit() {
    // Set base size from container after view loads
    setTimeout(() => {
      const container = this.el.nativeElement.querySelector('.image-scroll-container');
      if (container) {
        this.baseWidth = container.clientWidth;
        this.baseHeight = container.clientHeight;
      }
    }, 100);
  }

  get imageWidth(): number {
    return this.baseWidth * this.zoomFactor;
  }

  get imageHeight(): number {
    return this.baseHeight * this.zoomFactor;
  }

  onClose() {
    this.dialogRef.close();
  }

  zoomIn() {
    if (this.zoomLevel < 300) {
      this.zoomLevel += 25;
      this.zoomFactor = this.zoomLevel / 100;
    }
  }

  zoomOut() {
    if (this.zoomLevel > 100) {
      this.zoomLevel -= 25;
      this.zoomFactor = this.zoomLevel / 100;
    }
  }

  resetZoom() {
    this.zoomLevel = 100;
    this.zoomFactor = 1;
  }

  onImageClick(event: MouseEvent) {
    if (this.hasDragged) {
      this.hasDragged = false;
      return;
    }

    const img = event.target as HTMLImageElement;
    const container = img.closest('.image-scroll-container') as HTMLElement;
    const rect = img.getBoundingClientRect();

    const ratioX = (event.clientX - rect.left) / rect.width;
    const ratioY = (event.clientY - rect.top) / rect.height;

    if (this.zoomLevel < 300) {
      this.zoomLevel += 50;
      this.zoomFactor = this.zoomLevel / 100;
    }

    setTimeout(() => {
      const newClickX = ratioX * this.imageWidth;
      const newClickY = ratioY * this.imageHeight;
      container.scrollLeft = newClickX - container.clientWidth / 2;
      container.scrollTop = newClickY - container.clientHeight / 2;
    }, 50);
  }
onMouseDown(event: MouseEvent) {
  // removed zoomFactor check — drag works at any zoom level
  this.isDragging = true;
  this.hasDragged = false;
  this.dragStartX = event.clientX;
  this.dragStartY = event.clientY;
  this.currentContainer = (event.target as HTMLElement)
    .closest('.image-scroll-container') as HTMLElement;
  if (this.currentContainer) {
    this.scrollStartX = this.currentContainer.scrollLeft;
    this.scrollStartY = this.currentContainer.scrollTop;
  }
  event.preventDefault();
}

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging || !this.currentContainer) return;
    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      this.hasDragged = true;
    }
    this.currentContainer.scrollLeft = this.scrollStartX - dx;
    this.currentContainer.scrollTop = this.scrollStartY - dy;
    event.preventDefault();
  }

  onMouseUp() {
    this.isDragging = false;
    this.currentContainer = null;
  }
}