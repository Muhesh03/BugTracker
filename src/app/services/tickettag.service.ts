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
export class  TickettagService{

  // private apiUrl = 'http://localhost:3000/';
  private apiUrl = environment.ServerApi;

  constructor(private http: HttpClient) {}



  addTicketTag(result: any): Observable<any> {
    console.log('ticket tag add service = ', result);
    return this.http.post(this.apiUrl+'tickettag/save_data', result, httpOptionsPost);
  }

  getTicketTag(): Observable<any> {
  console.log('TICKETTAG Service: GETting data from tikcettag',);
  return this.http.get<any>(
    this.apiUrl + 'tickettag/list',  httpOptionsGet );
}

  deleteTag(id: number): Observable<any> {  
    console.log('delete usergroupdelete function in service working', id);
    return this.http.post(this.apiUrl + 'tickettag/delete/' + id,httpOptionsPost);
}

  updateTicketTag(tickettag_id: number, result: any) {
  console.log('++++++++++++++++ UPDATE TICKET TAG SERVICE = ', tickettag_id, result);
return this.http.post(this.apiUrl + 'tickettag/update/' + tickettag_id,result, httpOptionsPost);
}


  


  }







