import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { RouterLink } from '@angular/router';
import { MediaItemComponent } from '../media-item/media-item';
import { UploadButtonComponent } from '../upload-button/upload-button';

interface MediaResponse {
  images: string[];
  videos: string[];
  nails: string[];
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaItemComponent, UploadButtonComponent],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css']
})
export class GalleryComponent implements OnInit {
  activeTab: 'photos' | 'videos' | 'nails' = 'photos';
  images: string[] = [];
  videos: string[] = [];
  nails: string[] = [];
  isLoading = true;
  error = '';

  // Lightbox
  lightboxOpen = false;
  lightboxImage = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    console.log('GalleryComponent ngOnInit - fetching media with ApiService...');
    this.apiService.getMedia().subscribe({
      next: (data) => {
        console.log('Gallery API response:', data);
        this.images = data.images || [];
        this.videos = data.videos || [];
        this.nails = data.nails || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load media', err);
        this.error = 'Failed to load media: ' + err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: 'photos' | 'videos' | 'nails') {
    this.activeTab = tab;
  }

  openLightbox(img: string) {
    this.lightboxImage = img;
    this.lightboxOpen = true;
    this.cdr.detectChanges();
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.lightboxImage = '';
    this.cdr.detectChanges();
  }

  onUploadComplete() {
    // Refresh media list after successful upload
    this.isLoading = true;
    this.apiService.getMedia().subscribe({
      next: (data) => {
        this.images = data.images || [];
        this.videos = data.videos || [];
        this.nails = data.nails || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to refresh media', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteItem(url: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) {
      return;
    }

    this.apiService.deleteMedia(url).subscribe({
      next: () => {
        // Remove from local arrays
        this.images = this.images.filter(i => i !== url);
        this.videos = this.videos.filter(v => v !== url);
        this.nails = this.nails.filter(n => n !== url);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete media', err);
        alert('Failed to delete item: ' + (err.error?.error || err.message));
      }
    });
  }
}
