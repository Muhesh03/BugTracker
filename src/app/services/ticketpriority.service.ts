import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
export class  TicketpriorityService{

  // private apiUrl = 'http://localhost:3000/';
  private apiUrl = environment.ServerApi;

  constructor(private http: HttpClient) {}



  addTicketPriority(result: any): Observable<any> {
    console.log('ticket priority add service = ', result);
    return this.http.post(this.apiUrl+'ticketpriority/save_data', result, httpOptionsPost);
  }

  getTicketPriority(): Observable<any> {
  console.log('TicketprorityService: GETting data from usergroup',);
  return this.http.get<any>(
    this.apiUrl + 'ticketpriority/list',  httpOptionsGet );
}

  deleteTicketPriority(priorityid: number): Observable<any> {  
    console.log('delete usergroupdelete function in service working', priorityid);
    return this.http.post(this.apiUrl + 'ticketpriority/delete/' + priorityid,httpOptionsPost);
}

  updateTicketPriority(priorityid: number, result: any) {
  console.log('++++++++++++++++ UPDATE TICKET PRIORITY SERVICE = ', priorityid, result);
return this.http.post(this.apiUrl + 'ticketpriority/update/' + priorityid,result, httpOptionsPost);
}


  


  }







