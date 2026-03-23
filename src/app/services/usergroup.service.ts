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
export class UserGroupService {

  // private apiUrl = 'http://localhost:3000/';
  private apiUrl = environment.ServerApi;
  constructor(private http: HttpClient) { }

  addUserGroup(result: any): Observable<any> {
    console.log('++++++++++++++++ service = ', result);
    return this.http.post(this.apiUrl + 'usergroup/save_data', result, httpOptionsPost);
  }

  getusergroup(): Observable<any> {
    console.log('usergroupService: GETting data from usergroup',);
    return this.http.get<any>(
      this.apiUrl + 'usergroup/list', httpOptionsGet);
  }

  deleteUsergroup(id: number): Observable<any> {
    console.log('delete usergroupdelete function in service working', id);
    return this.http.post(this.apiUrl + 'usergroup/delete/' + id, httpOptionsPost);
  }

  updateUsergroup(id: number, result: any) {
    console.log('++++++++++++++++ UPDATE USER GROUP SERVICE = ', id, result);
    return this.http.post(this.apiUrl + 'usergroup/update/' + id, result, httpOptionsPost);
  }

  savePermissions(data: any) {
    return this.http.post(
      `${this.apiUrl}usergroup/permissions/${data.usergroup_id}`, data);
  }

  getPermissions(usergroup_id: number) {
       console.log(' Calling getPermissions with ::::::::::::::::::::::', usergroup_id);
    return this.http.get(
      `${this.apiUrl}usergroup/permissions/${usergroup_id}`);
  }
}







