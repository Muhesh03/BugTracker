import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
  withCredentials: true
};

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  // private apiUrl = 'http://localhost:3000';
  private apiUrl = environment.ServerApi;

  constructor(private http: HttpClient) { }
  login(data: any) {
    console.log('SERVICE DATA:', data);
    return this.http.post(`${this.apiUrl}login`, data);
  }
  // auth.service.ts
  // getProfile() {
  //   return this.http.get<any>(
  //     this.apiUrl + 'profile',
  //     { withCredentials: true }
  //   );
  // }

  // logout() {
  //   return this.http.post(
  //     this.apiUrl + 'logout',
  //     {},
  //     { withCredentials: true }
  //   );
  // }


}
