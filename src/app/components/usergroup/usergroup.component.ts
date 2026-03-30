import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { UserGroupService } from '../../services/usergroup.service';

import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectChange } from '@angular/material/select';

import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';



@Component({
  selector: 'app-usergroup',
  templateUrl: './usergroup.component.html',
  styleUrls: ['./usergroup.component.css'],
})
export class UsergroupComponent implements OnInit, AfterViewInit {
  openPermissionDialog(row: any) {
    this.dialog.open(PermissionDialogComponent, {
      width: '600px',
      panelClass: 'custom-dialog',
      data: {
        usergroup_id: row.usergroup_id
      }
    }); console.log('Opening permission dialog for:', row.usergroup_id);
  }
  displayedColumns: string[] = ['sno', 'usergroupname', 'permission', 'edit', 'delete'];
  DataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  selectedId: number;


  constructor(
    private dialog: MatDialog,
    private userGroupService: UserGroupService,
    private snackBar: MatSnackBar
  ) { }


  ngOnInit(): void {
    this.getUserGroup();
  }
  ngAfterViewInit(): void {
    // assign paginator and sort after view init
    this.DataSource.paginator = this.paginator;
    this.DataSource.sort = this.sort;
  }


  openUserGroupDialog(): void {
    const dialogRef = this.dialog.open(UsergroupFormComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getUserGroup();
      }
    });
  }


  getUserGroup(): void {
    this.userGroupService.getusergroup().subscribe(response => {
      this.DataSource.data = response.data || [];
    });
  }

  deleteUserGroup(row: any): void {
    Swal.fire({
title: `User Group Name: ${row.usergroupname}`,    
      text: `Are you sure you want to delete this user group :${row.usergroupname}`,
      // icon: 'warning',
      width: '350px',
      showCloseButton: true,
      // showCancelButton: true,
      confirmButtonText: ' Delete ',
      // cancelButtonText: 'Cancel',
      confirmButtonColor: 'var(--formbutton-color)',
      // cancelButtonColor: '#be9a9aff',
      background: 'var(--tableheader)',
      // reverseButtons: true,
      customClass: {
        closeButton: 'custom-close-button'
      }
    }).then((result) => {

      if (!result.isConfirmed) return;

      this.userGroupService.deleteUsergroup(row.usergroup_id).subscribe({

        next: (res: any) => {

          //  SUCCESS DELETE
          if (res.success) {
            this.snackBar.open(res.message, '', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });

            this.getUserGroup(); // refresh list
          }

          //  BLOCKED (assigned users)
          else {
            Swal.fire({
              title: 'Cannot Delete',
              text: res.message,
              // icon: 'warning',
              confirmButtonColor: 'var(--formbutton-color)'
            });
          }
        },

        //  SERVER / NETWORK ERROR
        error: (err) => {
          console.error('Delete error:', err);
          Swal.fire('Error', 'Server error occurred', 'error');
        }
      });
    });
  }




  // deleteuserGroup(usergroup_id: number): void {
  //   this.userGroupService.deleteUsergroup(usergroup_id).subscribe(() => {
  //     this.getUserGroup();
  //   });
  // }

  // EDIT METHOD
  editusergroup(row: any): void {
    this.selectedId = row.usergroup_id;

    const dialogRef = this.dialog.open(UsergroupFormComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      data: row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getUserGroup();
      }
    });
  }
}

// --------------------- FORM COMPONENT ---------------------

// @Component({
//   selector: 'app-member-form',
//   templateUrl: './usergroupform.html',
//   styleUrls: ['./usergroup.component.css']
// })
// export class UsergroupFormComponent implements OnInit {

//   usergroupform: FormGroup;

//   constructor(
//     private dialogRef: MatDialogRef<UsergroupFormComponent>,
//     private userGroupService: UserGroupService,
//     @Inject(MAT_DIALOG_DATA) public data: any
//   ) { }

//   ngOnInit(): void {
//     this.usergroupform = new FormGroup({
//       usergroupname: new FormControl('', Validators.required)
//     });

//     if (this.data) {
//       this.usergroupform.patchValue(this.data);
//     }
//   }

//   onClose(): void {
//     this.dialogRef.close(); // false indicates user cancelled
//   }

//   onSubmit(): void {
//     if (this.usergroupform.valid) {
//       if (this.data && this.data.usergroup_id) {
//         // Edit existing
//         this.userGroupService.updateUsergroup(this.data.usergroup_id, this.usergroupform.value)
//           .subscribe(() => this.dialogRef.close(true));
//       } else {
//         // Add new
//         this.userGroupService.addUserGroup(this.usergroupform.value)
//           .subscribe(() => this.dialogRef.close(true));
//       }
//     } else {
//       console.log('Form is invalid, cannot submit empty values');
//     }
//   }
// }

@Component({
  selector: 'app-member-form',
  templateUrl: './usergroupform.html',
  styleUrls: ['./usergroup.component.css']
})
export class UsergroupFormComponent implements OnInit {

  usergroupform!: FormGroup;
  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<UsergroupFormComponent>,
    private userGroupService: UserGroupService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {

    //  Create form first
    this.usergroupform = new FormGroup({
      usergroupname: new FormControl('', Validators.required)
    });

    //  Patch value if edit
    if (this.data && this.data.usergroup_id) {
      this.isEditMode = true; // this is ued for changing the values like heading ,names like this for each editing

      this.usergroupform.patchValue({
        usergroupname: this.data.usergroupname
      });
    }
  }


