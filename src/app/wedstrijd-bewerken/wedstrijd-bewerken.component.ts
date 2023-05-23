import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { AutofocusDirective } from '../autofocus.directive';
import { DataService, Wedstrijd, WedstrijdSpeler } from '../services/data.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { combineLatestWith, of, switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
	selector: 'tm-wedstrijd-bewerken',
	standalone: true,
	imports: [CommonModule, AutofocusDirective, MatExpansionModule, MatDividerModule, MatTabsModule, MatCardModule, MatCheckboxModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDatepickerModule, MatNativeDateModule],
	templateUrl: './wedstrijd-bewerken.component.html',
	styleUrls: ['./wedstrijd-bewerken.component.scss']
})
export class WedstrijdBewerkenComponent {
	private dataSvc = inject(DataService);
	private activatedRoute = inject(ActivatedRoute);

	@ViewChild(NgForm, { static: true }) form!: NgForm;

	wedstrijd?: Wedstrijd;
	blaat: boolean = false;

	constructor() {
		this.activatedRoute.params
			.pipe(
				takeUntilDestroyed(),
				switchMap(params => this.dataSvc.getWedstrijd(parseInt(params['id']))),
				combineLatestWith(this.dataSvc.getSpelers())
			).subscribe(([wedstrijd, spelers]) => {
				this.wedstrijd = wedstrijd;
				var nieuweSpelers = spelers.filter(s => !wedstrijd.spelers.find(ws => ws.id === s.id)).map(s => ({ id: s.id, naam: s.naam, aanwezig: true }));
				this.wedstrijd.spelers = [... this.wedstrijd.spelers, ...nieuweSpelers];
				this.berekenOpstellingen();
			});
	}

	berekenOpstellingen() {
		if (!this.wedstrijd) return;

		var spelers = this.wedstrijd.spelers.filter(i => i.aanwezig);

		this.wedstrijd.opstellingQ1.spits = spelers[0];
		this.wedstrijd.opstellingQ1.links = spelers[1];
		this.wedstrijd.opstellingQ1.midden = spelers[2];
		this.wedstrijd.opstellingQ1.rechts = spelers[3];
		this.wedstrijd.opstellingQ1.verdediger = spelers[4];
		this.wedstrijd.opstellingQ1.keeper = spelers[5];
		this.wedstrijd.opstellingQ1.wissels = spelers.slice(6);

		this.wedstrijd.opstellingQ2.spits = spelers[0];
		this.wedstrijd.opstellingQ2.links = spelers[1];
		this.wedstrijd.opstellingQ2.midden = spelers[2];
		this.wedstrijd.opstellingQ2.rechts = spelers[3];
		this.wedstrijd.opstellingQ2.verdediger = spelers[4];
		this.wedstrijd.opstellingQ2.keeper = spelers[5];
		this.wedstrijd.opstellingQ2.wissels = spelers.slice(6);

		this.wedstrijd.opstellingQ3.spits = spelers[0];
		this.wedstrijd.opstellingQ3.links = spelers[1];
		this.wedstrijd.opstellingQ3.midden = spelers[2];
		this.wedstrijd.opstellingQ3.rechts = spelers[3];
		this.wedstrijd.opstellingQ3.verdediger = spelers[4];
		this.wedstrijd.opstellingQ3.keeper = spelers[5];
		this.wedstrijd.opstellingQ3.wissels = spelers.slice(6);

		this.wedstrijd.opstellingQ4.spits = spelers[0];
		this.wedstrijd.opstellingQ4.links = spelers[1];
		this.wedstrijd.opstellingQ4.midden = spelers[2];
		this.wedstrijd.opstellingQ4.rechts = spelers[3];
		this.wedstrijd.opstellingQ4.verdediger = spelers[4];
		this.wedstrijd.opstellingQ4.keeper = spelers[5];
		this.wedstrijd.opstellingQ4.wissels = spelers.slice(6);
	}

	opslaan() {
		if (this.form.valid) {
			alert('Opslaan!');
		}
	}
}
