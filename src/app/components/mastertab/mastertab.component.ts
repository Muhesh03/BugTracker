import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-mastertab',
  templateUrl: './mastertab.component.html',
  styleUrls: ['./mastertab.component.css'],

})
export class MastertabComponent implements OnInit {
  permissions: any = {};

  constructor() { }


  ngOnInit(): void {
    this.loadPermissions();
    //   const raw = localStorage.getItem('permissions');
    // if (!raw) return;

    // JSON.parse(raw).forEach((p: any) => {
    //   this.permissions[p.page_name] = p.permission;
    // });
    // const userString = localStorage.getItem('user');
    // if (userString) {
    //   const user = JSON.parse(userString);
    //   console.log("Retrive Data",user);
    //   console.log(user.name); // Muhesh C
    //   console.log(user.id);   //58
    // }
  }
  loadPermissions() {
    const perms = JSON.parse(localStorage.getItem('permissions') || '[]');

    perms.forEach((p: any) => {
      this.permissions[p.page_name] = p.permission;
    });

    console.log('MASTER TAB PERMISSIONS:', this.permissions);
  }

}
