import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Speler } from '../services/data.service';
import {Observable} from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tm-spelers-lijst',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, RouterLink],
  templateUrl: './spelers-lijst.component.html',
  styleUrls: ['./spelers-lijst.component.scss']
})
export class SpelersLijstComponent {
  data = inject(DataService);

  spelers$: Observable<Speler[]>;

  constructor() {
    this.spelers$ = this.data.getSpelers();
  }

}
