import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { RouterLink } from '@angular/router';
import { MediaItemComponent } from '../media-item/media-item';

interface MediaResponse {
  images: string[];
  videos: string[];
  nails: string[];
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaItemComponent],
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
}
