import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-media-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-item.html',
  styleUrls: ['./media-item.css']
})
export class MediaItemComponent {
  @Input() videoUrl: string = '';
  @Output() delete = new EventEmitter<void>();
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  isPlaying = false;
  isHovered = false;

  onMouseEnter() {
    this.isHovered = true;
    this.videoPlayer.nativeElement.play().catch(e => console.log('Autoplay prevented', e));
    this.videoPlayer.nativeElement.muted = false; // Unmute on hover if desired, or keep muted
    this.isPlaying = true;
  }

  onMouseLeave() {
    this.isHovered = false;
    this.videoPlayer.nativeElement.pause();
    this.videoPlayer.nativeElement.currentTime = 0; // Reset
    this.isPlaying = false;
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit();
  }
}
