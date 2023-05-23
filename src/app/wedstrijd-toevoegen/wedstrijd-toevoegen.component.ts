import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, Wedstrijd } from '../services/data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, NgForm } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { AutofocusDirective } from '../autofocus.directive';

@Component({
  selector: 'tm-wedstrijd-toevoegen',
  standalone: true,
  imports: [CommonModule, AutofocusDirective, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './wedstrijd-toevoegen.component.html',
  styleUrls: ['./wedstrijd-toevoegen.component.scss']
})
export class WedstrijdToevoegenComponent {
	activatedRoute = inject(ActivatedRoute);
	router = inject(Router);
	dataSvc = inject(DataService);
	wedstrijd: Wedstrijd | undefined;

	@ViewChild(NgForm)form?: NgForm;

	constructor() {
		this.activatedRoute.params
		  .pipe(
			takeUntilDestroyed(),
			switchMap(params => {
			  if (params['id']) {
				return this.dataSvc.getWedstrijd(parseInt(params['id']));
			  } else
				return of({id: -1, tegenstander: ''} as Wedstrijd);
			})
		  ).subscribe(wedstrijd => {
			this.wedstrijd = wedstrijd;
		  })
	  }


	  opslaan() {
		if (this.form?.valid && this.wedstrijd) {
			this.dataSvc.wedstrijdOpslaan(this.wedstrijd);
			this.router.navigate(['/wedstrijd', this.wedstrijd.id, 'bewerken'])
		}
	  }
}
