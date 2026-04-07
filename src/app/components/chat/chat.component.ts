// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-chat',
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.css']
// })
// export class ChatComponent {

//   activeTab = 'bot';

//   newMessage = '';

//   messages = [
//     { text: 'Hello ', type: 'received' }
//   ];

//   sendMessage() {
//     if (!this.newMessage.trim()) return;

//     this.messages.push({
//       text: this.newMessage,
//       type: 'sent'
//     });

//     // chatbot reply (basic)
//     if (this.activeTab === 'bot') {
//       setTimeout(() => {
//         this.messages.push({
//           text: 'I am a bot ',
//           type: 'received'
//         });
//       }, 1000);
//     }

//     this.newMessage = '';
//   }
// }

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { UserService } from 'src/app/services/user.service';
import { UserGroupService } from 'src/app/services/usergroup.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  activeTab: 'personal' | 'team' = 'personal';

  // selectedUserId: number = 2;
  selectedGroupId: number = 1;
  currentUserId: number = 0;
  message = '';
  messages: any[] = [];
  selectedUserId: number | null = null;

  // tabs = [
  //   { chattype_id: 1, name: 'chat' },
  //   { chattype_id: 2, name: 'Group' },
  //   // { id: 3, name: 'Support' },
  //   // { id: 4, name: 'Admin' }
  // ];
  users: any;
  isChatOpen:boolean = true;
  unreadMap: any = {};
  sentUnreadMap: any = {};
  shouldAutoScroll = true;
  @ViewChild('chatContainer') chatContainer!: ElementRef;


  scrollToBottom() {
    try {
      if (this.shouldAutoScroll) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }
  onScroll() {
    const element = this.chatContainer.nativeElement;

    const atBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;

    this.shouldAutoScroll = atBottom;
  }
  constructor(private chatService: ChatService, private userservice: UserService, private usergroupservice: UserGroupService) { }

  ngOnInit() {
    this.currentUserId = Number(localStorage.getItem('user_id'));
    this.getUsers();
    this.loadUnreadCounts();
    // this.loadGroups();
  }
  switchTab(tab: any) {
    this.activeTab = tab;
    this.loadUnreadCounts();
    this.messages = [];

    if (tab === 'team') {
      this.loadGroupMessages();
    } else {
      this.selectedUserId = null;
    }
  }
  onclose() {
    this.isChatOpen = false;
    this.selectedUserId=null;
  }
  openChat(userId: number) {
    this.selectedUserId = userId;
    this.loadPersonalMessages(userId);

    this.chatService.markAsRead({
      currentUserId: this.currentUserId,
      selectedUserId: userId
    }).subscribe(() => {
      this.unreadMap[userId] = 0;
      this.loadUnreadCounts();
    });
  }

  loadUnreadCounts() {
    this.chatService.getUnreadCounts(this.currentUserId)
      .subscribe((res: any[]) => {
        console.log("<===========> FRONTEND DATA:", res);
        this.unreadMap = {};

        res.forEach((item: any) => {
          this.unreadMap[item.sender_id] = Number(item.unread_count);
        });

      });
  }
  goBack() {
    this.selectedUserId = null;
    this.messages = [];
    if (this.activeTab === 'team') {
      this.switchTab('personal');
    }
  }
  // PERSONAL CHAT
  loadPersonalMessages(userId: number) {
    this.selectedUserId = userId;
    this.chatService.getMessages(this.currentUserId, userId)
      .subscribe((res: any) => {
        this.messages = res;
        setTimeout(() => this.scrollToBottom(), 100);
      });
  }
 
  sendPersonalMessage() {
    if (this.activeTab === 'personal') {
      const payload = {
        sender_id: this.currentUserId,
        receiver_id: this.selectedUserId,
        message: this.message,
        chattype_id: 1
      };

      this.chatService.sendMessage(payload).subscribe(() => {
        this.message = '';
        this.loadPersonalMessages(this.selectedUserId);

        this.loadUnreadCounts();
        this.shouldAutoScroll = true;
      });
    }
  }
  // GROUP CHAT
  loadGroupMessages() {

    console.log("-----------component group message------------", this.selectedGroupId)
    this.chatService.getGroupMessages()
      .subscribe((res: any) => this.messages = res);

    setTimeout(() => this.scrollToBottom(), 100);
  }

  sendGroupMessage() {
    if (!this.message) return;
    if (this.activeTab === "team") {
      const payload = {
        // group_id: this.selectedGroupId,
        sender_id: this.currentUserId,
        message: this.message,
        chattype_id: 2
      };
      console.log("--------------component send group message------------", payload)
      this.chatService.sendGroupMessage(payload).subscribe(() => {
        this.message = '';
        this.loadGroupMessages();

        this.shouldAutoScroll = true;
      });
    }
  }

  getUsers() {
    this.userservice.getuser().subscribe((resdata: any) => {

      const users = resdata.data;

      console.log('Users from API:', users);

      this.users = users.filter(
        (u: any) =>
          (u.status_id === 1 || u.status_id === 2) &&
          u.user_id !== this.currentUserId
      )
        .map((u: any) => ({
          ...u,
          unread_count: Number(u.unread_count)
        }));


      this.users = [...this.users];

      console.log("Final Users:", this.users);
      
      this.loadUnreadCounts();
    });
  }
  // loadGroups() {
  //   this.usergroupservice.getusergroup()
  //     .subscribe((res: any) => {
  //       this.groups = res.data;

  //     });
  // }

  isSameDay(d1: any, d2: any): boolean {
    const date1 = new Date(d1);
    const date2 = new Date(d2);

    return date1.toDateString() === date2.toDateString();
  }

  formatDate(date: any): string {
    const msgDate = new Date(date);
    const today = new Date();

    const diff = today.getDate() - msgDate.getDate();

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';

    return msgDate.toLocaleDateString();
  }
}