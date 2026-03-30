import { Component, Inject, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ProjectService } from '../../services/projects.service';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';



/* =========================
   MAIN PROJECT COMPONENT
   ========================= */

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectComponent implements OnInit {
  openTeamDialog(row: any) {
    this.dialog.open(ProjectDialogComponent, {
      width: '600px',
      data: row,
      panelClass: 'custom-dialog'
    });
  }
  displayedColumns: string[] = [
    'sno',
    'projectname',
    'remarks',
    'team',
    'status',
    'edit',
    'actions'
  ];

  projectDataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(
    public dialog: MatDialog,
    private projectservice: ProjectService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getProjects();
  }
  ngAfterViewInit(): void {
    // assign paginator and sort after view init
    this.projectDataSource.paginator = this.paginator;
    this.projectDataSource.sort = this.sort;
  }

  getProjects(): void {
    this.projectservice.getProjects().subscribe(response => {
      this.projectDataSource.data = response.data || [];
      console.log('Projects from backend:', this.projectDataSource.data);
    });
  }

  // DELETE PROJECT
  deleteproject(row: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete ' + row.projectname,
      icon: 'warning',
      width: '350px',
      showCloseButton: true,
      background: 'var(--tableheader-color)',
      confirmButtonColor: 'var(--formbutton-color)',
      cancelButtonColor: '#be9a9aff',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        closeButton: 'custom-close-button'
      }
    }).then((result) => {
      if (result.isConfirmed) {

        this.projectservice.deleteProject(row.project_id).subscribe({
          next: () => {
            //  Snackbar 
            this.snackBar.open('Project deleted successfully', 'Close', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });

            //  Auto refresh
            this.getProjects();
            this.projectservice.triggerProjectRefresh();
          },

          error: (err) => {
            console.error('Delete error', err);
            Swal.fire('Error', 'Failed to delete Project', 'error');
          }
        });
      }
    });
  }
  // deleteproject(project_id: number) {
  //   console.log('function delete working', project_id);
  //   this.projectservice.deleteProject(project_id).subscribe(() => {
  //     this.getProjects();
  //   });
  // }

  // editing starts here 
  selectedProjectId: number;

  editproject(row: any) {
    this.selectedProjectId = row.project_id;

    const DialogRef = this.dialog.open(ProjectFormComponent, {
      panelClass: 'custom-dialog',
      data: row
    });

    DialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getProjects();
      }
    });
  }

  // funcrion for toggle status
  changeStatus(row: any, checked: boolean) {
    const newStatus = checked ? 1 : 2;

    this.projectservice.updateProject(
      row.project_id,
      { status_id: newStatus }
    ).subscribe(() => {

      // Update UI after DB update
      row.status_id = newStatus;

    });
  }


  // editing ends here 

  openProjectDialog(): void {
    const dialogRef = this.dialog.open(ProjectFormComponent, {
      panelClass: 'custom-dialog',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getProjects();
      }
    });
  }
}

/* =========================
   FORM COMPONENT
   ========================= */

@Component({
  selector: 'app-projects-form',
  templateUrl: './projectsform.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectFormComponent implements OnInit {

  projectform: FormGroup;
  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<ProjectFormComponent>,
    private projectservice: ProjectService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.projectform = new FormGroup({
      projectname: new FormControl('', Validators.required),
      remarks: new FormControl(''),
      status_id: new FormControl(1, Validators.required)
    });

    // show data while editing
    if (this.data && this.data.project_id) {
      this.isEditMode = true;
      this.projectform.patchValue(this.data);// for showing data to form
    }
  }



  onClose(): void {
    this.dialogRef.close(true);
  }
  onProjectSubmit(): void {

    if (this.projectform.invalid) {
      this.projectform.markAllAsTouched();
      return;
    }

    const formValue = this.projectform.value;

    // ================= EDIT =================
    if (this.data && this.data.project_id) {

      this.projectservice.updateProject(this.data.project_id, formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          if (err.status === 409) {
            this.projectform
              .get('projectname')
              ?.setErrors({ duplicate: true });
          }
        }
      });

    }

    // ================= CREATE =================
    else {


      this.projectservice.addProjects(formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          if (err.status === 409) {
            this.projectform
              .get('projectname')
              ?.setErrors({ duplicate: true });
          }
        }
      });

    }
  }

  // onProjectSubmit(): void {

  //   if (this.projectform.valid) {

  //     if (this.data && this.data.project_id) {
  //       console.log('Updating project', this.data, this.data.project_id);

  //       this.projectservice
  //         .updateProject(this.data.project_id, this.projectform.value)
  //         .subscribe(() => {
  //           this.dialogRef.close(true);
  //         });

  //     } else {
  //       // ADD PROJECT
  //       console.log('Adding new project', this.projectform.value);

  //       this.projectservice
  //         .addProjects(this.projectform.value)
  //         .subscribe(() => {
  //           this.dialogRef.close(true);
  //         });
  //     }

  //   } else {
  //     console.log('Form is invalid. Cannot submit empty fields');
  //   }
  // }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@Component({
  selector: 'app-project-dialog',
  templateUrl: './projectDialog.component.html',
  styleUrls: ['./projectDialog.component.css']
})
export class ProjectDialogComponent implements OnInit {

  groupList: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public project: any,
    private projectService: ProjectService,
    private userservice: UserService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<ProjectDialogComponent>
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadProjectTeam();
  }
  onclose() {
    this.dialogRef.close();
  }


  loadUsers() {
    this.userservice.getUsersGroupedByGroup()
      .subscribe(res => this.groupList = res);
    this.loadProjectTeam();
  }


  loadProjectTeam() {
    this.projectService
      .getProjectTeam(this.project.project_id)
      .subscribe({
        next: (rows: any[] | null) => {
          rows = Array.isArray(rows) ? rows : [];                                  //user_id,fullname,is_active
          console.log('Team from DB:', rows);
          const selectedUsers: any[] = [];
          // Reset selection
          this.groupList.forEach(group => {
            group.users.forEach((u: any) => {
              // u.selected = false
              u.selected = false;
              u.originalState = false;
              if (u.selected) {
                selectedUsers.push(u);
              }  //  track original DB state
              return selectedUsers
            });
          });

          // Apply DB selection
          rows.forEach(dbUser => {
            this.groupList.forEach(group => {
              const user = group.users.find(
                (u: any) => u.user_id === dbUser.user_id
              );

              if (user) {
                // user.selected = dbUser.is_active;
                user.selected = dbUser.is_active;  // current checkbox state
                user.originalState = dbUser.is_active;  //  save original state
              }
            });
          });
        },
        error: err => {
          console.error('Get project team error:', err);
        }
      });
  }

  submitTeam() {

    const payload: any[] = [];
    this.groupList.forEach(group => {
      group.users.forEach((user: any) => {
        if (user.selected) {
          payload.push({
            user_id: user.user_id,
            is_active: true
          });
        }
        else if (!user.selected && user.originalState === true) {
          payload.push({
            user_id: user.user_id,
            is_active: false
          });
        }

      });
    });
    console.log('--------------------------- Payload sent to service:', payload);
    console.log('++++++++++++++++++++++++++++Project ID:', this.project.project_id);

    if (!payload.length) {
      console.warn('No users selected');
      return;
    }

    this.projectService
      .saveProjectTeam(this.project.project_id, payload)
      .subscribe({
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
