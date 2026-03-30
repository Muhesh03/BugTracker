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
  selectedFile!: File;
  fileName = '';

  statuses: any[] = [];
  priorities: any[] = [];
  tags: any[] = [];
  tickettypes: any[] = [];
  users: any[] = [];
  storedProjectId: string | null = null;
  imagePaths: string[] = [];
  userData: number | null = null;
  userId: number | null = null;


  iconMap: any = {
    1: { name: 'warning', color: 'red' },
    2: { name: 'arrow_upward', color: 'red' },
    3: { name: 'keyboard_arrow_up', color: 'red' },
    4: { name: 'keyboard_arrow_down', color: 'green' },
    5: { name: 'remove', color: 'yellow' }
  };

  issueticketDataSource: any;
  imagePath: any;
  selectedFileNames: string[] = [];
  selectedFiles: File[] = [];
  existingImages: string[] = [];
  deletedImages: string[] = [];



  get selectedPriority() {
    const id = this.issueTicketForm.get('priority_id')?.value;
    return this.priorities.find(p => p.priority_id === id);
  }

  constructor(
    private issueticketService: IssueTicketService,
    private dialogRef: MatDialogRef<IssueTicketFormComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {

    this.storedProjectId = localStorage.getItem('selectedProject');
    const projectId = this.storedProjectId ? Number(this.storedProjectId) : null;

    const userData = JSON.parse(localStorage.getItem('user') || '{}') as User;
    this.userId = userData.id;

    this.issueTicketForm = new FormGroup({
      ticketstatus_id: new FormControl('', Validators.required),
      user_id: new FormControl(null),
      priority_id: new FormControl('', Validators.required),
      ticket_tag: new FormControl([]),
      tickettype: new FormControl(null, Validators.required),
      summary: new FormControl('', Validators.required),
      description: new FormControl(''),
      ticket_number: new FormControl(''),
      storedprojectId: new FormControl(projectId),
      steps_to_reproduce: new FormControl('')
    });

    if (this.data && this.data.issueticket_id) {

      this.isEditMode = true;

      this.issueTicketForm.patchValue({

        ticket_number: this.data.ticket_number,
        ticketstatus_id: this.data.ticketstatus_id,
        priority_id: this.data.priority_id,
        tickettype: this.data.tickettype_id,
        user_id: this.data.user_id,
        ticket_tag: this.data.tag_ids,
        summary: this.data.summary,
        description: this.data.description,
        steps_to_reproduce: this.data.steps_to_reproduce || ''
      });

      this.existingImages = Array.isArray(this.data.image_path)
        ? [...this.data.image_path]
        : [];

    }

    else if (this.data && this.data.live_ticket_id) {

      this.isEditMode = false;

      this.issueTicketForm.patchValue({
        ticket_number: this.data.ticket_number,


        summary: this.data.summary,
        user_id: this.data.user_id,
        description: this.data.description,
        priority_id: this.data.priority_id,
        ticket_tag: this.data.ticket_tag,
        tickettype: this.data.tickettype_id,
        steps_to_reproduce: this.data.steps_to_reproduce || '',
        ticketstatus_id: this.data.ticketstatus_id
      });

      this.existingImages = Array.isArray(this.data.image_path)
        ? [...this.data.image_path]
        : [];

    }

    else {

      this.isEditMode = false;
      this.existingImages = [];

      this.loadLatestTicketNumber();

    }

    this.loadStatuses();
    this.loadPriorities();
    this.loadTags();
    this.loadUsers();
    this.loadTicketTypes();

    console.log("Dialog data:", this.data);

  }

  loadStatuses() {
    this.issueticketService.getTicketStatuses()
      .subscribe(res => {
        this.statuses = res.data;
      });
  }

  loadPriorities() {
    this.issueticketService.getTicketPriorities()
      .subscribe(res => {
        this.priorities = res.data;
        console.log("prioritues till reachig bruh", res.data)
      });
  }

  loadTags() {
    this.issueticketService.getTicketTags()
      .subscribe(res => {
        this.tags = res.data;
      });
  }


  loadTicketTypes() {
    this.issueticketService.getTicketType()
      .subscribe(res => {
        this.tickettypes = res.data;
        console.log("ticket tpes are ", this.tickettypes)
      });
  }

  loadUsers() {
    this.issueticketService.getTicketUsers()
      .subscribe(res => {
        this.users = res.data;
        // console.log("users in frontend", res.data)
        console.log("users in frontend", this.users)
      });
  }





  // Remove existing image from array AND optionally backend
  removeExistingImage(index: number) {
    const removedImage = this.existingImages[index];
    this.deletedImages.push(removedImage);
    this.existingImages.splice(index, 1);
    this.existingImages = [...this.existingImages];

  }

  // Remove newly selected image
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.selectedFileNames.splice(index, 1);
  }

  // File select
  onFileSelect(event: any) {
    const files: FileList = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
      this.selectedFileNames.push(files[i].name);
    }
    event.target.value = '';
  }

  loadLatestTicketNumber() {
    this.issueticketService.getLatestTicketNumber()
      .subscribe(res => {
        console.log("latest ticket number", res.data.ticket_number);
        this.issueTicketForm.patchValue({
          ticket_number: res.data.ticket_number
        });
      });
  }

  cancel() {
    console.log("selected project", this.storedProjectId)
    this.dialogRef.close(true);
  }

  onSubmit(): void {
    if (!this.issueTicketForm.valid) return;

    const saveTicket = (uploadedImagePaths: string[]) => {
      const finalImages = [...this.existingImages, ...uploadedImagePaths]; // combine
      const payload = {
        ...this.issueTicketForm.value,
        
        user_id: this.issueTicketForm.value.user_id || null,
        steps_to_reproduce: this.issueTicketForm.value.steps_to_reproduce,
        image_path: finalImages,
        deleted_images: this.deletedImages,
        reported_by: this.userId
      };

      if (this.isEditMode) {
        this.issueticketService.updateIssueTicket(this.data.issueticket_id, payload)
          .subscribe(() => this.dialogRef.close(true));
      } else {
        this.issueticketService.addIssueTicket(payload)
          .subscribe(() => this.dialogRef.close(true));
      }
    };

    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      this.selectedFiles.forEach(f => formData.append('images', f));

      this.issueticketService.uploadImage(formData)
        .subscribe(res => saveTicket(res.image_paths));
    } else {
      saveTicket([]);
    }
  }


  onClose(): void {
    this.dialogRef.close(true);
  }
}
