import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { IssueTicketService } from '../../services/issueticket.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { AttachmentService } from 'src/app/services/attachment.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ShowImageDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';
import { tick } from '@angular/core/testing';
import { LiveticketService } from 'src/app/services/liveticket.service';
import { NotePreviewDialogComponent } from '../viewticket/viewticket.component';
import { NoteAttachmentService } from 'src/app/services/note-attachment.service';

interface User {
  id: number;
  email: string;
  fullname: string;
  usergroup_id: number;
}



@Component({
  selector: 'app-issue-ticket',
  templateUrl: './issue-ticket.component.html',
  styleUrls: ['./issue-ticket.component.css']
})
export class IssueTicketComponent implements OnInit, AfterViewInit {

  constructor(
    private issueticketService: IssueTicketService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  apiUrl = environment.ServerApi;

  displayedColumns: string[] = [
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

    // 'tickettype'
  ];

  iconMap: any = {
    1: { name: 'warning', color: 'red' },
    2: { name: 'arrow_upward', color: 'red' },
    3: { name: 'keyboard_arrow_up', color: 'red' },
    4: { name: 'keyboard_arrow_down', color: 'green' },
    5: { name: 'remove', color: 'yellow' }
  };

  issueticketDataSource = new MatTableDataSource<any>();
  filterForm!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  priorities: any[] = [];
  statuses: any[] = [];
  tag: any[] = [];
  storedProjectId: string | null = null;
  projectId: number | null = null;
  userData: number | null = null;
  userId: number | null = null;


  ngOnInit(): void {
    this.loadPriorities();
    this.loadStatuses();
    this.loadTags();



    const userData = JSON.parse(localStorage.getItem('user') || '{}') as User;
    this.userId = userData.id;

    this.storedProjectId = localStorage.getItem('selectedProject');
    console.log("selected project in issue ticket", this.storedProjectId);
    this.projectId = this.storedProjectId ? Number(this.storedProjectId) : null;
    this.getIssueTicket();
  }

  ngAfterViewInit(): void {
    this.issueticketDataSource.paginator = this.paginator;
    this.issueticketDataSource.sort = this.sort;
  }

  loadPriorities() {
    this.issueticketService.getTicketPriorities()
      .subscribe(res => {
        this.priorities = res.data;
      });
  }

  loadStatuses() {
    this.issueticketService.getTicketStatuses()
      .subscribe(res => {
        this.statuses = res.data;
      });
  }

  loadTags() {
    this.issueticketService.getTicketTags()
      .subscribe(res => {
        this.tag = res.data;
      });
  }
  // projectid: this.projectId,
  getIssueTicket() {
    const projectparams: { userid: number | null; projectid?: number } = {
      userid: this.userId
    };

    if (this.projectId && this.projectId !== 0) {
      projectparams.projectid = this.projectId;
    }

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
            }
            else if (Array.isArray(row.image_path)) {
              imageArr = row.image_path;
            }

            // FILTER OUT EMPTY STRINGS
            imageArr = imageArr.filter(img => img && img.trim() !== '');
          }

