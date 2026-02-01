import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UploadButtonComponent } from '../upload-button/upload-button';

@Component({
    selector: 'app-private',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, UploadButtonComponent],
    templateUrl: './private.html',
    styleUrls: ['./private.css']
})
export class PrivateComponent {
    isUnlocked = false;
    password = '';
    error = '';
    isLoading = false;

    images: string[] = [];
    videos: string[] = [];

    // Lightbox
    lightboxOpen = false;
    lightboxImage = '';

    constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { }

    unlock() {
        if (!this.password) return;

        this.isLoading = true;
        this.error = '';

        this.apiService.verifyPrivatePassword(this.password).subscribe({
            next: (res) => {
                if (res.success) {
                    this.isUnlocked = true;
                    this.loadMedia();
                } else {
                    this.error = 'Wrong password! 🔒';
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            },
            error: () => {
                this.error = 'Wrong password! 🔒';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadMedia() {
        this.apiService.getPrivateMedia(this.password).subscribe({
            next: (data) => {
                this.images = data.images || [];
                this.videos = data.videos || [];
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
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

    lock() {
        this.isUnlocked = false;
        this.password = '';
        this.images = [];
        this.videos = [];
    }

    onUploadComplete() {
        // Refresh media list after successful upload
        this.loadMedia();
    }
}
