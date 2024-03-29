import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  auth = { 
    login:"",
    pass:""
  } 
  invalidLogin = false;
  constructor(private router:Router) { }

  ngOnInit() {
  }

  valid() {
    if ((this.auth.login == "admin") && (this.auth.pass=="ceta23"))
    {
      this.router.navigateByUrl('/map');
      this.invalidLogin = false;
    }
    else {
      this.invalidLogin = true;
    }
  }

}