          return {
            ...row,
            image_path: imageArr
          };
        });

        console.log('FINAL DATA USED BY TABLE:', data); // check here
        this.issueticketDataSource.data = data;
      });
  }


  toggleImage(event: Event) {
    const img = event.target as HTMLElement;
    img.classList.toggle('big');
  }

  openImages(images: string[]) {
    this.dialog.open(ShowImageDialogComponent, {
      data: images,
      width: '900px',
      autoFocus: false
    });
  }



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
            this.snackBar.open('Issue Ticket deleted successfully', 'Close', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            this.getIssueTicket();
          },
          error: (err) => {
            console.error('Delete error', err);
            Swal.fire('Error', 'Failed to delete Issue Ticket', 'error');
          }
        });
      }
    });
  }

  searchAll(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.issueticketDataSource.filter = filterValue.trim().toLowerCase();
  }

  editISSUE(row: any) {
    const dialogRef = this.dialog.open(IssueTicketFormComponent, {
      width: '900px',
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

  openIssueTicketDialog(): void {
    const dialogRef = this.dialog.open(IssueTicketFormComponent, {
      width: '900px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getIssueTicket();
      }
    });
  }
}

/* ======================= FORM COMPONENT ======================= */

@Component({
  selector: 'app-issue-ticket-form',
  templateUrl: './issue-ticket-form.html',
  styleUrls: ['./issue-ticket.component.css']
})
export class IssueTicketFormComponent implements OnInit {

  issueTicketForm!: FormGroup;
  isEditMode = false;

  statuses: any[] = [];
  priorities: any[] = [];
  tags: any[] = [];
  tickettypes: any[] = [];
  users: any[] = [];

  storedProjectId: string | null = null;
  userId: number | null = null;
  loggedInUser: string = '';
  today = new Date();

  existingImages: string[] = [];
  deletedImages: string[] = [];
  selectedFiles: File[] = [];
  selectedFileNames: string[] = [];

  notes: any[] = [];
  activities: any[] = [];
  newNoteText: string = '';

  imageBaseUrl = environment.ServerApi + 'uploads/';

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
    private dialogRef: MatDialogRef<IssueTicketFormComponent>,
    private liveticketservice: LiveticketService,
    private dialog: MatDialog,
    private noteAttachmentService: NoteAttachmentService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.storedProjectId = localStorage.getItem('selectedProject');
    const projectId = this.storedProjectId ? Number(this.storedProjectId) : null;

    const userData = JSON.parse(localStorage.getItem('user') || '{}') as User;
    this.userId = userData?.id ?? null;
    this.loggedInUser = userData?.fullname ?? '';

    this.issueTicketForm = new FormGroup({
      ticket_number: new FormControl(''),
      ticketstatus_id: new FormControl('', Validators.required),
      priority_id: new FormControl('', Validators.required),
      tickettype: new FormControl(null, Validators.required),
      assigned_user_id: new FormControl(null),
      ticket_tag: new FormControl([], Validators.required),
      summary: new FormControl('', Validators.required),
      description: new FormControl(''),
      steps_to_reproduce: new FormControl(''),
      storedprojectId: new FormControl(projectId)
    });

    if (this.data?.issueticket_id) {
      // EDIT mode
      this.isEditMode = true;
      this.patchForm(this.data);
      this.existingImages = Array.isArray(this.data.image_path)
        ? [...this.data.image_path] : [];
      this.loadNotes();
      this.loadActivities();
     
    } else if (this.data?.live_ticket_id) {
      this.isEditMode = false;
      this.patchForm(this.data);
      this.existingImages = Array.isArray(this.data.image_path)
        ? [...this.data.image_path] : [];

    } else {
      this.isEditMode = false;
      this.existingImages = [];
      this.loadLatestTicketNumber();
    }

    this.loadStatuses();
    this.loadPriorities();
    this.loadTags();
    this.loadTicketTypes();
    this.loadUsers();
  }

  private patchForm(d: any): void {
    this.issueTicketForm.patchValue({
      ticket_number: d.ticket_number ?? '',
      ticketstatus_id: d.ticketstatus_id ?? '',
      priority_id: d.priority_id ?? '',
      tickettype: d.tickettype_id ?? null,
      assigned_user_id: d.assigned_user_id ?? null,
      ticket_tag: d.tag_ids ?? [],
      summary: d.summary ?? '',
      description: d.description ?? '',
      steps_to_reproduce: d.steps_to_reproduce ?? ''
    });
  }

  loadStatuses(): void {
    this.issueticketService.getTicketStatuses().subscribe(res => {
      this.statuses = res.data;
    });
  }

  loadPriorities(): void {
    this.issueticketService.getTicketPriorities().subscribe(res => {
      this.priorities = res.data;
    });
  }

  loadTags(): void {
    this.issueticketService.getTicketTags().subscribe(res => {
      this.tags = res.data;
    });
  }

  loadTicketTypes(): void {
    this.issueticketService.getTicketType().subscribe(res => {
      this.tickettypes = res.data;
    });
  }

  loadUsers(): void {
    this.issueticketService.getTicketUsers().subscribe(res => {
      this.users = res.data;
    });
  }

  loadLatestTicketNumber(): void {
    this.issueticketService.getLatestTicketNumber().subscribe(res => {
      this.issueTicketForm.patchValue({ ticket_number: res.data.ticket_number });
    });
  }

  loadNotes(): void {
    if (!this.data?.issueticket_id) return;

    this.noteAttachmentService.getNoteTicket(this.data.issueticket_id)
      .subscribe((res: any) => {
        this.notes = (res.data || []).map((note: any) => ({
          ...note,
          attachments: Array.isArray(note.attachments)
            ? note.attachments
            : JSON.parse(note.attachments || '[]')
        }));
      });
  }

  loadActivities(): void {
    if (!this.data?.issueticket_id) return;

    this.issueticketService.getActivities(this.data.issueticket_id)
      .subscribe((res: any) => {
        this.activities = res.data ?? [];
      });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      this.selectedFiles.push(file);
      this.selectedFileNames.push(file.name);
    });
    input.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.selectedFileNames.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    const [removed] = this.existingImages.splice(index, 1);
    this.deletedImages.push(removed);
    this.existingImages = [...this.existingImages];
  }

  openImage(filename: string): void {
    this.dialog.open(NotePreviewDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { imageUrl: this.imageBaseUrl + filename, filename }
    });
  }

  onSubmit(): void {
    if (this.issueTicketForm.invalid) return;

    const persist = (uploadedPaths: string[]) => {
      const payload = {
        ...this.issueTicketForm.value,
        // keep backend field name consistent
        assigned_user_id: this.issueTicketForm.value.assigned_user_id,

        user_id: this.issueTicketForm.value.assigned_user_id ?? null,
        image_path: [...this.existingImages, ...uploadedPaths],
        deleted_images: this.deletedImages,
        reported_by: this.userId,
        updated_by: this.userId,
      };

      if (this.isEditMode) {
        this.issueticketService
          .updateTicket(this.data.issueticket_id, payload)
          .subscribe(() => this.dialogRef.close(true));
      } else {
        this.issueticketService.addIssueTicket(payload).subscribe(() => {
          if (this.data?.live_ticket_id) {
            this.liveticketservice.markAsConverted(this.data.live_ticket_id)
              .subscribe();
          }
          this.dialogRef.close(true);
        });
      }
    };

    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      this.selectedFiles.forEach(f => formData.append('images', f));

      this.noteAttachmentService.uploadImage(formData).subscribe({
        next: (res: any) => persist(res.image_paths ?? []),
        error: err => console.error('Image upload failed', err)
      });
    } else {
      persist([]);
    }
  }

  saveNote(): void {
    if (!this.newNoteText?.trim() && this.selectedFiles.length === 0) return;

    const commitNote = (paths: string[]) => {
      const payload = {
        issueticket_id: this.data.issueticket_id,
        note: this.newNoteText,
        updated_by: this.userId,
        updated_at: new Date().toISOString(),
        attachments: paths
      };

      this.noteAttachmentService.addNoteTicket(payload).subscribe(() => {
        this.newNoteText = '';
        this.selectedFiles = [];
        this.selectedFileNames = [];
        this.loadNotes();
      });
    };

    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      this.selectedFiles.forEach(f => formData.append('images', f));

      this.noteAttachmentService.uploadImage(formData).subscribe({
        next: (res: any) => commitNote(res.image_paths ?? []),
        error: err => console.error('Note upload failed', err)
      });
    } else {
      commitNote([]);
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  onclose(): void {
    this.dialogRef.close(false);
  }
}