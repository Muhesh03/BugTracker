import { Component, OnInit, ViewChild } from '@angular/core';
import { UserComponent } from '../user/user.component';
import { UsergroupComponent } from '../usergroup/usergroup.component';



@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements OnInit {
  @ViewChild(UserComponent) private usercomp: UserComponent;
  @ViewChild(UsergroupComponent) private usergroupcomp: UserComponent;
  permissions: any = {};


  constructor() { }


  ngOnInit(): void {
    this.loadPermissions();
    // const raw = localStorage.getItem('permissions');
    // if (!raw) return;

    // JSON.parse(raw).forEach((p: any) => {
    //   this.permissions[p.page_name] = p.permission;
    // });
    //  const userString = localStorage.getItem('user');
    // if (userString) {
    //   const user = JSON.parse(userString);
    //   console.log(user.name); //Muhesh C
    //   console.log(user.id);  //58
    // }
  }
 loadPermissions() {
    const perms = JSON.parse(localStorage.getItem('permissions') || '[]');

    perms.forEach((p: any) => {
      this.permissions[p.page_name] = p.permission;
    });

    console.log('TAB PERMISSIONS:', this.permissions);
  }
}


