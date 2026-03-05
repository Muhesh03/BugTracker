import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class LiveticketNotesService {

  private apiUrl = environment.ServerApi;

  constructor(private http: HttpClient) { }

  /** ================= GET NOTES ================= */
  getNotes(liveticket_id: number): Observable<any> {
    console.log('Fetching notes for ticket ID:', liveticket_id);
    return this.http.get<any>(
      `${this.apiUrl}liveticket-note/get/${liveticket_id}`,
      httpOptionsGet
    );
  }

  /** ================= SAVE NOTE ================= */
  saveNote(payload: any): Observable<any> {
    console.log('Saving note:', payload);
    return this.http.post<any>(
      `${this.apiUrl}liveticket-note/save`,
      payload,
      httpOptionsPost
    );
  }

  /** ================= UPLOAD FILE ================= */
  uploadFile(formData: FormData): Observable<any> {
    console.log('Uploading files...');
    return this.http.post<any>(
      `${this.apiUrl}liveticket-note/upload`,
      formData,
      { withCredentials: true } // don't set JSON headers for FormData
    );
  }
}