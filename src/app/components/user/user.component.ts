import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import Swal from 'sweetalert2';
import { element } from 'protractor';
import { AttachmentService } from 'src/app/services/attachment.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, AfterViewInit {

  getUserGroup() {
    throw new Error('Method not implemented.');
  }

  // NOTE: column ids are case-sensitive and must match matColumnDef values
  displayedColumns: string[] = [
    'position',
    'fullname',
    'attachment',
    'usergroup',
    'status',
    'edit',
    'delete'
  ];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dialog: MatDialog, private userservice: UserService, private snack: MatSnackBar, private attachmentService: AttachmentService) { }

  ngOnInit(): void {
    this.getuser();

  }

  ngAfterViewInit(): void {
    // assign paginator and sort after view init
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onStatusToggle(row: any, event: MatSlideToggleChange) {

    const payload = {
      user_id: row.user_id,
      status_id: event.checked ? 1 : 2
    };

    this.userservice.updateuser(payload).subscribe({
      next: () => {
        if (payload.status_id === 2) {
          this.snack.open('User Disabled Successfully', 'OK', {
            duration: 3000,
            panelClass: ['snack-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        } else {
          this.snack.open('User Enabled Successfully', 'OK', {
            duration: 3000,
            panelClass: ['snack-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          console.log('Status updated successfully');
          row.status_id = payload.status_id; // update local state
        }
      },
      error: () => {
        // rollback UI

        row.status_id = event.checked ? 2 : 1;
        event.source.checked = row.status_id === 1;
      }

    });
  }


  viewAttachment(fileName: string) {
    const imageUrl =
      environment.ServerApi + 'attachment/download/' + fileName;

    this.dialog.open(ImagePreviewDialogComponent, {
      width: '700px',
      data: { imageUrl },
      panelClass: 'custom-dialog'
    });
  }

  openUserDialog(editUser?: any) {
    // guard to avoid duplicate dialogs if button is double-clicked
    if (this.dialog.openDialogs && this.dialog.openDialogs.length > 0) {
      return;
    }

    const dialogRef = this.dialog.open(UserDialogueComponent, {
      width: '500px',
      height: 'auto',
      data: editUser ? { user: editUser } : null,
      panelClass: 'custom-dialog',
      // disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getuser(); // reload users with attachment_name after dialog closes
      }
    });

  }

  // getuser() {
  //   this.userservice.getuser().subscribe(resdata => {
  //     this.dataSource.data = resdata.data;
  //   });
  // }
  getuser() {
    this.userservice.getuser().subscribe(resdata => {

      const users = resdata.data;

      console.log('Users from API:', users);

      // APPLY FILTER HERE
      this.dataSource.data = users.filter(
        // (u: any) => u.status_id === 1 && !u.is_reactivated
        (u: any) => u.status_id === 1 || u.status_id === 2
      );

      console.log('Filtered Users:', this.dataSource.data);
    });
  }
  deleteuser(element: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete ' + element.fullname,
      icon: 'warning',
      width: '350px',
      showCloseButton: true,
      background: 'var(--tableheader)',
      confirmButtonColor: 'var(--formbutton-color)',
      cancelButtonColor: '#be9a9aff',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        closeButton: 'custom-close-button'
      }
    }).then((result) => {
      if (result.isConfirmed) {

        const params = { user_id: element.user_id };

        this.userservice.deleteuser(params).subscribe({
          next: () => {
            //  Snackbar works
            this.snack.open('User deleted successfully', 'Close', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });

            //  Auto refresh works
            this.getuser();
          },

          error: (err) => {
            console.error('Delete error', err);
            Swal.fire('Error', 'Failed to delete user', 'error');
          }
        });
      }
    });
  }




  editUser(element: any) {
    this.openUserDialog(element);
  }


}

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



@Component({
  selector: 'app-userdialogue',
  templateUrl: './userdialogue.component.html',
  styleUrls: ['./userdialogue.component.css']
})
export class UserDialogueComponent implements OnInit {
  registrationForm!: FormGroup;
  isEdit = false;
  editingUser: any = null;
  hide = true;
  selectedFile!: File;
  usergrouparray: any[] = [];

  // inject UserService if you want to save data to server
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserDialogueComponent>,
    private attachmentService: AttachmentService,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackbar: MatSnackBar,
    private userservice: UserService
  ) { }
  onClose() {
    this.dialogRef.close(true);
  }
  ngOnInit(): void {
    this.loadUsergroup();
    // this.loadAttachments();
    // this.userId = Number(this.route.snapshot.paramMap.get('userId'));
    this.editingUser = this.data?.user;
    this.isEdit = !!this.editingUser;
    if (this.isEdit) {
      this.userId = this.editingUser.user_id;
      this.loadAttachments();
    }

    this.existingAttachmentName = this.editingUser?.attachment_name || null;
    this.selectedFiles = [];

    this.registrationForm = this.fb.group({
      phonenumber: [this.editingUser?.phonenumber || '', [Validators.pattern("^[0-9]{10}$")]
      ],
      fullname: [this.editingUser?.fullname || '', Validators.required],
      usergroup_id: [this.editingUser?.usergroup_id || '', Validators.required],

      password: [
        this.editingUser ? this.editingUser.password : '',
        this.editingUser ? [] : [Validators.required, Validators.minLength(6)]
      ],

      email: [
        this.editingUser?.email || '',
        [Validators.required, Validators.email]
      ],

      status_id: [this.editingUser?.status_id ?? 1],
      // attachment_name:[this.editingUser?.attachment_name || '',Validators.required]
    });

    this.registrationForm.get('fullname')?.valueChanges.subscribe(() => {
      const control = this.registrationForm.get('fullname');
      if (control?.hasError('duplicate')) {
        control.setErrors(null);
      }
    });
  }

  loadUsergroup() {
    this.userservice.getusergroup().subscribe(
      (res: any) => {
        this.usergrouparray = res.data;
        console.log('User groups loaded:', this.usergrouparray);
      },
      err => {
        console.error('Failed to load user groups', err);
      }
    );
  }

  getErrorMessage(): string {
    const email = this.registrationForm.get('email');

    if (email?.hasError('required')) {
      return 'Email is required';
    }
    if (email?.hasError('email')) {
      return 'Invalid email format';
    }
    if (email?.hasError('duplicate')) {
      return 'Email already exists';
    }
    return '';
  }
  uploadAttachments(userId: number): void {

    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      return;
    }

    this.selectedFiles.forEach(file => {
      this.attachmentService.upload(file, userId).subscribe({
        next: () => {
          console.log('Attachment uploaded');
          this.selectedFiles = [];
        },
        error: err => console.error('Attachment save failed', err)
      });
    });

    // this.selectedFiles = [];
  }

  submitForm(): void {
    this.registrationForm.markAllAsTouched();

    if (this.registrationForm.invalid) return;
    //if (this.passwordsDoNotMatch()) return;

    const form = this.registrationForm.value;

    const user = {
      user_id: this.editingUser?.user_id,
      fullname: form.fullname,
      usergroup_id: form.usergroup_id,
      attachment_name: form.attachment_name,
      password: form.password,
      phonenumber: form.phonenumber,
      email: form.email,
      status_id: form.status_id,

    };

    // If you want to call backend:
    if (this.isEdit) {
      console.log('Updating user with data:', form);

      const userId = this.editingUser?.user_id;
      if (!userId) return;
      this.userservice.updateuser(user).subscribe({
        next: () => {



          if (this.selectedFiles.length >= 0) {
            this.uploadAttachments(userId);
          }
          // this.uploadAttachments(userId);

          this.snackbar.open('User Updated Successfully', 'close', { // Fixed quotes here
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);

        },
        error: err => {
          if (err.status === 409) {
            this.registrationForm.get('fullname')?.setErrors({
              duplicate: true
            });
          } else {
            console.error('Update error', err);
          }
        }
      });
    }
    // ========= CREATE =========
    else {
      this.userservice.saveuser(user).subscribe({
        next: (res: any) => {

          const userId = res.user_id;
          this.userId = userId;  //it come from backend
          console.log('User created with ID:', userId);



          if (this.selectedFiles.length >= 0) {
            this.uploadAttachments(userId);
          }
          this.snackbar.open('User Created Successfully', 'close', { // Fixed quotes here
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          // this.uploadAttachments(userId);
          this.dialogRef.close(true);
        },


        error: err => {
          if (err.status === 409) {

            this.registrationForm.get('fullname')?.setErrors({
              duplicate: true
            });
            this.registrationForm.get('email')?.setErrors({
              duplicate: true

            });
          } else {
            console.error('Save error', err);
          }
        }
      });
    }


  }
  //////////////////////////////////////    Attachment    ////////////////////////////////////


  attachments: any[] = [];
  selectedFiles: File[] = [];
  isDragging = false;
  userId!: number;
  existingAttachmentName: string | null = null; // to show existing attachment name in edit mode


  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;


    if (event.dataTransfer?.files?.length) {
      this.selectedFiles = [event.dataTransfer.files[0]]; // only 1 file
      this.existingAttachmentName = null; // hide old attachment
    }
  }

  // Browse file
  onFileSelect(event: any) {
    // this.selectedFiles = Array.from(event.target.files);
    if (event.target.files?.length) {
      this.selectedFiles = [event.target.files[0]]; // only 1 file
      this.existingAttachmentName = null; // hide old attachment
    }
  }

  loadAttachments() {
    console.log("User ID before fetching attachments:", this.userId);

    if (!this.userId) {
      console.error("User ID missing");
      return;
    }
    this.attachmentService.list(this.userId)
      .subscribe(res => this.attachments = res);
    console.log('Attachment +++______+++++++++=============', this.attachments);
  }

  clearExistingAttachment() {
    this.existingAttachmentName = null;
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }


}
//////////////////////////////////image preview popup ///////////////////////////////////////
@Component({
  selector: 'app-image-preview-dialog',
  templateUrl: './image-previewDialog.component.html',
  styleUrls: ['./userdialogue.component.css']
})
export class ImagePreviewDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ImagePreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string }
  ) { }

  close() {
    this.dialogRef.close();
  }
}