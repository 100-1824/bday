import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MediaResponse {
  images: string[];
  videos: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api/media';

  constructor(private http: HttpClient) { }

  getMedia(): Observable<MediaResponse> {
    return this.http.get<MediaResponse>(this.apiUrl);
  }
}
