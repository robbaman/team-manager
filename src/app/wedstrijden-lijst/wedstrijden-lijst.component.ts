import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Wedstrijd } from '../services/data.service';
import { Observable, take } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'tm-wedstrijden-lijst',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule],
  templateUrl: './wedstrijden-lijst.component.html',
  styleUrls: ['./wedstrijden-lijst.component.scss']
})
export class WedstrijdenLijstComponent {
	dataService = inject(DataService);
	wedstrijden$: Observable<Wedstrijd[]>;

	constructor() {
		this.wedstrijden$ = this.dataService.getWedstrijdenLijst().pipe(take(15));
	}

}
