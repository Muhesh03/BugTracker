import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

export class UserService {
  constructor(private http: HttpClient) { }

  // url = "http://localhost:3000";
  private url = environment.ServerApi;
  saveuser(data): Observable<any> {
    console.log('+++ user+++++++++++++ service = ', data);
    let userlink = this.url + 'user/user_data';

    return this.http.post(userlink, data, httpOptionsPost);
  }
  getuser(): Observable<any> {
    let userlink = this.url + 'user/get_list';
    return this.http.get(userlink, httpOptionsGet);
  }
  deleteuser(data): Observable<any> {
    console.log('yyyyyyyyyyyyyyyyyyyyy', data);
    let link = this.url + 'user/delete';
    console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', data);

    return this.http.post(link, data, httpOptionsPost);
  }
  updateuser(data: any): Observable<any> {
    return this.http.post(`${this.url}user/update`, data);
  }
  getusergroup(): Observable<any> {
    console.log('getusergroup service called');
    let userlink = this.url + 'usergroup/list';
    console.log('URL:', userlink);
    return this.http.get(userlink, httpOptionsGet);
  }


  getUsersGroupedByGroup() {
    return this.getuser().pipe(
      map(res => {

        //  handle both array & {data: []}
        const users = Array.isArray(res) ? res : res.data || [];

        const grouped: { [key: string]: any[] } = {};

        users.forEach((u: any) => {

          //  normalize group name (VERY IMPORTANT)
          const groupName = u.usergroupname ||[];

          if (!groupName) return;

          if (!grouped[groupName]) {
            grouped[groupName] = [];
          }

          grouped[groupName].push({
            user_id: u.user_id,
            fullname: u.fullname,
            selected: false
          });
        });

        //  convert object → array for *ngFor
        return Object.keys(grouped).map(group => ({
          usergroup: group,
          users: grouped[group]
        }));
      })
    );
  }




  getLastProject(userId: number) { 
    console.log("wwwwwwwwwwwwwEEEEEE",userId);
    return this.http.get(`${this.url}user/last-project/${userId}`);
   
  }

  updateLastProject(userId: number, projectId: number) {
     console.log("wwwwwwwwwwwwwEEEEEE",userId,projectId);
    return this.http.post(`${this.url}user/last-project`, {
      userId,
      projectId
    });
  }


  // getAssignedProjects(userId: number): Observable<any> {
  //   return this.http.get(`${this.url}/projects/assigned/${userId}`);
  // }

  // // 🔹 get last selected project
  // getLastProject(userId: number): Observable<any> {
  //   return this.http.get(`${this.API}/user/last-project/${userId}`);
  // }

  // // 🔹 update last selected project
  // updateLastProject(userId: number, projectId: number): Observable<any> {
  //   return this.http.post(`${this.API}/user/last-project`, {
  //     userId,
  //     projectId
  //   });
  // }
  // getUsersGroupedByGroup() {
  //   return this.getuser().pipe(
  //     map(res => {
  //       const users = Array.isArray(res) ? res : res.data || [];

  //       const grouped: any = {};

  //       users.forEach((u: any) => {
  //         if (u.status !== 'Active') return;

  //         if (!grouped[u.usergroup]) {
  //           grouped[u.usergroup] = [];
  //         }

  //         grouped[u.usergroup].push({
  //           user_id: u.user_id,   // IMPORTANT
  //           fullname: u.fullname,
  //           selected: false
  //         });
  //       });

  //       return Object.keys(grouped).map(group => ({
  //         usergroup: group,
  //         users: grouped[group]
  //       }));
  //     })
  //   );
  // }

  updatePassword(data: any) {
  return this.http.put(this.url + 'user/update-password', data);
}

}


