// import { Component } from '@angular/core';
// import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
// import { map, shareReplay, take } from 'rxjs/operators';
// import { Observable } from 'rxjs';
// import { MatSidenav } from '@angular/material/sidenav';

// @Component({
//   selector: 'app-sidenav',
//   templateUrl: './sidenav.component.html',
//   styleUrls: ['./sidenav.component.css']
// })
// export class SideNavComponent {
//   isHandset$: Observable<boolean>;
//   opened = true;

//   constructor(private breakpointObserver: BreakpointObserver) {
//     this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
//       .pipe(
//         map(result => result.matches),
//         shareReplay()
//       );

//     // Close on handset by default
//     this.isHandset$.pipe(take(1)).subscribe(isHandset => {
//       this.opened = !isHandset;
//     });
//   }

//   // Called from template when a nav item is clicked
//   onNavItemClick(drawer: MatSidenav) {
//     // take(1) ensures we don't keep a long subscription
//     this.isHandset$.pipe(take(1)).subscribe(isHandset => {
//       if (isHandset) { drawer.close(); }
//     });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from "@angular/material/icon";
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/services/projects.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],

})
export class SideNavComponent implements OnInit {
  encodeURIComponent(arg0: any) {
    throw new Error('Method not implemented.');
  }

  isExpanded: boolean = false;  //we setted it as false for first time
  permissions: any = {};
  user: any;
  apiUrl = environment.ServerApi;

  constructor(private router: Router, private projectservice: ProjectService, private loginserService: LoginService, private userService: UserService) { }

  userName: string = '';
  groupList: any[] = [];
  allocatedProjects: any[] = [];
  selectedProject: number | null = null;
  userId!: number;
  Dropdowprojectvalue: string | number;
  ngOnInit() {
    console.log("sidenav project list", this.allocatedProjects)
    const userData = localStorage.getItem('user');
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = this.user.id;

    const storedProject = localStorage.getItem('selectedProject');
    this.selectedProject = storedProject ? Number(storedProject) : null;




    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.fullname;
    } else {
      this.userName = '';
    }
    const stored = localStorage.getItem('permissions');

    if (stored) {
      const perms = JSON.parse(stored);

      perms.forEach((p: any) => {
        this.permissions[p.page_name] = p.permission;
      });
    }
    console.log('SIDENAV PERMISSIONS:', this.permissions);
    //  this.loadLastProject();
    this.loadAllocatedProjects();

    this.projectservice.projectRefresh$
      .subscribe(() => {
        console.log('Project updated → refreshing sidenav');
        this.loadAllocatedProjects();
      });

  }

  onProjectSelect(projectId: number): void {
    this.selectedProject = projectId;
    // localStorage.setItem('selectedProject', projectId.toString());
    // this.selectedProject = projectId;

    if (projectId === 0) {
      // ALL PROJECT selected
      localStorage.removeItem('selectedProject');
      console.log('All projects selected');
         window.location.reload();
    } else {
      localStorage.setItem('selectedProject', projectId.toString());
      console.log('Selected project ID:', projectId);
      window.location.reload();
    }
    this.userService.updateLastProject(this.userId, projectId)
      .subscribe({
        next: () => {
          console.log('Project updated in DB');
          // optional
          // this.userService.projectChanged.next(projectId);
        },
        error: err => console.error(err)
      });
  }
  // loadLastProject() {
  //   this.userService.getLastProject(this.userId)
  //     .subscribe((res: any) => {
  //       if (res?.last_project_id) {
  //         this.selectedProject = res.last_project_id;
  //         localStorage.setItem('selectedProject', res.last_project_id.toString());
  //         console.log("zzzzzzzzzzzzzzzzzzz",res.last_project_id);
  //       }
  //     });
  // }
  loadLastProject() {
    this.userService.getLastProject(this.userId)
      .subscribe((res: any) => {
        // if (!res?.last_project_id) return;
        if (!res?.last_project_id || res.last_project_id === 0) {
          this.selectedProject = 0;
          this.Dropdowprojectvalue = 'All Projects';
          return;
        }
        const exists = this.allocatedProjects.find(
          p => p.project_id === res.last_project_id
        );

        if (exists) {
          this.selectedProject = res.last_project_id;
          localStorage.setItem('selectedProject', res.last_project_id.toString());
        }
        else {
          this.selectedProject = 0;
        }
      });
  }

  loadAllocatedProjects() {
    this.projectservice.getUserProjects(this.userId).subscribe(res => {
      this.allocatedProjects = res;
      console.log('Allocated heeeeey Projects:', this.allocatedProjects);
      this.loadLastProject();

    });
  }
  toggleSidebar() {
    this.isExpanded = !this.isExpanded; // here it means  if it is true make it false and if it is false make it true
  }
  logout() {
    // Clear login data

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    // Redirect to login
    this.router.navigate(['/sidenav/login']);


  }

  openSettings() {
    if (this.permissions?.settings) {
      this.router.navigate(['/sidenav/ticketissue']);
    }
    //  else {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Access Denied',
    //     text: 'You don’t have access to Settings',
    //     confirmButtonColor: '#d32f2f'
    //   });
    // }
  }



}