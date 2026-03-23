import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar-item.component.html',
  styleUrls: ['./sidebar-item.component.css']
})
export class SidebarItemComponent {
 permissions: any = {};

  constructor() { }

  isExpanded: boolean = true; 
ngOnInit() {
    this.loadPermissions();
  }
  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
  }

 loadPermissions() {
    const perms = JSON.parse(localStorage.getItem('permissions') || '[]');

    perms.forEach((p: any) => {
      this.permissions[p.page_name] = p.permission;
    });

    console.log('MASTER TAB PERMISSIONS:', this.permissions);
  }

}