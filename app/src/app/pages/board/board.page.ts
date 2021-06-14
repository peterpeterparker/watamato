import {Component, OnInit} from '@angular/core';

import {Observable} from 'rxjs';

import {User} from '@firebase/auth-types';

import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-board',
  templateUrl: 'board.page.html',
  styleUrls: ['board.page.scss']
})
export class BoardPage implements OnInit {
  user$: Observable<User>;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user$ = this.authService.user();
  }
}
