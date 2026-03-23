//tickettype.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

export class TicketTypeService {
  constructor(private http: HttpClient) { }

  // url = "http://localhost:3000";
  private url = environment.ServerApi;
  savetickettype(data): Observable<any> {
    console.log('+++ tickettype+++++++++++++ service = ', data);
    let tickettypelink = this.url + 'tickettype/tickettype_data';

    return this.http.post(tickettypelink, data, httpOptionsPost);
  }
  gettickettype(): Observable<any> {
    let tickettypelink = this.url + 'tickettype/gettickettype_list';
    return this.http.get(tickettypelink, httpOptionsGet);
  }
  deletetickettype(data): Observable<any> {
    console.log('yyyyyyyyyyyyyyyyy', data);
    let tickettypelink = this.url + 'tickettype/delete';
    console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', data);

    return this.http.post(tickettypelink, data, httpOptionsPost);
  }
 
  updatetickettype(data: any): Observable<any> {
    console.log('UPDATE tickettype service =>', data);
    const url = this.url + 'tickettype/update';
    return this.http.post(url, data, httpOptionsPost);
  }

}