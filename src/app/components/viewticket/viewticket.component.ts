import { Component, OnInit, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { IssueTicketService } from '../../services/issueticket.service';
import { NoteAttachmentService } from 'src/app/services/note-attachment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AttachmentService } from 'src/app/services/attachment.service';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ShowImageDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';
import { env } from 'process';
import { environment } from 'src/environments/environment';
import { tick } from '@angular/core/testing';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-issue-ticket',
  templateUrl: './viewticket.component.html',
  styleUrls: ['./viewticket.component.css']
})
export class ViewTicketComponent implements OnInit {


  constructor(
    private issueticketService: IssueTicketService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  displayedColumns: string[] = [
    'select',
    'sno',
    'icons',
    'tag_names',
    'ticket_number',
    'created_at',
    'created_by',
    'user_id',
    'ticketstatus_id',
    'summary',
    'image_path',
    'edit',
    'delete'

  ];

  iconMap: any = {
    1: { name: 'warning', color: 'red' },
    2: { name: 'arrow_upward', color: 'red' },
    3: { name: 'keyboard_arrow_up', color: 'red' },
    4: { name: 'keyboard_arrow_down', color: 'green' },
    5: { name: 'remove', color: 'yellow' },
    6: { name: 'keyboard_double_arrow_up', color: 'red' }
  };
  imagePath: any;

  issueticketDataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  
  filterForm!: FormGroup;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  priorities: any[] = [];
  tickettypes: any[] = [];
  statuses: any[] = [];
  tag: any[] = [];
  allDataForExcel: any[] = []; // same data exported to Excel
  storedProjectId: string | null = null;
  projectId: number | null = null;
  projectUsers: any[] = [];

  ngOnInit(): void {
    this.storedProjectId = localStorage.getItem('selectedProject');
    this.projectId = this.storedProjectId ? Number(this.storedProjectId) : null;

    this.getIssueTicket();
    this.loadPriorities();
    this.loadStatuses();
    this.loadTags();
    this.loadTicketTypes();
    this.loadUsersByProject();
    console.log("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",this.projectUsers)

    //  const params = new URLSearchParams(window.location.search);
    //   const statusId = Number(params.get('statusId'));

    //   this.issueticketService.getIssueTicket().subscribe(res => {
    //     let data = res.data || [];

    //     if (statusId) {
    //       data = data.filter(t => t.ticketstatus_id === statusId);
    //     }

    //     this.issueticketDataSource.data = data;
    //   });

    this.filterForm = new FormGroup({
      searchtext: new FormControl(''),
      filterType: new FormControl('0'),
      filterValuePriority: new FormControl('0'),
      filterValueStatus: new FormControl('0'),
      filterValueType: new FormControl('0'),
      filterValueTag: new FormControl([]),
      filterValueUser:new FormControl('0'),
      filterValueDate: new FormControl('0'),
      bulkStatusControl : new FormControl('0'),
      fromDate: new FormControl(null),
      toDate: new FormControl(null)
    });
  }
  ngAfterViewInit(): void {
    // assign paginator and sort after view init
    this.issueticketDataSource.paginator = this.paginator;
    this.issueticketDataSource.sort = this.sort;
  }

  loadPriorities() {
    this.issueticketService.getTicketPriorities()
      .subscribe(res => this.priorities = res.data);
  }

  isAllSelected() {
  const numSelected = this.selection.selected.length;
  const numRows = this.issueticketDataSource.data.length;
  return numSelected == numRows;
}

/** Selects all rows if they are not all selected; otherwise clear selection. */
masterToggle() {
  this.isAllSelected() ?
      this.selection.clear() :
      this.issueticketDataSource.data.forEach(row => this.selection.select(row));
}

selectBoxStatusUpdate() {
  const selectedIds = this.selection.selected.map(row => row.issueticket_id);
  const statusId = this.filterForm.get('bulkStatusControl')?.value;

  if (!statusId || statusId === '0') {
    this.snackBar.open('Please select a status', 'Close', { duration: 3000 });
    return;
  }

  const payload = {
    ticket_ids: selectedIds,
    status_id: statusId
  };

  this.issueticketService.selectBoxStatusUpdate(payload).subscribe({
    next: (res) => {
      console.log('Success:', res);
      this.snackBar.open('Status updated successfully', 'Close', { duration: 3000 });
      this.selection.clear();
      this.filterForm.get('bulkStatusControl')?.setValue('0');
      this.getIssueTicket();
    },
    error: (err) => {
      console.error('Error:', err);
      this.snackBar.open('Update failed', 'Close', { duration: 3000 });
    }
  });
}



  loadTicketTypes() {
    this.issueticketService.getTicketType()
      .subscribe(res => {
        this.tickettypes = res.data;
      });
  }


loadUsersByProject() {
  this.issueticketService.getUsersByProject({ project_id: this.projectId })
    .subscribe(res => {
      this.projectUsers = res.data;
      console.log("function is working", res.data); 
    });
}

  loadStatuses() {
    this.issueticketService.getTicketStatuses()
      .subscribe(res => this.statuses = res.data);
  }

  loadTags() {
    this.issueticketService.getTicketTags()
      .subscribe(res => this.tag = res.data);
  }

  // getIssueTicket() {
  //   this.issueticketService.getIssueTicket(this.projectId )
  //     .subscribe(res => {
  //       const data = (res.data || []).map((row: any) => {
  //         let imageArr: string[] = [];

  //         // if (row.image_path) {
  //         //   imageArr = row.image_path
  //         //     .replace('{', '')
  //         //     .replace('}', '')
  //         //     .replace(/"/g, '')
  //         //     .split(',');
  //         // }
  //         if (row.image_path) {

  //           if (typeof row.image_path === 'string') {
  //             imageArr = row.image_path
  //               .replace('{', '')
  //               .replace('}', '')
  //               .replace(/"/g, '')
  //               .split(',');
  //           }
  //           // FIX: If it is already an array, just use it
  //           else if (Array.isArray(row.image_path)) {
  //             imageArr = row.image_path;
  //           }
  //         }

  //         return {
  //           ...row,
  //           image_path: imageArr
  //         };
  //       });

  //       this.issueticketDataSource.data = data;
  //       console.log('FINAL DATA:', data);
  //     });
  // }



  getIssueTicket() {
    const projectparams: { projectid?: number } = {};

    // Send projectid only if NOT "All"
    if (this.projectId && this.projectId !== 0) {
      projectparams.projectid = this.projectId;
    }

    console.log('Parameters sent to backend:', projectparams);

    this.issueticketService.getIssueTicket(projectparams)
      .subscribe(res => {

        const data = (res.data || []).map((row: any) => {
          let imageArr: string[] = [];

          if (row.image_path) {
            if (typeof row.image_path === 'string') {
              imageArr = row.image_path
                .replace('{', '')
                .replace('}', '')
                .replace(/"/g, '')
                .split(',');
            } else if (Array.isArray(row.image_path)) {
              imageArr = row.image_path;
            }
          }

          return {
            ...row,
            image_path: imageArr
          };
        });

        this.issueticketDataSource.data = data;
        console.log('FINAL DATA:', data);
      });
  }


  openImages(images: string[]) {
    this.dialog.open(ShowImageDialogComponent, {
      data: images,
      width: '900px',
      autoFocus: false
    });
  }

  getFilter() {
    const filters = {
      ...this.filterForm.value,
      projectId: this.projectId   // add projectId here
    };

    this.issueticketService.getfilter(filters)
      .subscribe(res => {
        this.issueticketDataSource.data = res.data || [];
        console.log("Filtered data:", res.data);
      });
  }
  downloadExcel() {
    console.log('STEP 1: Button clicked');

    const filters = {
      ...this.filterForm.value,
      fromDate: this.filterForm.value.fromDate
        ? this.filterForm.value.fromDate.toISOString()
        : null,
      toDate: this.filterForm.value.toDate
        ? this.filterForm.value.toDate.toISOString()
        : null

    };
    if (this.storedProjectId) {
      filters.project_id = this.storedProjectId;
    }

    console.log('STEP 1 Filters:', filters);
    console.log("Downloading Excel with filters:", filters);
    this.issueticketService.downloadExcel(filters)
      .subscribe((blob: Blob) => {
        console.log('STEP 2: Received blob from service', blob);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Filtered_Tickets.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('Excel download initiated');

      }, error => {
        console.error('Excel download failed !!!!!!!!!!!!!***!!!!!!!!!!!', error);
      });
  }

  downloadPdf() {
    const tickets = this.issueticketDataSource.data;
    console.log('Tickets:', tickets);

    if (!tickets || tickets.length === 0) {
      alert('No data to export');
      return;
    }

    this.issueticketService.downloadPdf(tickets)
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');   // SHOW PDF
      }, error => {
        console.error('PDF error', error);
        alert('Failed to generate PDF');
      });
  }

