import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, filter, map } from 'rxjs';

@Component({
  selector: 'tm-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatSidenavModule, MatButtonModule, MatIconModule, MatToolbarModule, MatDividerModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title$: Observable<string | undefined> | undefined;
  router = inject(Router);

  ngOnInit() {
    this.title$ = this.router.events.pipe(
        filter(i => i instanceof ActivationEnd),
        map(i => (i as ActivationEnd).snapshot.title)
    );
  }

}
