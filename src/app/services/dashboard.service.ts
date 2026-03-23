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
export class DashboardService {
  private apiUrl = environment.ServerApi;


  constructor(private http: HttpClient) { }

  getDashboard(dashboardparams: any = {}): Observable<any> {
    httpOptionsGet.params = dashboardparams;// impotant when sending as params or in form of json
    console.log("Sending request with dash params:", dashboardparams);
    return this.http.get<any>(this.apiUrl + 'dashboard/list', httpOptionsGet);
  }
}