  onClose(): void {
    this.dialogRef.close(false);
  }

 onSubmit(): void {

  if (this.usergroupform.invalid) {
    this.usergroupform.markAllAsTouched();
    return;
  }

  const formValue = this.usergroupform.value;

  // ================= EDIT =================
  if (this.data && this.data.usergroup_id) {

    this.userGroupService.updateUsergroup(this.data.usergroup_id, formValue).subscribe({
      next: () => {
        this.snackBar.open('User group updated successfully', '', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });

        this.dialogRef.close(true);
      },
      error: (err) => {
        if (err.status === 409) {
          this.usergroupform
            .get('usergroupname')
            ?.setErrors({ duplicate: true });
        }
      }
    });

  }

  // ================= CREATE =================
  else {

    this.userGroupService.addUserGroup(formValue).subscribe({
      next: () => {
        this.snackBar.open('User group created successfully', '', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });

        this.dialogRef.close(true);
      },
      error: (err) => {
        if (err.status === 409) {
          this.usergroupform
            .get('usergroupname')
            ?.setErrors({ duplicate: true });
        }
      }
    });

  }
}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



@Component({
  selector: 'app-permission-dialog',
  templateUrl: './permissionDialog.component.html',
  styleUrls: ['./permissionDialog.component.css']
})
export class PermissionDialogComponent {
  isEdit: boolean = false;
  loggedInUser: any;
  userpermissions: any = {};
  masterpermissions: any = {};
  otherpermissions: any = {};
  constructor(
    private dialogRef: MatDialogRef<PermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snack: MatSnackBar,
    private usergroupService: UserGroupService
  ) { }
  ngOnInit() {
    this.loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!this.data?.usergroup_id) {
      console.error(' usergroup_id is missing');
      return;
    }
    this.loadPermissions();
  }
  onClose() {
    this.dialogRef.close();
  }
  resetPermissions() {
    // reset first
    this.masterpermissions = {
      project: false,
      tickettype: false,
      ticketstatus: false,
      ticketpriority: false,
      tickettag: false
    };

    this.userpermissions = {
      user: false,
      usergroup: false
    };

    this.otherpermissions = {
      settings: false,
      view: false,
      clientTicketView: false,
      clientTicketAction: false
    }

  }
  loadPermissions() {
    console.log('Loading permissions for:', this.data.usergroup_id);

    this.usergroupService
      .getPermissions(this.data.usergroup_id)
      .subscribe({

        next: (rows: any[] | null) => {
          rows = Array.isArray(rows) ? rows : [];
          console.log('Permissions API response:', rows);
          this.resetPermissions();
          console.log('Permissions from DB:', rows);


          rows.forEach(p => {
            if (!p.permission) return;

            switch (p.page_name) {
              case 'user': this.userpermissions.user = p.permission; break;
              case 'usergroup': this.userpermissions.usergroup = p.permission; break;
              case 'project': this.masterpermissions.project = p.permission; break;
              case 'tickettype': this.masterpermissions.tickettype = p.permission; break;
              case 'ticketstatus': this.masterpermissions.ticketstatus = p.permission; break;
              case 'ticketpriority': this.masterpermissions.ticketpriority = p.permission; break;
              case 'tickettag': this.masterpermissions.tickettag = p.permission; break;
              case 'settings': this.otherpermissions.settings = p.permission; break;
              case 'view': this.otherpermissions.view = p.permission; break;
              case 'clientTicketView':
                this.otherpermissions.clientTicketView = p.permission;
                break;

              case 'clientTicketAction':
                this.otherpermissions.clientTicketAction = p.permission;
                break;
            }
          });
        },
        error: (err) => {
          console.error('********** getPermissions API error:', err);
        }
      });
  }


  save() {
    const payload = {
      usergroup_id: this.data.usergroup_id,
      permissions: [
        { page_name: 'user', permission: this.userpermissions.user },
        { page_name: 'usergroup', permission: this.userpermissions.usergroup },
        { page_name: 'project', permission: this.masterpermissions.project },
        { page_name: 'tickettype', permission: this.masterpermissions.tickettype },
        { page_name: 'ticketstatus', permission: this.masterpermissions.ticketstatus },
        { page_name: 'ticketpriority', permission: this.masterpermissions.ticketpriority },
        { page_name: 'tickettag', permission: this.masterpermissions.tickettag },
        { page_name: 'settings', permission: this.otherpermissions.settings },
        { page_name: 'view', permission: this.otherpermissions.view },
        {
          page_name: 'clientticketview',
          permission: this.otherpermissions.clientTicketView
        },
        {
          page_name: 'clientticketaction',
          permission: this.otherpermissions.clientTicketAction
        }
      ]
    };

    console.log('Permission payload:', payload);

    this.usergroupService.savePermissions(payload).subscribe({
      next: () => {
        this.snack.open('Permissions saved successfully', 'OK', {
          duration: 3000,
          panelClass: ['snack-success']
        });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snack.open('Failed to save permissions', 'Retry', {
          duration: 3000,
          panelClass: ['snack-error']
        });
      }
    });

  }


}







