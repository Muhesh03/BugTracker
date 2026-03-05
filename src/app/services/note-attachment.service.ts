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
export class NoteAttachmentService {
  private apiUrl = environment.ServerApi;
  constructor(private http: HttpClient) { }

  getNoteTicket(issueticket_id: number): Observable<any> {
    console.log('Fetching notes for ticket ID:', issueticket_id);
    return this.http.get(`${this.apiUrl}note/${issueticket_id}`);
  }


  addNoteTicket(payload: any): Observable<any> {
    console.log('Adding note with payload:', payload);
    return this.http.post(`${this.apiUrl}note/save`, payload);
  }

  // updateNoteTicket(history_id: number, payload: any): Observable<any> {
  //   console.log('Updating note with history ID:', history_id, payload);
  //   return this.http.put(`${this.apiUrl}/${history_id}`, payload);
  // }

  uploadImage(formData: FormData): Observable<any> {

    console.log('Uploading image...');
    return this.http.post(`${this.apiUrl}note/upload`, formData);
  }

  // getActivities(ticketId: number) {
  //   console.log('Fetching activities for ticket ID++++++++++++++++++++>>>>>>>>>>>>><<<<<<<<<<<<<<+++++++++++++++++++++:', ticketId);
  //   return this.http.get(
  //     `${this.apiUrl}tickethistory/${ticketId}`
  //   );
  // }

}
