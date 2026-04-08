
import { Component, OnInit } from '@angular/core';
import { IssueTicketService } from 'src/app/services/issueticket.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { plugins } from 'chart.js';
import { UserService } from 'src/app/services/user.service';
import { LiveticketService } from 'src/app/services/liveticket.service';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedMonth!: string;
  months: { label: string; value: string }[] = [];

  constructor(private issueTicketService: IssueTicketService,
    private DashboardService: DashboardService, private userService: UserService, private liveticketservice: LiveticketService) { }


  tickets: any[] = []
  statuses: any[] = [];

  // Bar chart
  barChartLabels: string[] = [];
  barChartData: any[] = [];
  barChartType = 'bar';
  barChartLegend = false;

  loggedInUserId!: Number;
  pendingCount = 0;
  // closedCount = 0;
  reportedTickets = 0;
  importantCount = 0;
  storedProjectId: string | null = null;
  projectId: number | null = null;
  userData: number | null = null;
  userId: number | null = null;
  assignedToMeCount = 0;
  pendingTickets = 0;
  reported = 0;
  priorityhigh = 0;
  liveticketDataSource = new MatTableDataSource<any>([]);
  ngOnInit() {
    this.loggedInUserId = Number(localStorage.getItem('user_id'));

    this.loadStatusesAndTickets();
    this.getMonths();
    this.loadPriorities();
    this.getLiveTicket();
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
    console.log("selected project in issue ticket", this.storedProjectId);
    this.projectId = this.storedProjectId ? Number(this.storedProjectId) : null;
    this.loadLastProject();

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
          this.projectId = res.last_project_id;
          localStorage.setItem('selectedProject', res.last_project_id.toString());


        } else {
          this.projectId = null;
        }
        this.loadStatusesAndTickets();
        this.getDashBoard();
      },
      error: err => {
        console.error(err);
        this.loadStatusesAndTickets();
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
        // this.prepareStatusBarChart();
        // this.prepareStatusDonutChart();
        this.loadPriorities();
        this.getDashBoard();
        // this.preparePriorityStatusCharts();
      });
    });
  }

  getDashBoard() {
    const storedProject = localStorage.getItem('selectedProject');
    this.projectId = storedProject ? Number(storedProject) : null;

    const dashboardparams = {
      projectid: this.projectId ?? null,
      userid: this.userId,
      // month: this.selectedMonth 
      month: this.selectedMonth === 'ALL' ? null : this.selectedMonth
    };

    this.DashboardService.getDashboard(dashboardparams)
      .subscribe((res: any) => {

        const data = res?.data || {};

        // COUNTS
        this.assignedToMeCount = data.total || 0;
        this.pendingTickets = data.pending || 0;
        // this.closedTickets = data.closed || 0;
        this.reportedTickets = data.reported || 0;
        this.priorityhigh = data.priority || 0;

        console.log("Dashboard Data:", data);

        // BAR CHART
        this.barChartLabels = [];
        const counts: number[] = [];
        const colors: string[] = [];

        if (Array.isArray(data.statusChart) && this.statuses?.length) {
          data.statusChart.forEach((s: any) => {

            const status = this.statuses.find(
              st => Number(st.ticketstatus_id) === Number(s.status_id)
            );

            if (status) {
              this.barChartLabels.push(status.statusname);
              counts.push(Number(s.count));
              colors.push(status.color || '#999');
            }
            else {
              console.warn("❌ Status not found for:", s.status_id);
            }
          });
        }

        this.barChartData = [{
          data: counts,
          backgroundColor: colors,
        }];

        // DONUT CHART
        this.priorityStatusCharts = [];

        if (Array.isArray(data.priorityChart) && this.priorities?.length) {
          data.priorityChart.forEach((p: any) => {

            const priority = this.priorities.find(
              pr => Number(pr.priority_id) === Number(p.priority_id)
            );

            if (priority) {
              this.priorityStatusCharts.push({
                priority: priority.priority,
                total: Number(p.count),
                labels: [priority.priority],
                data: [Number(p.count)],
                // colors: ['#42A5F5']
              });
            }
          });
        }
        this.preparePriorityStatusCharts();
      }, err => {
        console.error("❌ Dashboard API Error:", err);
      });
  }
  getLiveTicket() {
    const storedProjectId = localStorage.getItem('selectedProject');

    const projectparams: { userid: number | null; projectid?: number } = {
      userid: this.userId,
      projectid: storedProjectId ? Number(storedProjectId) : undefined
    };

    this.liveticketservice.getLiveTicket(projectparams)
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

            // Filter out empty strings
            imageArr = imageArr.filter(img => img && img.trim() !== '');
          }

          return {
            ...row,
            image_path: imageArr
          };
        });

        console.log('FINAL DATA USED BY liveticket TABLE:', data);
        this.liveticketDataSource.data = data;
        this.prepareLiveTicketPieChart(data);
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


    const filteredTickets = this.selectedMonth && this.selectedMonth !== 'ALL'
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
    this.prepareLiveTicketPieChart(this.liveticketDataSource.data);
    this.getDashBoard();
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
      // this.getDashBoard();

    });
  }

  priorityStatusCharts: any[] = [];

  preparePriorityStatusCharts() {

    this.priorityStatusCharts = [];

    const filteredTickets = this.selectedMonth && this.selectedMonth !== 'ALL'
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

  pieChartLabels: string[] = [];
  pieChartData: number[] = [];
  pieChartColors: string[] = [];

  prepareLiveTicketPieChart(data: any[]) {
    if (!data || data.length === 0) return;


  let filteredTickets = data;

  if (this.selectedMonth && this.selectedMonth !== 'ALL') {
    filteredTickets = data.filter(t => {
      const d = new Date(t.created_at);
      const month =
        d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');

      return month === this.selectedMonth;
    });
  }

  console.log("======>>>Selected Month:", this.selectedMonth);
  console.log("========++>>>Filtered Tickets:", filteredTickets);

 
  const statusMap: any = {};

  filteredTickets.forEach(ticket => {

    if (!statusMap[ticket.ticketstatus_id]) {
      statusMap[ticket.ticketstatus_id] = {
        label: ticket.statusname,
        count: 0,
        color: ticket.status_color || '#999'
      };
    }

    statusMap[ticket.ticketstatus_id].count++;
  });
   
    const labels: string[] = [];
    const counts: number[] = [];
    const colors: string[] = [];

    Object.values(statusMap).forEach((s: any) => {
      labels.push(s.label);
      counts.push(s.count);
      colors.push(s.color);
    });

    //  FINAL
    this.pieChartLabels = labels;
    this.pieChartData = counts;
    this.pieChartColors = colors;

    console.log("Labels:", labels);
    console.log("Counts:", counts);
    console.log("Colors:", colors);
  }
}