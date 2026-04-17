import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { TicketStatusService } from 'src/app/services/ticketstatus.service';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-ticketstatus',
  templateUrl: './ticketstatus.component.html',
  styleUrls: ['./ticketstatus.component.css']
})
export class TicketStatusComponent implements OnInit {

  displayedColumns: string[] = [
    'position',
    'color',
    'statusname',
    'status',
    'edit',
    'delete'
  ];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private ticketstatusservice: TicketStatusService,
    private snackBar: MatSnackBar
  ) { }


  // constructor(
  //   private dialog: MatDialog,
  //   private ticketstatusservice: TicketStatusService,
  //   private snackBar : MatSnackBar
  // ) { }

  ngOnInit(): void {
    this.loadTicketStatus();
  }

  ngAfterViewInit(): void {
    // assign paginator and sort after view init
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  loadTicketStatus() {
    this.ticketstatusservice.getTicketStatus().subscribe(res => {
      this.dataSource.data = res.data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openTicketStatusDialog(editUser?: any) {
    if (this.dialog.openDialogs && this.dialog.openDialogs.length > 0) {
      return;
    }
    const dialogRef = this.dialog.open(TicketStatusDialogComponent, {
      width: '500px',
      //disableClose: true,
      panelClass: 'custom-dialog',
      data: editUser ? { row: editUser } : null
    });

    dialogRef.afterClosed().subscribe(refresh => {
      if (refresh) this.loadTicketStatus();
    });
  }


  // funcrion for toggle status

  onchangeStatus(row: any, checked: boolean) {
   
    const newStatus = checked ? 1 : 2;
   row.status_id = newStatus;
    this.ticketstatusservice.updateTicketStatus({
      ticketstatus_id: row.ticketstatus_id,
      status_id: newStatus
    }).subscribe(() => {

      // Update UI after DB update
      row.status_id = newStatus;

    });
  }
  // changeStatus(row: any, checked: boolean) {
  //   const newStatus = checked ? 1 : 2;

  //   this.ticketstatusservice.updateTicketStatus(
  //     row.ticketstatus_id,
  //     { status_id: newStatus }
  //   ).subscribe(() => {
  //     row.status_id = newStatus;
  //   });
  // }


  editUser(element: any) {
    this.openTicketStatusDialog(element);
  }


 deleteticketstatus(element: any) {
    Swal.fire({
        title: 'Are you sure?',
        // text: `You want to delete ${element.usergroupname}`,
        icon: 'warning',
        width: '350px',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'var(--formbutton-color)',
        cancelButtonColor: '#be9a9aff',
        background: 'var(--tableheader)',
        customClass: {
          closeButton: 'custom-close-button'
        }
      }).then((result) => {
    
        if (!result.isConfirmed) return;
                const params = { ticketstatus_id: element.ticketstatus_id };

    
        this.ticketstatusservice.deleteTicketStatus(params).subscribe({
         next: (res: any) => {

  if (!res.success) {
    Swal.fire('Warning', res.message, 'warning');
    return;
  }

  // ✅ Use backend message
  this.snackBar.open(res.message, 'Close', {
    duration: 2000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
    panelClass: ['success-snackbar']
  });

  this.loadTicketStatus();
},
    
          //  SERVER / NETWORK ERROR
          error: (err) => {
            console.error('Delete error:', err);
            Swal.fire('Error', 'Failed to delete Ticket Status', 'error');
          }
        });
      });
    }
    
  // deleteUser(element: any) {
  //   if (!confirm('Delete this status?')) return;

  //   this.ticketstatusservice.deleteTicketStatus({
  //     ticketstatus_id: element.ticketstatus_id
  //   }).subscribe(() => this.loadTicketStatus());
  // }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@Component({
  selector: 'app-ticketstatusDialog',
  templateUrl: './ticketstatusDialog.component.html',
  styleUrls: ['./ticketstatusDialog.component.css'],
})
export class TicketStatusDialogComponent implements OnInit {

  registrationForm!: FormGroup;
  isEdit = false;
  editingUser: any = null;

  constructor(
    private fb: FormBuilder,
    private ticketstatusservice: TicketStatusService,
    public dialogRef: MatDialogRef<TicketStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {

    this.editingUser = this.data?.row;
    this.isEdit = !!this.editingUser;

    this.registrationForm = this.fb.group({
      statusname: [this.editingUser?.statusname || '', Validators.required],
      remarks: [this.editingUser?.remarks || ''],
      color: [this.editingUser?.color || '#000000ff'],   // HEX
      status: [this.editingUser?.status || 'Active']
    });
  }

  submitForm() {
    this.registrationForm.markAllAsTouched();
    if (this.registrationForm.invalid) return;
    const formValue = this.registrationForm.value;


    if (this.isEdit && this.editingUser?.ticketstatus_id) {
      const payload = {
        ticketstatus_id: this.editingUser.ticketstatus_id,
        ...formValue
      };
      this.ticketstatusservice.updateTicketStatus(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: err => {
          if (err.status === 409) {
            this.registrationForm
              .get('statusname')
              ?.setErrors({ duplicate: true });
          }
        }
      });
    } else {
      // const payload = {
      //   ...formValue   //  NO ticketstatus_id for insert
      // };
      this.ticketstatusservice.saveTicketStatus(formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: err => {
          if (err.status === 409) {
            this.registrationForm
              .get('statusname')
              ?.setErrors({ duplicate: true });
          }

        }
      });
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}