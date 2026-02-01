import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MediaResponse {
  images: string[];
  videos: string[];
  nails: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private mediaUrl = 'assets/data/media.json';
  private notesUrl = 'assets/data/notes.json';
  private privateMediaUrl = 'assets/data/private_media.json';

  constructor(private http: HttpClient) { }

  getMedia(): Observable<MediaResponse> {
    return this.http.get<MediaResponse>('/api/media');
  }

  getNotes(): Observable<any[]> {
    return this.http.get<any[]>('/api/notes');
  }

  getPrivateMedia(password: string): Observable<MediaResponse> {
    return this.http.post<MediaResponse>('/api/private/media', { password });
  }

  // Legacy method signature for compatibility if needed
  verifyPrivatePassword(password: string): Observable<any> {
    if (password === '3001') {
      return new Observable(observer => {
        observer.next({ success: true });
        observer.complete();
      });
    } else {
      return new Observable(observer => {
        observer.next({ success: false });
        observer.complete();
      });
    }
  }

  uploadToGallery(file: File, type: 'image' | 'video'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post('/api/upload/gallery', formData);
  }

  uploadToPrivate(file: File, password: string, type: 'image' | 'video'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    formData.append('type', type);

    return this.http.post('/api/upload/private', formData);
  }

  uploadAudio(file: Blob): Observable<any> {
    const formData = new FormData();
    // Filename is needed for Blob
    formData.append('file', file, `recording_${new Date().getTime()}.webm`);
    formData.append('type', 'audio');
    return this.http.post('/api/upload/gallery', formData);
  }

  deleteMedia(url: string): Observable<any> {
    return this.http.delete('/api/media', { body: { url } });
  }

  // Notes CRUD
  addNote(note: any): Observable<any> {
    return this.http.post('/api/notes', note);
  }

  deleteNote(id: string): Observable<any> {
    return this.http.delete(`/api/notes/${id}`);
  }

  // Inspiration (Vision/Faith) CRUD
  getVisionBoards(): Observable<any[]> {
    return this.http.get<any[]>('/api/inspiration/vision');
  }

  addVisionBoard(board: any): Observable<any> {
    return this.http.post('/api/inspiration/vision', board);
  }

  deleteVisionBoard(id: number): Observable<any> {
    return this.http.delete(`/api/inspiration/vision/${id}`);
  }

  getVerses(): Observable<any[]> {
    return this.http.get<any[]>('/api/inspiration/verses');
  }

  addVerse(verse: any): Observable<any> {
    return this.http.post('/api/inspiration/verses', verse);
  }

  deleteVerse(ref: string): Observable<any> {
    // decoding ref might be needed on server side
    return this.http.delete(`/api/inspiration/verses/${encodeURIComponent(ref)}`);
  }
}
