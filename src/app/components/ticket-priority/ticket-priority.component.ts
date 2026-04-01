import { Component, OnInit, Inject ,AfterViewInit,ViewChild} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { TicketpriorityService } from '../../services/ticketpriority.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

// Ticket Priority List Component 
@Component({
  selector: 'app-ticket-priority',
  templateUrl: './ticket-priority.component.html',
  styleUrls: ['./ticket-priority.component.css']
})
export class TicketPriorityComponent implements OnInit {

  priorityselectedId!: number;

  displayedColumns: string[] = [
    'sno',
    'icon',
    'priority',
    'remarks',
    'status',
    'edit',
    'actions'
  ];

  iconMap: any = {
    1: { name: 'warning', color: 'red' },
    2: { name: 'arrow_upward', color: 'red' },
    3: { name: 'keyboard_arrow_up', color: 'red' },
    4: { name: 'keyboard_arrow_down', color: 'green' },
    5: { name: 'remove', color: 'yellow' },
    6: { name: 'keyboard_double_arrow_up', color: 'red' }

  };

  priorityDataSource = new MatTableDataSource<any>();
       @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
  
 

  constructor(
    private dialog: MatDialog,
    private ticketpriorityservice: TicketpriorityService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getticketpriority();
  }
    ngAfterViewInit(): void {
    // assign paginator and sort after view init
    this.priorityDataSource.paginator = this.paginator;
    this.priorityDataSource.sort = this.sort;
  }

  getticketpriority(): void {
    this.ticketpriorityservice.getTicketPriority().subscribe(response => {
      this.priorityDataSource.data = response.data || [];
      console.log('Projects from backend:', this.priorityDataSource.data);
    });
  }
  

 deleteticketpriority(row: any) {
  Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${row.usergroupname}`,
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
  
      this.ticketpriorityservice.deleteTicketPriority(row.priority_id).subscribe({
  
        next: (res: any) => {
  
          //  SUCCESS DELETE
          if (res.success) {
            this.snackBar.open('Ticket Priority deleted successfully', 'Close', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
  
           this.getticketpriority();          }
  
          //  BLOCKED (assigned users)
          else {
            Swal.fire({
              title: 'Cannot Delete',
              text: res.message,
              icon: 'warning',
              confirmButtonColor: 'var(--formbutton-color)'
            });
          }
        },
  
        //  SERVER / NETWORK ERROR
        error: (err) => {
          console.error('Delete error:', err);
          Swal.fire('Error','Failed to delete Ticket Priority', 'error');
        }
      });
    });
  }
  
    
 
  // deleteticketpriority(priority_id: number): void {
  //   this.ticketpriorityservice.deleteTicketPriority(priority_id).subscribe(() => {
  //     this.getticketpriority();
  //   });
  // }


  // for status active or inactive 
  changeStatus(row: any, checked: boolean) {
    const newStatus = checked ? 1 : 2;

    this.ticketpriorityservice.updateTicketPriority(
      row.priority_id,
      { status_id: newStatus }
    ).subscribe(() => {

      // Update UI after DB update
      row.status_id = newStatus;

    });
  }

  editticketpriority(row: any): void {
    this.priorityselectedId = row.priority_id;

    const dialogRef = this.dialog.open(TicketPriorityFormComponent, {
      width: '500px',
      data: row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getticketpriority();
      }
    });
  }

  openPriorityDialog(): void {
    const dialogRef = this.dialog.open(TicketPriorityFormComponent, {
           width: '500px',

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getticketpriority();
      }
    });
  }
}

// Ticket Priority Form Component 
@Component({
  selector: 'app-priority-form',
  templateUrl: './ticket-priority-form.html',
  styleUrls: ['./ticket-priority.component.css'],
})
export class TicketPriorityFormComponent implements OnInit {

  priorityform!: FormGroup;
    isEditMode = false;
    

  constructor(
    private dialogRef: MatDialogRef<TicketPriorityFormComponent>,
    private ticketpriorityservice: TicketpriorityService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.priorityform = new FormGroup({
      priority: new FormControl('', Validators.required),
      remarks: new FormControl(''),
      status_id: new FormControl(1, Validators.required),
      icon: new FormControl()
    });

         if (this.data && this.data.priority_id) {
      this.isEditMode = true; 
      this.priorityform.patchValue(this.data);// for showing data to form
    }
  }


  onClose(): void {
    this.dialogRef.close();
  }




  onSubmit(): void {
    if (this.priorityform.invalid) {
      this.priorityform.markAllAsTouched();
      return;
    }

    const formValue = this.priorityform.value;

    if (this.data && this.data.priority_id) {
      console.log('edited Submitting:', formValue);

      this.ticketpriorityservice
        .updateTicketPriority(this.data.priority_id, formValue)
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => {

          }
        });

    }
    else {
      this.ticketpriorityservice
        .addTicketPriority(formValue)
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => {
            if (err.status === 409) { // Backend detects duplicate
              this.priorityform
                .get('priority')
                ?.setErrors({ duplicate: true });
            }
          }
        });
    }
  }
}
