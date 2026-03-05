import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
const httpOptionsPost = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true
};

const httpOptionsGet = {
  params: {},
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true
};

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private apiUrl = environment.ServerApi;
  constructor(private http: HttpClient) { }

  upload(file: File, userId: number | undefined) {
    console.log('Uploading file:', file.name, 'for user ID:', userId);

  if (!userId) {
    console.error('Upload aborted: userId is undefined');
    return throwError(() => new Error('User ID missing'));
  }
    const formData = new FormData();
    formData.append('file', file);
    // formData.append('user_id', userId.toString());
    formData.append('user_id', String(userId));
    console.log('formData iiiiiiiiiiiiiii', formData);
    console.log('UPLOAD URL:', this.apiUrl + 'attachment/upload');   //UPLOAD URL: http://localhost:3000/attachment/upload

    return this.http.post(this.apiUrl + 'attachment/upload', formData);
  }

  list(userId: number) {
    console.log("attachment---------------------attachment", userId)
    return this.http.get<any[]>(this.apiUrl + 'attachment/list/' + userId);
  }

  download(id: number) {
    console.log("download ++++++attachment ++++++", id)
    return this.http.get(this.apiUrl + 'attachment/download/' + id, {
      responseType: 'blob'
    });
  }
}
