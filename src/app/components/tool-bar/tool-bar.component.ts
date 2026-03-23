import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit {

  permissions: any = {};

  constructor() { }

  ngOnInit(): void {

    const stored = localStorage.getItem('permissions');

    if (stored) {
      const perms = JSON.parse(stored);

      perms.forEach((p: any) => {
        this.permissions[p.page_name] = p.permission;
      });
    }

    console.log('TOOLBAR PERMISSIONS:', this.permissions);
  }

}
