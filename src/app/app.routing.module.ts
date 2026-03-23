
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SideNavComponent } from './components/sidenav/sidenav.component';
import { TabComponent } from './components/tab/tab.component';
import { MastertabComponent } from './components/mastertab/mastertab.component';
import { IssueTicketComponent } from './components/issue-ticket/issue-ticket.component';
import { LoginComponent } from './components/login/login.component';
import { ViewTicketComponent } from './components/viewticket/viewticket.component';
import { SidebarItemComponent } from './components/sidebar-item/sidebar-item.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LiveTicketsComponent } from './components/livetickets/livetickets.component';


const routes: Routes = [
  // { path: '', redirectTo: 'sidenav', pathMatch: 'full' },
  //{ path: 'users', component: UserComponent },
  // { path: 'userregister', component: UserRegistrationDialogComponent },
  // { path: 'tab', component: TabComponent },
  // { path: 'sidenav', component: SideNavComponent },

  { path: 'login', component: LoginComponent },
  {
    path: 'sidenav', component: SideNavComponent, children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tab', component: TabComponent },
      { path: 'mastertab', component: MastertabComponent },
      { path: 'ticketissue', component: IssueTicketComponent },
      { path: 'viewticketissue', component: ViewTicketComponent },
      { path: 'navside', component: SidebarItemComponent },
      { path: 'liveticket', component: LiveTicketsComponent },


    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
