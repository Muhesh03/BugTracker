import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class TicketStatusService {

  // url = 'http://localhost:3000';
private url = environment.ServerApi;


  constructor(private http: HttpClient) { }

  getTicketStatus(): Observable<any> {
    console.log('TicketStatusService: Fetching ticket status list');
    return this.http.get<any>(`${this.url}ticketstatus/list_ticketstatus`);
  }

  saveTicketStatus(data: any): Observable<any> {
    return this.http.post(`${this.url}ticketstatus/save_ticketstatus`, data);
  }

  updateTicketStatus(data: any): Observable<any> {
    console.log('Updating Ticket Status ID with data:', data);
    return this.http.post(`${this.url}ticketstatus/update_ticketstatus`, data);
  }

  deleteTicketStatus(data: any):Observable<any> {
    return this.http.post(`${this.url}ticketstatus/delete_ticketstatus`, data);
  }
}
