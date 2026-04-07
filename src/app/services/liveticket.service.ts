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
export class LiveticketService {

  // private apiUrl = 'http://localhost:3000/';
  private apiUrl = environment.ServerApi;


  constructor(
    private http: HttpClient
  ) { }



  addLiveTicket(payload): Observable<any> {
    console.log("inage oath", payload)
    return this.http.post(
      this.apiUrl + 'liveticket/save_data',
      payload,
      httpOptionsPost
    );
  }


  getLiveTicket(projectparams: any = {}): Observable<any> {
    httpOptionsGet.params = projectparams;
    console.log("Sending request with params ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^:", projectparams);
    return this.http.get<any>(this.apiUrl + 'liveticket/list', httpOptionsGet);
  }





  updateLiveTicket(liveticket_id: number, result: any): Observable<any> {
    return this.http.post(
      this.apiUrl + 'liveticket/update/' + liveticket_id, result, httpOptionsPost
    );
  }




  getTicketType(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'liveticket/tickettype/list',
      httpOptionsGet
    );
  }


  getTicketPriorities(): Observable<any> {

    return this.http.get<any>(
      this.apiUrl + 'liveticket/priorities/list',
      httpOptionsGet

    );
  }
  getLatestTicketNumber(): Observable<any> {
      return this.http.get<any>(this.apiUrl + 'liveticket/latestticketnumber', httpOptionsGet);
    }
  

  //   uploadImage(formData: FormData) {
  //   return this.http.post<any>(
  //     this.apiUrl + 'liveticket/upload',
  //     formData
  //   );
  // }


  getTicketStatuses(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'liveticket/statuses/list',
      httpOptionsGet
    );
  }


  getTicketTags(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'liveticket/tags/list',
      httpOptionsGet
    );
  }


  getNoteTicket(issueticket_id: number): Observable<any> {
    console.log('Fetching notes for ticket ID:', issueticket_id);
    return this.http.get(`${this.apiUrl}note/${issueticket_id}`);
  }


  addNoteTicket(payload: any): Observable<any> {
    console.log('Adding note with payload:', payload);
    return this.http.post(`${this.apiUrl}note/save`, payload);
  }

  // updateNoteTicket(history_id: number, payload: any): Observable<any> {
  //   console.log('Updating note with history ID:', history_id, payload);
  //   return this.http.put(`${this.apiUrl}/${history_id}`, payload);
  // }

  uploadImage(formData: FormData): Observable<any> {

    console.log('Uploading image...');
    return this.http.post(`${this.apiUrl}note/upload`, formData);
  }
getfilter(filters): Observable<any> {
      console.log("filteeesr", filters)
      httpOptionsGet.params = filters;
      console.log("Sending request with params:", filters);

      return this.http.get<any>(this.apiUrl + 'liveticket/filter/list', httpOptionsGet);
    }

markAsConverted(liveticket_id: number): Observable<any> {
  return this.http.put(
    this.apiUrl + 'liveticket/markconverted/' + liveticket_id, 
    {}, 
    httpOptionsPost
  );
}

getLiveticketStatuses(): Observable<any> {
  return this.http.get<any>(
    this.apiUrl + 'liveticket/liveticket-statuses/list',
    httpOptionsGet
  );
}

}