  // getExcel() {
  //   // const from = this.filterForm.value.fromDate;
  //   // const to = this.filterForm.value.toDate;

  //   // API call OR local filter
  //   this.issueticketService.getExcelData(this.filterForm.value).subscribe((res: any[]) => {
  //     // this.filteredData = res;      // show in table
  //     this.allDataForExcel = res;   // store for Excel
  //   });
  // }

  deleteIssue(row: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete ' + row.tag_names,
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

        this.issueticketService.deleteIssueTicket(row.issueticket_id).subscribe({
          next: () => {
            //  Snackbar 
            this.snackBar.open('View Ticket deleted successfully', 'Close', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });

            //  Auto refresh 
            this.getIssueTicket();
          },

          error: (err) => {
            console.error('Delete error', err);
            Swal.fire('Error', 'Failed to delete view ticket', 'error');
          }
        });
      }
    });
  }
  // deleteIssueTicket(issueticket_id: number) {
  //   this.issueticketService.deleteIssueTicket(issueticket_id)
  //     .subscribe(() => this.getIssueTicket());
  // }

  searchAll(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.issueticketDataSource.filter = value.trim().toLowerCase();
  }


  previewIssue(row: any) {
    const dialogRef = this.dialog.open(ViewTicketFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog',
      data: row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getIssueTicket();
      }
    });
  }
  //  EDIT 
  editISSUE(row: any) {
    const dialogRef = this.dialog.open(EditNoteComponent, {
      width: '900px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog',
      data: row // pass all tickets for dropdowns
    });
    console.log('Opening edit dialog with data+++++++++++++++++=:', row);
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getIssueTicket();
      }
    });
  }

}


