import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptionsPost = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true
};

const httpOptionsGet = {
  params: {},
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true
};

@Injectable({
  providedIn: 'root'
})
export class IssueTicketService {

  // private apiUrl = 'http://localhost:3000/';
  private apiUrl = environment.ServerApi;

  constructor(private http: HttpClient) { }


  addIssueTicket(payload : any): Observable<any> {

    console.log("=============inage oath====================", payload)
    return this.http.post(
      this.apiUrl + 'issueticket/save_data',
      payload,
      httpOptionsPost
    );
  }

  getIssueTicket(projectparams: any = {}): Observable<any> {
    httpOptionsGet.params = projectparams;// impotant when sending as params or in form of json
    console.log("Sending request with params=======:", projectparams);
    return this.http.get<any>(this.apiUrl + 'issueticket/list', httpOptionsGet);
  }


  getLatestTicketNumber(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'issueticket/latestticketnumber', httpOptionsGet);
  }


  getfilter(filters : any): Observable<any> {
    console.log("filteeesr", filters)
    httpOptionsGet.params = filters;
    console.log("Sending request with params:", filters);

    return this.http.get<any>(this.apiUrl + 'issueticket/filter/list', httpOptionsGet);
  }


  // getExcelData(filters): Observable<any> {
  //   httpOptionsGet.params = filters;
  //   console.log("Sending request with params for excel:", filters);

  //   return this.http.get<any>(this.apiUrl + 'issueticket/excel/list', httpOptionsGet);
  // }
  // downloadExcel(filters:any): Observable<Blob> {
  //   console.log("Downloading excel with params:", filters);
  //   return this.http.get(
  //     this.apiUrl + 'issueticket/excel/download',
  //     {
  //       params: filters,
  //       responseType: 'blob'
  //     },

  //   );
  // }
  downloadExcel(filters: any): Observable<Blob> {

    const cleanFilters: any = {};

    Object.keys(filters).forEach(key => {
      const value = filters[key];

      if (
        value !== null &&
        value !== '' &&
        
        value !== '0' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        //Convert Date → ISO string
        if (value instanceof Date) {
          cleanFilters[key] = value.toISOString();
        }
        //Convert array → comma separated
        else if (Array.isArray(value)) {
          cleanFilters[key] = value.join(',');
        }
        else {
          cleanFilters[key] = value;
        }
      }
    });

    console.log('Downloading excel with params:', cleanFilters);

    return this.http.get(
      `${this.apiUrl}issueticket/excel/download`,
      {
        params: cleanFilters,
        responseType: 'blob'
      }
    );
  }



  updateIssueTicket(issueticket_id: number, result: any): Observable<any> {
    console.log('Updating ticket with ID+++++++++ts+++++++++++:', issueticket_id);
    console.log('Payload for update++++++++++ts++++++++++:', result);
    return this.http.post(
      this.apiUrl + 'issueticket/update/' + issueticket_id, result, httpOptionsPost
    );
  }


  deleteIssueTicket(issueticket_id: number): Observable<any> {
    return this.http.post(
      this.apiUrl + 'issueticket/delete/' + issueticket_id,
      {},
      httpOptionsPost
    );
  }

  uploadImage(formData: FormData) {
    return this.http.post<any>(
      this.apiUrl + 'issueticket/upload',
      formData
    );
  }


  downloadPdf(tickets: any[]) {
    return this.http.post(
      this.apiUrl+'issueticket/pdf',
      { preview: false, tickets },
      { responseType: 'blob' }
    );
  }


  getTicketStatuses(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'issueticket/statuses/list',
      httpOptionsGet
    );
  }

  getTicketPriorities(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'issueticket/priorities/list',
      httpOptionsGet
    );
  }

  getTicketTags(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'issueticket/tags/list',
      httpOptionsGet
    );
  }


  getTicketType(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'issueticket/tickettype/list',
      httpOptionsGet
    );
  }



  getUsersByProject(projectId): Observable<any> {
  httpOptionsGet.params = projectId;
  return this.http.get<any>(
    this.apiUrl + 'issueticket/users/byproject',
    httpOptionsGet
  );
}

  getTicketUsers(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'issueticket/users/list',
      httpOptionsGet
    );
  }
 updateTicket(ticketId: number, payload: any) {
  console.log('Updating ticket with ID++++++++<<<<<<<<<<<<<<<<>>>>>>>>>>>>>++++++++++++:', ticketId);
  console.log('Payload for update+++++++++++<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>+++++++++:', payload);
  return this.http.put(
    `${this.apiUrl}issueticket/${ticketId}`,
    payload
  );
}

  getActivities(ticketId: number) {
    console.log('Fetching activities for ticket ID++++++++++++++++++++>>>>>>>>>>>>><<<<<<<<<<<<<<+++++++++++++++++++++:', ticketId);
    return this.http.get(
      `${this.apiUrl}ticket-activity/${ticketId}`
    );
  }


selectBoxStatusUpdate(payload: { ticket_ids: number[], status_id: number }): Observable<any> {
  return this.http.post<any>(this.apiUrl + 'issueticket/bulkupdatestatus', payload, httpOptionsGet);
}

}