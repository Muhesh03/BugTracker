import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AutologoutService {
  private timeoutId: any;
  private readonly timeoutDuration = 15 * 60 * 1000; // 15 min
 
  constructor(private router: Router, private ngZone: NgZone, private dialog: MatDialog) {
    this.startWatching();
  }
  private initListeners() {
    document.body.addEventListener('mousemove', () => this.resetTimer());
    document.body.addEventListener('click', () => this.resetTimer());
    document.body.addEventListener('keypress', () => this.resetTimer());
    document.body.addEventListener('scroll', () => this.resetTimer());
    document.body.addEventListener('touchstart', () => this.resetTimer());
    document.body.addEventListener('touchmove', () => this.resetTimer());
    document.body.addEventListener('touchend', () => this.resetTimer());
    document.body.addEventListener('wheel', () => this.resetTimer());
    document.body.addEventListener('keydown', () => this.resetTimer());
    document.body.addEventListener('keyup', () => this.resetTimer());
    document.body.addEventListener('mousedown', () => this.resetTimer());
    document.body.addEventListener('mouseup', () => this.resetTimer());
  }

  private resetTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => this.logout(), this.timeoutDuration);
  }

  private logout() {
    localStorage.clear();
    this.ngZone.run(() => {
      this.dialog.closeAll();
      this.router.navigate(['/login']);
    });
  }

  startWatching() {
    this.initListeners();
    this.resetTimer();
  }
}