/* =========================================================
   EDIT FORM COMPONENT (NO CREATE)
========================================================= */

@Component({
  selector: 'app-issue-ticket-form',
  templateUrl: './viewticket-form.html',
  styleUrls: ['./viewticket.component.css']
})
export class ViewTicketFormComponent implements OnInit {

  issueTicketForm!: FormGroup;

  statuses: any[] = [];
  priorities: any[] = [];
  tags: any[] = [];

  iconMap: any = {
    1: { name: 'warning', color: 'red' },
    2: { name: 'arrow_upward', color: 'red' },
    3: { name: 'keyboard_arrow_up', color: 'red' },
    4: { name: 'keyboard_arrow_down', color: 'green' },
    5: { name: 'remove', color: 'yellow' }
  };

  get selectedPriority() {
    const id = this.issueTicketForm.get('priority_id')?.value;
    return this.priorities.find(p => p.priority_id === id);
  }

  constructor(
    private issueticketService: IssueTicketService,
    private dialogRef: MatDialogRef<ViewTicketFormComponent>,
    private attachmentService: AttachmentService,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {

    this.issueTicketForm = new FormGroup({
      ticketstatus_id: new FormControl(''),
      priority_id: new FormControl(''),
      ticket_tag: new FormControl(''),
      summary: new FormControl(''),
      description: new FormControl('')
    }); console.log('RAW dialog data:', this.data);

    //  PATCH DATA FOR EDIT
    if (this.data) {
      this.issueTicketForm.patchValue(this.data);
    }

    this.loadStatuses();
    this.loadPriorities();
    this.loadTags();
  }

  loadStatuses() {
    this.issueticketService.getTicketStatuses()
      .subscribe(res => this.statuses = res.data);
  }

  loadPriorities() {
    this.issueticketService.getTicketPriorities()
      .subscribe(res => this.priorities = res.data);
  }

  loadTags() {
    this.issueticketService.getTicketTags()
      .subscribe(res => this.tags = res.data);
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  //  UPDATE ONLY (NO CREATE LOGIC)
  onSubmit(): void {
    if (!this.data?.issueticket_id) {
      return;
    }

    this.issueticketService
      .updateIssueTicket(this.data.issueticket_id, this.issueTicketForm.value)
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }


}


////////////////////////////////////////////////////////////////////////////////////////////////////////////


@Component({
  selector: 'edit-note',
  templateUrl: './edit-note.component.html',
  styleUrls: ['./edit-note.component.css']
})
export class EditNoteComponent implements OnInit {

  tickets: any;
  issueTicketForm!: FormGroup;
  isEditMode: boolean = false;
  users: any[] = [];
  statuses: any[] = []
  noTags: any;
  notes: any;
  loggedInUser: any;
  imagePath: any;
  selectedFileNames: string[] = [];
  selectedFiles: File[] = [];
  today: any;
  userId: number | null = null;
  newNoteText: string;
  uploadedPaths: string[] = [];
  isaddingNote: boolean;


  imageBaseUrl = environment.ServerApi + 'uploads/';
  activities: any;
  constructor(public dialogRef: MatDialogRef<EditNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog,
    private issueticketService: IssueTicketService, private NoteAttachmentService: NoteAttachmentService
  ) { }
  onclose(): void {
    this.dialogRef.close(true);
  }

  iconMap: any = {
    1: { name: 'warning', color: 'red' },
    2: { name: 'arrow_upward', color: 'red' },
    3: { name: 'keyboard_arrow_up', color: 'red' },
    4: { name: 'keyboard_arrow_down', color: 'green' },
    5: { name: 'remove', color: 'yellow' }
  };
  ngOnInit(): void {
    this.tickets = this.data?.tickets || [];
    console.log('Tickets in dialog:', this.tickets);
    this.today = new Date();

    // const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userData = localStorage.getItem('user');
    const userIdData = localStorage.getItem('user_id');
    console.log('User data from localStorage:', userData);
    console.log('User ID from localStorage:', userIdData);
    if (userData) {
      const user = JSON.parse(userData);
      this.userId = user.userid;

      this.loggedInUser = user.fullname;
      console.log('Logged in user:', this.loggedInUser, 'ID:', this.userId);
    } else {
      console.warn('No user found in localStorage');
    }

    if (userIdData) {
      const userIdNum = JSON.parse(userIdData);
      this.userId = userIdNum;
      console.log('Parsed user ID:', this.userId);
    } else {
      console.warn('No user_id found in localStorage');
    }
    this.issueTicketForm = new FormGroup({

      ticketstatus_id: new FormControl(null, Validators.required),
      assigned_user_id: new FormControl(null, Validators.required)
    });
    console.log('Raw data value:', this.data.assigned_user_id, 'Type:', typeof this.data.assigned_user_id);
    this.issueTicketForm.get('assigned_user_id')?.valueChanges.subscribe(v => {
      console.log('Assigned user changed →', v);
    });

    this.issueTicketForm.get('ticketstatus_id')?.valueChanges.subscribe(v => {
      console.log('Status changed →', v);
    });


    console.log('Initial form values:', this.issueTicketForm.value);
    console.log('Current user ID:', this.userId);
    console.log('Current ticket ID:', this.data.issueticket_id);
    console.log('Existing uploaded paths:', this.uploadedPaths);
    console.log('TTTTTTTTTTT', this.loggedInUser)
    console.log('All data being sent:', {
      issueticket_id: this.data.issueticket_id,
      note: this.newNoteText,
      updated_by: this.userId,
      attachments: this.uploadedPaths
    });

    this.getIssueTicket();
    this.loadUsers();
    this.loadStatuses();
    this.loadNotes();
    this.loadActivities();
    this.issueTicketForm.valueChanges.subscribe(v => {
      console.log('FORM CHANGED →', v);
    });
  }

  getIssueTicket() {
    this.issueticketService.getIssueTicket(this.data.issueticket_id).subscribe({
      next: (res: any) => {
        console.log('Ticket response:', res);

        // IMPORTANT: adjust based on API response shape
        this.tickets = res.data;
        console.log('Tickets set in component:', this.tickets);
      },
      error: (err) => {
        console.error('Failed to load tickets', err);
      }

      
    });
  }


  onAssignedUserChange(event: any) {
  if (event.value) {
    this.issueTicketForm.patchValue({
      ticketstatus_id: 8
    });
  }
}
  loadUsers() {
    this.issueticketService.getTicketUsers()
      .subscribe(res => {
        this.users = res.data;
        console.log("users in frontend", res.data);

        if (this.data?.assigned_user_id) {
          this.issueTicketForm.patchValue({
            assigned_user_id: Number(this.data.assigned_user_id),

          });
        }

      });
  }


  loadStatuses() {
    this.issueticketService.getTicketStatuses()
      .subscribe(res => {
        this.statuses = res.data;
        if (this.data?.ticketstatus_id) {
          this.issueTicketForm.patchValue({
            ticketstatus_id: Number(this.data.ticketstatus_id)
          });
        }
      });
  }
  loadNotes() {
    this.NoteAttachmentService
      .getNoteTicket(this.data.issueticket_id)
      .subscribe((res: any) => {
        console.log('Notes response:++++++++++++', res);
        this.notes = (res.data || []).map((note: any) => ({
          ...note,
          attachments: Array.isArray(note.attachments)
            ? note.attachments
            : JSON.parse(note.attachments || '[]')
        }));
        console.log('Notes +++++++++++++++++++++++:', this.notes);
      });
  }

  loadActivities() {
    this.issueticketService.getActivities(this.data.issueticket_id)
      .subscribe((res: any) => {

        this.activities = res.data;
        console.log('Activities response +++++++ts++++++:', this.activities);
      });

  }


  onFileSelect(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
      this.selectedFileNames.push(files[i].name); // for UI display
    }

    // Reset input so the same file can be selected again if needed
    event.target.value = '';
  }


  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.selectedFileNames.splice(index, 1);
  }
  uploadFiles(files: FileList) {
    const formData = new FormData();

    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    this.NoteAttachmentService.uploadImage(formData).subscribe({
      next: (res: any) => {
        console.log('Upload response:', res);
        this.uploadedPaths = res.image_paths;
        this.selectedFiles = []; // clear after upload
      },
      error: err => console.error('Upload failed', err)
    });
  }

