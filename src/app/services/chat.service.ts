
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = environment.ServerApi;

  constructor(private http: HttpClient) { }

  // PERSONAL CHAT
  sendMessage(data: any) {
    console.log("==========service chat==========", data);
    return this.http.post(`${this.apiUrl}chat/send`, data);
  }

  getMessages(user1: number, user2: number) {
    console.log("==========service getchat==========", user1, user2);
    return this.http.get(`${this.apiUrl}chat/history/${user1}/${user2}`);
  }

  // GROUP CHAT
  getGroupMessages() {
    console.log("==========service get group chat==========");
    return this.http.get(`${this.apiUrl}chat/group`);
  }

  sendGroupMessage(data: any) {
    console.log("==========service send group chat==========", data);
    return this.http.post(`${this.apiUrl}chat/group/send`, data);
  }

  getUnreadCounts(userId: number) {
    console.log("+++++service unread++++",userId)
    return this.http.get(`${this.apiUrl}chat/unread/${userId}`);
  }

  markAsRead(data: any) {
    console.log("+++++service read++++",data)
    return this.http.put(`${this.apiUrl}chat/read`, data);
  }
  
}