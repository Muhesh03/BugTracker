import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
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
export class ProjectService {

  // private apiUrl = 'http://localhost:3000/';
  private apiUrl = environment.ServerApi;

  constructor(private http: HttpClient) { }

 //  refresh event
  private projectRefreshSource = new Subject<void>();
  projectRefresh$ = this.projectRefreshSource.asObservable();

  triggerProjectRefresh() {
    this.projectRefreshSource.next();
  }



  addProjects(result: any): Observable<any> {
    console.log('project data getted in service = ', result);
    return this.http.post(
      this.apiUrl + 'projects/save_data',
      result,
      httpOptionsPost
    );
  }

  getProjects(): Observable<any> {
    console.log('project data function: GETting data from project');
    return this.http.get<any>(
      this.apiUrl + 'projects/list',
      httpOptionsGet
    );
  }


  deleteProject(project_id: number): Observable<any> {

    console.log('delete project function in service working', project_id);
    return this.http.post(
      this.apiUrl + 'projects/delete/' + project_id,
      {},
      httpOptionsPost
    );
  }


  updateProject(project_id: number, result: any): Observable<any> {
    console.log('++++++++++++++++ UPDATE PROJECT SERVICE = ', project_id, result);
    return this.http.post(
      this.apiUrl + 'projects/update/' + project_id,
      result,
      httpOptionsPost
    );
  }

  // SAVE PROJECT TEAM

  saveProjectTeam(projectId: number, users: any[]) {
    console.log('+++++++++++++++ Saving project team for project ID:', projectId);
    return this.http.post(this.apiUrl + 'projects/save/project_team', {
      project_id: projectId,
      users: users.map(u => ({
        user_id: u.user_id,
        is_active: true   // checkbox checked it will show true otherwise false
      }))
    });
  }
  //  depends upon user it will show project in dropdown
  getUserProjects(userId: number) {
    console.log('Getting projects for user ID:', userId);
    return this.http.get<any[]>(
      this.apiUrl + 'projects/assigned/' + userId
    );

  }
  getProjectTeam(project_id: number) {
  console.log('Calling getProjectTeam with:', project_id);
  return this.http.get<any[]>(
    `${this.apiUrl}projects/team/${project_id}`
  );
}
}
