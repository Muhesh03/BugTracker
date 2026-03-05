import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { TicketTypeService } from 'src/app/services/tickettype.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
@Component({
  selector: 'app-tickettype',
  templateUrl: './tickettype.component.html',
  styleUrls: ['./tickettype.component.css'],


})
export class TicketTypeComponent implements OnInit, AfterViewInit {
  // NOTE: column ids are case-sensitive and must match matColumnDef values
  displayedColumns: string[] = [
    'position',
    'name',
    'status',
    'edit',
    'delete'
  ];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dialog: MatDialog,
    private tickettypeservice: TicketTypeService,
    private snackBar: MatSnackBar
  ) { }


  ngOnInit(): void {
    this.gettickettype();
  }



  ngAfterViewInit(): void {
    // assign paginator and sort after view init
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openTicketTypeDialog(editUser?: any) {
    // guard to avoid duplicate dialogs if button is double-clicked
    if (this.dialog.openDialogs && this.dialog.openDialogs.length > 0) {
      return;
    }


    const dialogRef = this.dialog.open(TicketTypeDialogueComponent, {
      width: '500px',
      height: '410px',
      data: editUser ? { user: editUser } : null,
      panelClass: 'custom-dialog',
      //disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.gettickettype();
      }
    });
  }

  gettickettype() {
    this.tickettypeservice.gettickettype().subscribe(resdata => {

      this.dataSource.data = resdata.data;
    });
  }
  // onchangeStatus(element: any, event: MatSlideToggleChange) {
  //   // Toggle logic
  //   element.status = event.checked ? 'Active' : 'Inactive';

  //   // OPTIONAL: save to backend
  //   const payload = {
  //     tickettype_id: element.tickettype_id,
  //     status: element.status
  //   };

  //   this.tickettypeservice.updatetickettype(payload).subscribe({
  //     next: () => {
  //       console.log('Status updated:', element.status);
  //     },
  //     error: () => {

  //       element.status = event.checked ? 'Inactive' : 'Active';
  //     }
  //   });
  // }


   onchangeStatus(row: any, checked: boolean) {
   
    const newStatus = checked ? 1 : 2;
   row.status_id = newStatus;
    this.tickettypeservice.updatetickettype({
      tickettype_id: row.tickettype_id,
      status_id: newStatus
    }).subscribe(() => {

      // Update UI after DB update
      row.status_id = newStatus;

    });
  }

  editTicket(element: any) {
    this.openTicketTypeDialog(element);
  }

  deleteTicket(element: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete ' + element.name,
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

        const params = { tickettype_id: element.tickettype_id };

        this.tickettypeservice.deletetickettype(params).subscribe({
          next: () => {
            // Snackbar works
            this.snackBar.open('Ticket Type deleted successfully', 'Close', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });

            //  Auto refresh works
            this.gettickettype();
          },

          error: (err) => {
            console.error('Delete error', err);
            Swal.fire('Error', 'Failed to delete Ticket Type', 'error');
          }
        });
      }
    });
  }

  // deleteTicket(element: any): void {
  //   if (!confirm('Are you sure you want to delete this ticket type?')) return;

  //   this.tickettypeservice.deletetickettype({
  //     tickettype_id: element.tickettype_id
  //   }).subscribe({
  //     next: () => this.gettickettype(),
  //     error: err => console.error('Delete error', err)
  //   });
  // }


}

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@Component({
  selector: 'app-tickettypeDialogue',
  templateUrl: './tickettypeDialog.component.html',
  styleUrls: ['./tickettypeDialog.component.css']
})
export class TicketTypeDialogueComponent implements OnInit {
  registrationForm!: FormGroup;
  isEdit = false;
  editingUser: any = null;


  // inject UserService if you want to save data to server
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TicketTypeDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tickettypeservice: TicketTypeService
  ) { }

  ngOnInit(): void {

    this.editingUser = this.data?.user;
    this.isEdit = !!this.editingUser;

    this.registrationForm = this.fb.group({

      name: [this.editingUser?.name || '', Validators.required],
      remarks: [this.editingUser?.remarks || ''],

      status: [this.editingUser?.status || 'Active']
    });
  }

  onClose(): void {
    // This closes the dialog without passing any specific result value
    this.dialogRef.close();
  }

  // getErrorMessage(): string {
  //   const ctrl = this.registrationForm.get('email');
  //   if (!ctrl) return '';
  //   if (ctrl.hasError('required')) return 'You must enter a value';
  //   return ctrl.hasError('email') ? 'Not a valid email' : '';
  // }

  submitForm(): void {
    this.registrationForm.markAllAsTouched();
    if (this.registrationForm.invalid) return;

    const form = this.registrationForm.value;

    if (this.isEdit && this.editingUser?.tickettype_id) {
      const payload = {
        tickettype_id: this.editingUser.tickettype_id,
        ...form
      };
      this.tickettypeservice.updatetickettype(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: err => {
          if (err.status === 409) {
            this.registrationForm
              .get('name')
              ?.setErrors({ duplicate: true });
          }
        }
      });
    }

    // ========= CREATE =========
    else {
      this.tickettypeservice.savetickettype(form).subscribe({
        next: () => this.dialogRef.close(true),
        error: err => {
          if (err.status === 409) {
            this.registrationForm
              .get('name')
              ?.setErrors({ duplicate: true });
          }
        }
      });
    }

  }
}