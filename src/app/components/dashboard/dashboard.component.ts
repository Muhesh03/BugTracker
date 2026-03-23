
import { Component, OnInit } from '@angular/core';
import { IssueTicketService } from 'src/app/services/issueticket.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { plugins } from 'chart.js';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedMonth!: string;
  months: { label: string; value: string }[] = [];

  constructor(private issueTicketService: IssueTicketService,
    private DashboardService: DashboardService, private userService: UserService) { }


  tickets: any[] = []
  statuses: any[] = [];

  // Bar chart
  barChartLabels: string[] = [];
  barChartData: any[] = [];
  barChartType = 'bar';
  barChartLegend = false;

  // STATUS_PENDING = 6;
  // STATUS_CLOSED = 5;
  // PRIORITY_IMPORTANT = 1;

  loggedInUserId!: Number;
  pendingCount = 0;
  closedCount = 0;
  importantCount = 0;
  storedProjectId: string | null = null;
  projectId: number | null = null;
  userData: number | null = null;
  userId: number | null = null;
  assignedToMeCount = 0;
  pendingTickets = 0;
  closedTickets = 0;
  priorityhigh = 0;

  ngOnInit() {
    this.loggedInUserId = Number(localStorage.getItem('user_id'));

    this.loadStatusesAndTickets();
    this.getMonths();
    this.loadPriorities();

    interface User {
      id: number;
      email: string;
      fullname: string;
      usergroup_id: number;
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}') as User;
    this.userId = userData.id;
    // const userId = userData.id;

    this.storedProjectId = localStorage.getItem('selectedProject');
    this.projectId = this.storedProjectId ? Number(this.storedProjectId) : null;

    console.log("haaaaaaaaaaaaaai  from dashbaord project", this.projectId)
    console.log("haaaaaaaaaaaaaai from dashbaord id", this.userId)
    this.loadLastProject();
    this.getDashBoard();

  }

  donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 60,
    legend: {
      position: 'bottom',
      display: true,
      labels: {
        boxWidth: 20,
        boxHeight: 12,
        padding: 10,
        font: {
          size: 12
        }
      }
    }
  };

  // Bar chart

  barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      labels: {
        display: false   //  hide numbers on top
      }
    },

    scales: {
      x: {
        dataset: {
          barPercentage: 0.4,       //  reduce bar width
          categoryPercentage: 0.8
        }
      },
      y: {
        ticks: {
          beginAtZero: true,
          precision: 0
        }
      }
    },
    // plugins: {
    //   legend: {
    //     display: true, position: 'bottom',
    //     datalabels: {
    //       boxWidth: 12, // hide numbers on top
    //       padding: 10,
    //       display: false
    //     }
    //   }

    // },
  };


  loadLastProject() {
    this.userService.getLastProject(this.userId).subscribe({
      next: (res: any) => {
        if (res?.last_project_id) {
          localStorage.setItem('selectedProject', res.last_project_id.toString());
          this.projectId = res.last_project_id;
        } else {
          this.projectId = null;
        }

        this.getDashBoard(); 
      },
      error: err => {
        console.error(err);
        this.getDashBoard();
      }
    });
  }
  loadStatusesAndTickets() {
    this.issueTicketService.getTicketStatuses().subscribe(statusRes => {
      this.statuses = statusRes.data || [];
      console.log('STATUS COLORS:', this.statuses);

      this.issueTicketService.getIssueTicket().subscribe(ticketRes => {
        this.tickets = ticketRes.data || [];
        console.log('ticket COLORS:', this.tickets);
        ;
        this.prepareStatusBarChart();
        // this.prepareStatusDonutChart();

        this.preparePriorityStatusCharts();

      });
    });
  }
  getDashBoard() {
    const storedProject = localStorage.getItem('selectedProject');
    this.projectId = storedProject ? Number(storedProject) : null;
    const dashboardparams = {
      projectid: this.projectId,
      userid: this.userId
    };

    this.DashboardService.getDashboard(dashboardparams)
      .subscribe(res => {
        this.assignedToMeCount = res.data.total;
        this.pendingTickets = res.data.pending;
        this.closedTickets = res.data.closed;
        this.priorityhigh = res.data.priority;
        console.log("high piroity working dashboard", this.priorityhigh);
        console.log("Pending dashboard", this.pendingTickets)

      });
  }

  prepareStatusBarChart() {

    this.barChartLabels = [];
    this.barChartData = [];

    const statusCountMap: any = {};

    this.statuses.forEach(status => {
      statusCountMap[status.ticketstatus_id] = {
        label: status.statusname,
        count: 0,
        color: status.color
      };
    });

    // const filteredTickets = this.selectedMonth
    //   ? this.tickets.filter(t =>
    //     new Date(t.created_at).toISOString().slice(0, 7) === this.selectedMonth
    //   )
    //   : this.tickets; //jan 2026
    const filteredTickets = this.selectedMonth
      ? this.tickets.filter(t => {
        const d = new Date(t.created_at);
        const ticketMonth =
          d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        return ticketMonth === this.selectedMonth;
      })
      : this.tickets;


    filteredTickets.forEach(ticket => {
      if (statusCountMap[ticket.ticketstatus_id]) {
        statusCountMap[ticket.ticketstatus_id].count++;
      }
    });

    const counts: number[] = [];
    const colors: string[] = [];

    Object.values(statusCountMap).forEach((s: any) => {
      if (s.count > 0) {
        this.barChartLabels.push(s.label);
        counts.push(s.count);
        colors.push(s.color);
      }
    });

    this.barChartData = [{
      data: counts,
      backgroundColor: colors,
      barPercentage: 0.4,
      categoryPercentage: 0.8,
      maxBarThickness: 100
    }];
  }

  // getMonths() {
  //   this.months = [];

  //   const startYear = 2025;
  //   const endYear = 2027;

  //   for (let year = startYear; year <= endYear; year++) {
  //     for (let month = 0; month < 12; month++) {
  //       const date = new Date(year, month, 1);

  //       this.months.push({
  //         label: date.toLocaleString('en-US', {
  //           month: 'short',
  //           year: 'numeric'
  //         }),
  //         value: `${year}-${String(month + 1).padStart(2, '0')}`
  //       });
  //     }
  //   }

  //   //  LOCAL current month
  //   const now = new Date();
  //   this.selectedMonth =
  //     now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  // }

