import { Component, OnInit, Inject ,AfterViewInit,ViewChild} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { TickettagService } from '../../services/tickettag.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';




@Component({
  selector: 'app-ticket-Tag',
  templateUrl: './priority-tag.component.html',
  styleUrls: ['./priority-tag.component.css']
})
export class PriorityTagComponent implements OnInit {

  prioritytagselectedId: number;

  constructor(@Inject(MatDialog) private dialog: MatDialog,
    private tickettagservice: TickettagService,
    @Inject(MatSnackBar) private snackBar: MatSnackBar

  ) { }




  tagdisplayedColumns: string[] = [
    'sno',
    'tickettag',
    'remarks',
    'status',
    'edit',
    'delete'

  ];




  tagDataSource = new MatTableDataSource<any>();
       @ViewChild(MatPaginator) paginator!: MatPaginator;
      @ViewChild(MatSort) sort!: MatSort;
    



  ngOnInit(): void {
    this.gettickettag();
  }
     ngAfterViewInit(): void {
    // assign paginator and sort after view init
    this.tagDataSource.paginator = this.paginator;
    this.tagDataSource.sort = this.sort;
  }

  gettickettag(): void {
    this.tickettagservice.getTicketTag().subscribe(response => {
      this.tagDataSource.data = response.data || []; // <--- use .data
      console.log('Tags from backend:', this.tagDataSource.data);
    });
  }


  // TOGGLE STATUS function
  changeStatus(row: any, checked: boolean) {
    const newStatus = checked ? 1 : 2;

    this.tickettagservice.updateTicketTag(
      row.tickettag_id,
      { status_id: newStatus }
    ).subscribe(() => {

      // Update UI after DB update
      row.status_id = newStatus;

    });
  }

  deletetag(row: any) {
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
    
        this.tickettagservice.deleteTag(row.tickettag_id).subscribe({
    
          next: (res: any) => {
    
            //  SUCCESS DELETE
            if (res.success) {
              this.snackBar.open(res.message, 'Close', {
                duration: 2000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              });
    
             this.gettickettag();          }
    
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
            Swal.fire('Error', 'Server error occurred', 'error');
          }
        });
      });
    }
  

  // deletetag(tickettag_id: number): void {
  //   this.tickettagservice.deleteTag(tickettag_id).subscribe(() => {
  //     this.gettickettag();
  //   });
  // }


  // EDIT METHOD
  edittickettag(row: any): void {

    const dialogRef = this.dialog.open(PriorityTagFormComponent, {
      panelClass: 'custom-dialog',
      data: row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.gettickettag();
      }
    });
  }





  openTagDialog(): void {
    const dialogRef = this.dialog.open(PriorityTagFormComponent, {
      panelClass: 'custom-dialog',

      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.gettickettag(); // reload table/list
      }
    });
  }
}










@Component({
  selector: 'app-priority-tag-form',
  templateUrl: './priority-tag-form.html',
  styleUrls: ['./priority-tag.component.css'],
})
export class PriorityTagFormComponent implements OnInit {
  isEdit: false;

  tickettagform!: FormGroup;
  isEditMode = false;

  constructor(
    @Inject(MatDialogRef) private dialogRef: MatDialogRef<PriorityTagFormComponent>,
    private tickettagservice: TickettagService,
    @Inject(MAT_DIALOG_DATA) public data: any,// for tranferring form data to other component
  ) { }

  ngOnInit(): void {
    this.tickettagform = new FormGroup({
      tickettag: new FormControl('', Validators.required),
      remarks: new FormControl(''),
      status_id: new FormControl(1, Validators.required),
    });




    if (this.data) {
      this.tickettagform.patchValue(this.data);// for showing data to form
    }
  }







  onClose(): void {
    this.dialogRef.close();
  }
  onSubmit(): void {
    if (this.tickettagform.invalid) {
      this.tickettagform.markAllAsTouched();
      return;
    }

    const formValue = this.tickettagform.value;

    // ================= EDIT =================
    if (this.data && this.data.tickettag_id) {
      console.log('edited Submitting:', formValue);

      this.tickettagservice.updateTicketTag(this.data.tickettag_id, formValue)
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => {

          }
        });

    }
    // ================= CREATE =================
    else {
      this.tickettagservice.addTicketTag(formValue)
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => {
            if (err.status === 409) { // duplicate detected by backend
              this.tickettagform.get('tickettag')?.setErrors({ duplicate: true });
            }
          }
        });
    }
  }

}