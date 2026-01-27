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
    return this.http.get<MediaResponse>(this.mediaUrl);
  }

  getNotes(): Observable<any[]> {
    return this.http.get<any[]>(this.notesUrl);
  }

  getPrivateMedia(password: string): Observable<MediaResponse> {
    // Simple client-side check for static site
    // In a real app, this would be server-side
    if (password === '3001') {
      return this.http.get<MediaResponse>(this.privateMediaUrl);
    } else {
      return new Observable(observer => {
        observer.error({ status: 401, error: 'Unauthorized' });
      });
    }
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
}