  openImage(filename: string): void {
    this.dialog.open(NotePreviewDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: {
        imageUrl: this.imageBaseUrl + filename,
        filename
      }

    });
    console.log('Opening preview dialog with data:', {
      imageUrl: this.imageBaseUrl + filename,
      filename
    });
  }



  submitNote(): void {


    console.log('Selected User ID →',
      this.issueTicketForm.value.assigned_user_id
    );
    const ticketPayload = {
      issueticket_id: this.data.issueticket_id,
      ticketstatus_id: this.issueTicketForm.value.ticketstatus_id,
      assigned_user_id: this.issueTicketForm.value.assigned_user_id,
      updated_by: this.userId
    };

    console.log('Ticket update payload:', ticketPayload);

    this.issueticketService
      .updateTicket(this.data.issueticket_id, ticketPayload)
      .subscribe(() => {
        console.log('Ticket updated successfully', ticketPayload);
        this.dialogRef.close(true);

        this.saveNoteWithAttachments();


        this.loadActivities();
        this.getIssueTicket();
      });

    console.log('Submitting note with text:', this.newNoteText);
    console.log('Selected files:', this.selectedFiles);
    console.log('Current user ID:', this.userId);
    console.log('Current ticket ID:', this.data.issueticket_id);
    console.log('Existing uploaded paths:', this.selectedFileNames);
    console.log('All data being sent:', {
      issueticket_id: this.data.issueticket_id,
      note: this.newNoteText,
      updated_by: this.userId,
      attachments: this.selectedFileNames,

    });
  }

  private saveNoteWithAttachments(): void {
    if (!this.newNoteText && this.selectedFiles.length === 0) return;

    const saveNote = (paths: string[]) => {
      const payload = {
        issueticket_id: this.data.issueticket_id,
        note: this.newNoteText,
        updated_by: this.userId,
        updated_at: new Date().toISOString(),
        attachments: paths
      };
      console.log('Payload for saving note:', payload);
      this.NoteAttachmentService.addNoteTicket(payload).subscribe(() => {
        this.newNoteText = '';
        this.selectedFiles = [];
        this.selectedFileNames = [];
        this.uploadedPaths = [];
        this.loadNotes();
      });
    };

    // upload files first
    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      this.selectedFiles.forEach(file => formData.append('images', file));

      this.NoteAttachmentService.uploadImage(formData)
        .subscribe(res => {
          console.log('Upload response:', res.image_paths);

          saveNote(res.image_paths);
        });
    } else {
      saveNote([]);
    }
  }

  close(): void {
    this.dialogRef.close(true);
  }

}


////////////////////////////////////////////////////

@Component({
  selector: 'note-preview-dialog',
  templateUrl: './note-preview-dialog.component.html',
  styleUrls: ['./note-preview-dialog.component.css']
})
export class NotePreviewDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NotePreviewDialogComponent>
  ) {
    
   }

}