getMonths() {
  this.months = [];

  const startYear = 2025;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based

  for (let year = startYear; year <= currentYear; year++) {

    const maxMonth = (year === currentYear) ? currentMonth : 11;

    for (let month = 0; month <= maxMonth; month++) {
      const date = new Date(year, month, 1);

      this.months.push({
        label: date.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric'
        }),
        value: `${year}-${String(month + 1).padStart(2, '0')}`
      });
    }
  }

  //*Default  current month*
  this.selectedMonth =
    currentYear + '-' + String(currentMonth + 1).padStart(2, '0');
}



  onMonthChange() {
    this.prepareStatusBarChart();
    this.preparePriorityStatusCharts();
  }

  //////////////////////////////////////////////////////////////////////////////
  // DONUT CHART (PRIORITY)
  //priorityChartLabels: string[] = [];
  priorityChartData: number[] = [];
  priorityChartColors: any[] = [];
  priorityChartType = 'doughnut';
  priorities: any[] = [];

  loadPriorities() {
    this.issueTicketService.getTicketPriorities().subscribe(res => {
      this.priorities = res.data || [];
    });
  }

  priorityStatusCharts: any[] = [];

  preparePriorityStatusCharts() {

    this.priorityStatusCharts = [];

    const filteredTickets = this.selectedMonth
      ? this.tickets.filter(t => {
        const d = new Date(t.created_at);
        const month =
          d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        return month === this.selectedMonth;
      })
      : this.tickets;

    this.priorities.forEach(priority => {

      const priorityTickets = filteredTickets.filter(
        t => t.priority_id === priority.priority_id
      );
      if (priorityTickets.length === 0) return;    //no ticket -skip entire
      const statusMap: any = {};

      // init from status master
      this.statuses.forEach(status => {
        statusMap[status.ticketstatus_id] = {
          label: status.statusname,
          count: 0,
          color: status.color || '#ccc'
        };
      });

      // count tickets
      priorityTickets.forEach(ticket => {
        if (statusMap[ticket.ticketstatus_id]) {
          statusMap[ticket.ticketstatus_id].count++;
        }
      });

      const labels: string[] = [];
      const data: number[] = [];
      const colors: string[] = [];

      Object.values(statusMap).forEach((s: any) => {
        if (s.count > 0) {
          labels.push(s.label);
          data.push(s.count);
          colors.push(s.color);
        }
      });

      //  fallback → REQUIRED
      if (data.length === 0) {
        labels.push('No Data');
        data.push(1);
        colors.push('#e0e0e0');
      }

      this.priorityStatusCharts.push({
        priority: priority.priority,
        total: priorityTickets.length,
        labels,
        data,
        colors
      });
    });
  }

}