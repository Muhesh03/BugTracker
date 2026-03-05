import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LiveticketService } from '../../services/liveticket.service'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { IssueTicketFormComponent } from '../issue-ticket/issue-ticket.component';
import { IssueTicketService } from '../../services/issueticket.service';
import { NoteAttachmentService } from 'src/app/services/note-attachment.service';
import { LiveticketNotesService } from '../../services/liveticket-notes.service';
import { ShowImageDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from 'src/environments/environment';


interface User {
  id: number;
  email: string;
  fullname: string;
  usergroup_id: number;
}





@Component({
  selector: 'app-livetickets',
  templateUrl: './livetickets.component.html',
  styleUrls: ['./livetickets.component.css']
})
export class LiveTicketsComponent implements OnInit, AfterViewInit {

  tickettypes: any[] = [];
  userId: number | null = null;


  constructor(
    private issueticketService: IssueTicketService,

    private dialog: MatDialog,
    private liveticketservice: LiveticketService,


  ) { }

  displayedColumns: string[] = [
    'ticket_number',
    'summary',
    'image_path',
    'description',
    'instance',
    'unit',
    'priority_id',
    'tag_names',
    'action',
    'update',
    'status_id'
  ];
  liveticketDataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngOnInit(): void {
    const userData = JSON.parse(localStorage.getItem('user') || '{}') as User;
    this.userId = userData.id;
    this.loadTicketTypes();
    this.getLiveTicket();
  }
  ngAfterViewInit(): void {
    this.liveticketDataSource.paginator = this.paginator;
    this.liveticketDataSource.sort = this.sort;
  }

  openLiveTicketDialog(): void {
    const dialogRef = this.dialog.open(LiveTicketFormComponent, {
      width: '50%',
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getLiveTicket();

      }
    });
  }

  editLiveTicket(row: any) {
    this.issueticketService.getLatestTicketNumber().subscribe(res => {
      const nextTicketNumber = res.data.ticket_number; // get next available issue ticket number

      const dialogRef = this.dialog.open(IssueTicketFormComponent, {
        width: '50%',
        panelClass: 'custom-dialog',
        data: {
          live_ticket_id: row.liveticket_id,
          summary: row.summary,
          user_id: row.assigned_user_id || row.created_by,
          description: row.description,
          priority_id: row.priority_id,
          ticketstatus_id: row.ticketstatus_id,
          ticket_tag: Array.isArray(row.tag_ids) ? row.tag_ids : [],
          tickettype_id: row.tickettype_id,
          image_path: Array.isArray(row.image_path) ? row.image_path : [],
          ticket_number: nextTicketNumber,
          steps_to_reproduce: row.steps_to_reproduce || ''
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.getLiveTicket(); // refresh table if needed
        }
      });
    });

  }
  getLiveTicket() {
    const projectparams: { userid: number | null; projectid?: number } = {
      userid: this.userId
    };

    this.liveticketservice.getLiveTicket(projectparams) // pass params here
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

        console.log('FINAL DATA USED BY  liveticket TABLE:', data);
        this.liveticketDataSource.data = data;
      });
  }


  openImages(images: string[]) {
    this.dialog.open(ViewImageDialogComponent, {
      data: images,
      width: '900px',
      autoFocus: false
    });
  }



  loadTicketTypes() {
    this.liveticketservice.getTicketType()
      .subscribe(res => {
        this.tickettypes = res.data;
        console.log("ticket tpes are ", this.tickettypes)
      });
  }




  editTicket(row: any) {
    const dialogRef = this.dialog.open(LiveTicketFormComponent, {
      width: '30%',
      panelClass: 'custom-dialog',
      data: row   // pass row data to form
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getLiveTicket(); // refresh table after update
      }
    });
  }

  updateLiveTicket(row: any): void {
    console.log('Row livetable data:', row);
    const dialogRef = this.dialog.open(LiveTicketUpdateFormComponent, {
      width: '60%',
      panelClass: 'custom-dialog',
      data: row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }


}




@Component({
  selector: 'app-live-ticket-form',
  templateUrl: './liveticketform.html',
  styleUrls: ['./livetickets.component.css']
})
export class LiveTicketFormComponent implements OnInit {
  cancel() {
    this.dialogRef.close();
  }


  liveticketform!: FormGroup;
  tickettypes: any[] = [];
  storedProjectId: string | null = null;
  statuses: any[] = []


  priorities: any[] = [];
  tags: any[] = [];
  selectedFile!: File;
  fileName = '';
  selectedFileNames: string[] = [];
  selectedFiles: File[] = [];
  existingImages: string[] = [];
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


  get selectedPriority() {
    const id = this.liveticketform.get('priority_id')?.value;
    return this.priorities.find(p => p.priority_id === id);
  }







  constructor(
    private liveticketservice: LiveticketService,
    private dialogRef: MatDialogRef<LiveTicketFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }



  ngOnInit(): void {

    this.storedProjectId = localStorage.getItem('selectedProject');
    const projectId = this.storedProjectId ? Number(this.storedProjectId) : null;
    const userData = JSON.parse(localStorage.getItem('user') || '{}') as User;
    this.userId = userData.id;

    this.liveticketform = new FormGroup({
      tickettype_id: new FormControl(''),
      priority_id: new FormControl(''),
      instance: new FormControl('', Validators.required),
      unit: new FormControl(''),
      summary: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      ticket_tag: new FormControl('', Validators.required),
      ticketstatus_id: new FormControl('', Validators.required),
      storedprojectId: new FormControl(projectId),
      steps_to_reproduce: new FormControl(''),

    });


    this.loadTicketTypes();
    this.loadPriorities();
    this.loadTags();
    this.loadStatuses();




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



  loadStatuses() {

    this.liveticketservice.getTicketStatuses()
      .subscribe(res => {
        this.statuses = res.data;

      });
    console.log("statuses  arrraaaaaaaaaaaaaarrrrrrre", this.statuses)

  }
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.selectedFileNames.splice(index, 1);
  }
  removeExistingImage(i: number) {
    this.existingImages.splice(i, 1);
    this.existingImages = [...this.existingImages]; // force change detection
  }

  loadTicketTypes() {
    this.liveticketservice.getTicketType()
      .subscribe(res => {
        this.tickettypes = res.data;
      });
  }

  loadPriorities() {
    this.liveticketservice.getTicketPriorities()
      .subscribe(res => {
        this.priorities = res.data;
        console.log("ticket prioirtues are for form", this.priorities)

      });
  }

  loadTags() {
    this.liveticketservice.getTicketTags()
      .subscribe(res => {
        this.tags = res.data;
        console.log("taaaaaaaaags", this.tags)
      });
  }

  onSubmit(): void {
    if (!this.liveticketform.valid) {
      console.log('Form is invalid');
      return;
    }

    const saveTicket = (ImagePaths: string[]) => {
      // Merge existing images (after deletion) + newly uploaded images
      // const finalImages = [...this.existingImages, ...uploadedImagePaths];

      const payload = {
        ...this.liveticketform.value,
        image_path: ImagePaths,
        reported_by: this.userId,
        steps_to_reproduce: this.liveticketform.value.steps_to_reproduce || null
      };

      if (this.data && this.data.issueticket_id) {
        // Edit mode
        this.liveticketservice
          .updateLiveTicket(this.data.issueticket_id, payload)
          .subscribe(() => {
            this.dialogRef.close(true);
          });
      } else {
        // New ticket
        this.liveticketservice
          .addLiveTicket(payload).subscribe(() => {
            console.log("ppppppppaaaaaaaaaaaaa", payload)
            this.dialogRef.close(true);

          });
      }
    };

    if (this.selectedFiles && this.selectedFiles.length > 0) {
      const formData = new FormData();
      this.selectedFiles.forEach(file => formData.append('images', file));

      this.liveticketservice.uploadImage(formData)
        .subscribe(res => {
          const imagePaths = res.image_paths || []; // backend response
          saveTicket(imagePaths);
        });

    } else {
      saveTicket([]);
    }
  }


}



@Component({
  selector: 'app-live-ticket-update-form',
  templateUrl: './liveticket-update-form.html',
  styleUrls: ['./liveticket.css']
})
export class LiveTicketUpdateFormComponent implements OnInit {

  LiveTicketForm!: FormGroup;

  // Notes and attachments
  notes: any[] = [];
  selectedFiles: File[] = [];
  selectedFileNames: string[] = [];
  uploadedPaths: string[] = [];
  newNoteText: string = '';
  userId: number | null = null;
  loggedInUser: string = 'You';
  isAddingNote: boolean = false;
  username: string = '';

  // Icons for priority
  iconMap: any = {
    1: { name: 'warning', color: 'red' },
    2: { name: 'arrow_upward', color: 'red' },
    3: { name: 'keyboard_arrow_up', color: 'red' },
    4: { name: 'keyboard_arrow_down', color: 'green' },
    5: { name: 'remove', color: 'orange' }
  };

  // LiveTicketUpdateFormComponent
  imageBaseUrl = 'http://localhost:3000/uploads/';
  today = new Date();

  constructor(
    private dialogRef: MatDialogRef<LiveTicketUpdateFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private liveticketservice: LiveticketService,
    private dialog: MatDialog,
    private liveticketNotesService: LiveticketNotesService
  ) { }

  ngOnInit(): void {
    // Initialize the form
    this.LiveTicketForm = new FormGroup({
      ticketstatus_id: new FormControl(''),
      priority_id: new FormControl(''),
      ticket_tag: new FormControl(''),
      summary: new FormControl(''),
      description: new FormControl('')
    });

    // Load user ID from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = userData?.id || null;
    this.username = userData?.fullname || null;

    // Load all notes for this ticket
    this.loadNotes();
  }

  /** Load all notes from backend */
  loadNotes(): void {
    this.liveticketNotesService.getNotes(this.data.liveticket_id)
      .subscribe((res: any) => {
        const notes = res.data || [];
        // Parse attachments for all notes
        this.notes = notes.map((note: any) => ({
          ...note,
          attachments: Array.isArray(note.attachments) ? note.attachments : JSON.parse(note.attachments || '[]')
        }));
      });
  }
  /** Select files */
  onFileSelect(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
      this.selectedFileNames.push(files[i].name);
    }

    event.target.value = '';
  }

  /** Remove selected file */
  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.selectedFileNames.splice(index, 1);
  }

  /** Upload files to server */
  uploadFiles(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (this.selectedFiles.length === 0) return resolve([]);

      const formData = new FormData();
      this.selectedFiles.forEach(file => formData.append('images', file));

      this.liveticketNotesService.uploadFile(formData).subscribe({
        next: (res: any) => {
          this.uploadedPaths = res.image_paths || [];
          this.selectedFiles = [];
          resolve(this.uploadedPaths);
        },
        error: err => reject(err)
      });
    });
  }

  /** Submit a new note */
  async submitNote(): Promise<void> {
    if (!this.newNoteText && this.selectedFiles.length === 0) return;

    this.isAddingNote = true;

    try {
      await this.uploadFiles();

      const payload = {
        liveticket_id: this.data.liveticket_id,
        note_text: this.newNoteText || '',
        created_by: this.userId,
        attachments: this.uploadedPaths
      };

      const savedNote: any = await this.liveticketNotesService.saveNote(payload).toPromise();

      // Add new note to the top of the list
      this.notes.unshift({
        ...savedNote.data,
        attachments: this.uploadedPaths,
        username: this.loggedInUser
      });

      // Reset
      this.newNoteText = '';
      this.uploadedPaths = [];
      this.selectedFileNames = [];
      this.isAddingNote = false;

    } catch (err) {
      console.error('Error saving note or uploading files:', err);
      this.isAddingNote = false;
    }
  }

  /** Update ticket information */
  updateLiveTicket(): void {
    const payload = { ...this.LiveTicketForm.value, updated_by: this.userId };
    this.liveticketservice.updateLiveTicket(this.data.liveticket_id, payload)
      .subscribe(() => this.dialogRef.close(true));
  }

  openImages(file: string[]) {
    this.dialog.open(ShowImageDialogComponent, {
      data: file,
      width: '900px',
      autoFocus: false
    });
  }

}

/////////////////////////////////////////
@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.css']

})
export class ViewImageDialogComponent {
  images: string[] = [];
  zoomedImage: string | null = null;
  env = environment;

  constructor(
    private dialogRef: MatDialogRef<ViewImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[]
  ) {
    this.images = data;
    console.log("heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeey", this.images)
  }

  onClose() {
    this.dialogRef.close();
  }

  zoomImage(img: string) {
    this.zoomedImage = img;
  }

  closeZoom() {
    this.zoomedImage = null;
  }
}
