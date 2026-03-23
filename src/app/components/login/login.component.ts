import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { userInfo } from 'os';
import { LoginService } from 'src/app/services/login.service';
//import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  registrationForm!: FormGroup;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // if (this.registrationForm.invalid) {
    //   return;
    // }

    this.loginService.login(this.registrationForm.value).subscribe({
      next: (res: any) => {
        console.log('LOGIN RESPONSE:', res);
        console.log('TOKEN:', res.token);
        console.log('USER:', res.user);
        console.log('PERMISSIONS:', res.permissions);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user)); // STORE USER 
        localStorage.setItem('user_id', res.user.id);
        localStorage.setItem('viewticket', JSON.stringify(res.viewticket));
        console.log("userInfo", res.user.id);
        console.log("user_id==", res.user.id);
        console.log("viewticket==", res.viewticket);
        localStorage.setItem(
          'permissions',
          JSON.stringify(res.permissions)
        );
        this.router.navigate(['/sidenav/dashboard']);
      },
      error: (err) => {
        console.log('Login error:', err); // <-- see full error
        this.errorMessage = err.error?.message || 'Invalid email or password';
      }

    });
  }

  openForgetPassword(): void {
    this.dialog.open(ForgotPasswordDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog'
    });
  }
}
///////////////////////////// forgot password dialog component /////////////////////////////

@Component({
  selector: 'forgot-password',
  templateUrl: './forgotpasswordDialog.component.html',
  styleUrls: ['./forgotpasswordDialog.component.css']
})
export class ForgotPasswordDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>,) { }
  onclose(): void {
    this.dialogRef.close(true);
  }

  submit() {
    throw new Error('Method not implemented.');
  }
  ngOnInit(): void {

  }
}