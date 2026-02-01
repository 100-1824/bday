import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
    selector: 'app-upload-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './upload-button.html',
    styleUrls: ['./upload-button.css']
})
export class UploadButtonComponent {
    @Input() uploadType: 'gallery' | 'private' = 'gallery';
    @Input() fileType: 'image' | 'video' = 'image';
    @Input() password: string = '';
    @Output() uploadComplete = new EventEmitter<void>();

    isUploading = false;
    uploadProgress = 0;
    message = '';
    messageType: 'success' | 'error' | '' = '';

    constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.uploadFile(file);
        }
    }

    uploadFile(file: File) {
        this.isUploading = true;
        this.uploadProgress = 0;
        this.message = '';
        this.messageType = '';

        // Simulate progress (since we don't have real progress tracking)
        const progressInterval = setInterval(() => {
            if (this.uploadProgress < 90) {
                this.uploadProgress += 10;
                this.cdr.detectChanges();
            }
        }, 200);

        const uploadObservable = this.uploadType === 'gallery'
            ? this.apiService.uploadToGallery(file, this.fileType)
            : this.apiService.uploadToPrivate(file, this.password, this.fileType);

        uploadObservable.subscribe({
            next: (response) => {
                clearInterval(progressInterval);
                this.uploadProgress = 100;
                this.message = response.message || 'Upload successful!';
                this.messageType = 'success';
                this.isUploading = false;
                this.cdr.detectChanges();

                // Emit completion event
                setTimeout(() => {
                    this.uploadComplete.emit();
                    this.message = '';
                    this.messageType = '';
                    this.uploadProgress = 0;
                    this.cdr.detectChanges();
                }, 2000);
            },
            error: (err) => {
                clearInterval(progressInterval);
                this.uploadProgress = 0;
                this.message = err.error?.error || 'Upload failed. Please try again.';
                this.messageType = 'error';
                this.isUploading = false;
                this.cdr.detectChanges();

                // Clear error message after 5 seconds
                setTimeout(() => {
                    this.message = '';
                    this.messageType = '';
                    this.cdr.detectChanges();
                }, 5000);
            }
        });
    }

    triggerFileInput() {
        const fileInput = document.getElementById(`file-input-${this.uploadType}-${this.fileType}`) as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }
}
