import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';
import { UserGroupService } from './services/usergroup.service';
import { AutologoutService } from './services/autologout.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],



})
export class AppComponent {
  constructor(private usergroupService: UserGroupService,private autologoutService: AutologoutService) { }

  // Simple Alert

  // Confirmation Alert
  confirmAction() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will update the ticket status!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) { // In older versions, check result.value or result.isConfirmed
        // Your logic here
        Swal.fire('Updated!', 'Status has been changed.', 'success');
      }
    });
  }

}
