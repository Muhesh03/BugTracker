import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app.routing.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; 

// Reusable combined material module (your custom module)
import { MaterialModule } from './Modules/material.module';

// App Components
import { AppComponent } from './app.component';
import { ChangePasswordComponent, SideNavComponent } from './components/sidenav/sidenav.component';
import { TabComponent } from './components/tab/tab.component';
import { ImagePreviewDialogComponent,UserComponent, UserDialogueComponent } from './components/user/user.component';

// Your Project Components
import { ProjectComponent, ProjectDialogComponent, ProjectFormComponent } from './components/projects/projects.component';

// Your Usergroup Components
import { PermissionDialogComponent, UsergroupComponent, UsergroupFormComponent } from './components/usergroup/usergroup.component';
import { TicketPriorityComponent, TicketPriorityFormComponent } from './components/ticket-priority/ticket-priority.component';
import { PriorityTagComponent, PriorityTagFormComponent } from './components/Ticket-tag/priority-tag.component';
import { MatRadioModule } from '@angular/material/radio';
import { MastertabComponent } from './components/mastertab/mastertab.component';
import { TicketTypeComponent, TicketTypeDialogueComponent } from './components/tickettype/tickettype.component';
import { TicketStatusComponent, TicketStatusDialogComponent } from './components/ticketstatus/ticketstatus.component';
import { RouterModule } from '@angular/router';
import { IssueTicketComponent, IssueTicketFormComponent } from './components/issue-ticket/issue-ticket.component';
import { LoginComponent, ForgotPasswordDialogComponent } from './components/login/login.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EditNoteComponent, NotePreviewDialogComponent, ViewTicketComponent, ViewTicketFormComponent } from './components/viewticket/viewticket.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SidebarItemComponent } from './components/sidebar-item/sidebar-item.component';
import { MatMenuModule } from '@angular/material/menu';
import { ToolBarComponent } from './components/tool-bar/tool-bar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { ShowImageDialogComponent } from './components/image-preview-dialog/image-preview-dialog.component';
import { LiveTicketsComponent,LiveTicketFormComponent,LiveTicketUpdateFormComponent, ViewImageDialogComponent } from './components/livetickets/livetickets.component';

@NgModule({
  declarations: [
    AppComponent,
    SideNavComponent,
    ChangePasswordComponent,
    TabComponent,
    UserComponent,
    UserDialogueComponent,
    ProjectComponent,
    ProjectFormComponent,
    MastertabComponent,
    UsergroupComponent,
    UsergroupFormComponent,
    TicketPriorityComponent,
    TicketPriorityFormComponent,
    PriorityTagComponent,
    PriorityTagFormComponent,
    TicketTypeComponent,
    TicketTypeDialogueComponent,
    TicketStatusComponent,
    TicketStatusDialogComponent,
    IssueTicketComponent,
    IssueTicketFormComponent,
    PermissionDialogComponent,
    ProjectDialogComponent,
    LoginComponent,
    ForgotPasswordDialogComponent,
    ViewTicketComponent,
    ViewTicketFormComponent,
    SidebarItemComponent,
    ToolBarComponent,
    ImagePreviewDialogComponent,
    DashboardComponent,   
    ShowImageDialogComponent, 
    LiveTicketsComponent,
    LiveTicketFormComponent,
    LiveTicketUpdateFormComponent,
    EditNoteComponent,
    NotePreviewDialogComponent,
    ViewImageDialogComponent,

    
  ],

  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    AppRoutingModule,
    MatToolbarModule,
    MatDialogModule,
    MatSidenavModule,
    MatIconModule,
    MatMenuModule,
    
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatSnackBarModule,
    MaterialModule,
    ChartsModule,
    SweetAlert2Module.forRoot()
  ],

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
