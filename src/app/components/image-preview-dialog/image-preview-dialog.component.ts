// import { Component, Inject } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { MatIconModule } from "@angular/material/icon";
// import { environment } from 'src/environments/environment';

// @Component({
//   selector: 'app-image-preview-dialog',
//   templateUrl: './image-preview-dialog.component.html',
//   styleUrls: ['./image-preview-dialog.component.css'],

// })
// export class ShowImageDialogComponent {

//   images: string[] = [];
//   zoomedImage: string | null = null;
//   env = environment.ServerApi;
//   constructor(
//     private dialogRef: MatDialogRef<ShowImageDialogComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: string[]
//   ) {
//     this.images = data;
//     console.log("heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeey", this.images)

//   }
//   onClose() {
//     this.dialogRef.close();
//   }
// }


import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-image-preview-dialog',
  templateUrl: './image-preview-dialog.component.html',
  styleUrls: ['./image-preview-dialog.component.css'],
 
})
export class ShowImageDialogComponent {

  images: string[] = [];
  zoomedImage: string | null = null;
    environment = environment;


  constructor(
    private dialogRef: MatDialogRef<ShowImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[]
  ) {
    this.images = data;
      console.log("heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeey",this.images)

  }

onClose() {
  this.dialogRef.close();
}

}
