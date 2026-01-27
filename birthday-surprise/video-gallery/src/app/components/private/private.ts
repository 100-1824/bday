import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-private',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
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

    constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

    unlock() {
        if (!this.password) return;

        this.isLoading = true;
        this.error = '';

        this.http.post<{ success: boolean }>('/api/private/verify', { password: this.password }).subscribe({
            next: (res) => {
                if (res.success) {
                    this.isUnlocked = true;
                    this.loadMedia();
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
        this.http.post<{ images: string[], videos: string[] }>('/api/private/media', { password: this.password }).subscribe({
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
}
