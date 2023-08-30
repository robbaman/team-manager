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
import { ALLE_POSITIES, ALLE_POSITIE_PROPERTIES, DataService, Speler, Wedstrijd, WedstrijdOpstelling, WedstrijdOpstellingPositie, WedstrijdSpeler } from '../services/data.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, filter, tap, map, of, shareReplay, switchMap, withLatestFrom, combineLatest, take, startWith } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
	selector: 'tm-wedstrijd-bewerken',
	standalone: true,
	imports: [CommonModule, AutofocusDirective, MatDialogModule, MatMenuModule, MatIconModule, MatExpansionModule, MatDividerModule, MatTabsModule, MatCardModule, MatCheckboxModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDatepickerModule, MatNativeDateModule],
	templateUrl: './wedstrijd-bewerken.component.html',
	styleUrls: ['./wedstrijd-bewerken.component.scss']
})
export class WedstrijdBewerkenComponent {
	private dataSvc = inject(DataService);
	private activatedRoute = inject(ActivatedRoute);
	private dialog = inject(MatDialog);

	opstellingBerekend$: Observable<boolean>;
	actieveSpelers$: Observable<Speler[]>;
	berekenOpstellingenClicked$ = new Subject<void>();
	afrondenClicked$ = new Subject<void>();
	opslaanClicked$ = new Subject<void>();

	@ViewChild(NgForm, { static: true }) form!: NgForm;

	wedstrijd$: Observable<Wedstrijd>;
	blaat: boolean = false;

	constructor() {
		this.actieveSpelers$ = this.dataSvc.getSpelers();

		this.wedstrijd$ = this.activatedRoute.params
			.pipe(
				switchMap(params => this.dataSvc.getWedstrijd(parseInt(params['id']))),
				withLatestFrom(this.dataSvc.getSpelers()),
				map(([wedstrijd, spelers]) => {
					console.log(wedstrijd);

					var nieuweSpelers = spelers.filter(s => !wedstrijd.spelers.find(ws => ws.id === s.id)).map(s => ({ ...s, aanwezig: true, gespeeldeMinuten: 0 }));
					return {...wedstrijd, spelers: [... wedstrijd.spelers, ...nieuweSpelers]};
				}),
				shareReplay(1)
			);


			const opstellingberekenen = this.berekenOpstellingenClicked$
				.pipe(
					withLatestFrom(this.wedstrijd$),
					switchMap(([_, wedstrijd]) => {
						if (wedstrijd.opstellingBerekend) {
							var dialogRef = this.dialog.open(ConfirmDialogComponent);
							dialogRef.componentInstance.headerText = 'Opstelling herberekenen';
							dialogRef.componentInstance.bodyText = 'Weet je zeker dat je de opstelling volledig wilt herberekenen? De huidige opstelling gaat hierbij verloren.';
							return dialogRef.afterClosed()
								.pipe(map(result => [wedstrijd, !!result] as [Wedstrijd, boolean]));
						}
						return of([wedstrijd, true] as [Wedstrijd, boolean]);
					}),
					filter(([_, doorgaan]: [Wedstrijd, boolean]) => doorgaan),
					switchMap(([wedstrijd, _]: [Wedstrijd, boolean]) => this.berekenOpstellingen(wedstrijd)),
					startWith(1)
				);
			
			this.opstellingBerekend$ = combineLatest([opstellingberekenen, this.wedstrijd$]).pipe(map(([_, wedstrijd]) => !!wedstrijd.opstellingBerekend));

			this.afrondenClicked$
				.pipe(
					takeUntilDestroyed(),
					switchMap(_ => {
						var dialogRef = this.dialog.open(ConfirmDialogComponent);
						dialogRef.componentInstance.headerText = 'Wedstrijd afronden';
						dialogRef.componentInstance.bodyText = 'Door de wedstrijd af te ronden wordt deze alleen lezen en worden de spelerstatistieken definitief bijgewerkt. Weet je zeker dat je dit wilt?';
						return dialogRef.afterClosed();
					}),
					filter(bevestigd => bevestigd),
					withLatestFrom(this.wedstrijd$),
					switchMap(([_, wedstrijd]) => this.dataSvc.wedstrijdDefinitiefMaken(wedstrijd))
				)
				.subscribe();
			
			this.opslaanClicked$
				.pipe(
					takeUntilDestroyed(),
					switchMap(_ => this.opslaan())
				)
				.subscribe();
	}

	berekenOpstellingen(wedstrijd: Wedstrijd) : Observable<any> {
		if (!wedstrijd) return of(1);

		var spelers = wedstrijd.spelers.filter(i => i.aanwezig);

		wedstrijd.opstellingQ1 = {
			spits: spelers[0],
			linkshalf: spelers[1],
			midden: spelers[2],
			rechtshalf: spelers[3],
			verdediger: spelers[4],
			keeper: spelers[5],
			wissels: spelers.slice(6)
		};
		wedstrijd.opstellingQ2 = {
			spits: spelers[0],
			linkshalf: spelers[1],
			midden: spelers[2],
			rechtshalf: spelers[3],
			verdediger: spelers[4],
			keeper: spelers[5],
			wissels: spelers.slice(6)
		};
		wedstrijd.opstellingQ3 = {
			spits: spelers[0],
			linkshalf: spelers[1],
			midden: spelers[2],
			rechtshalf: spelers[3],
			verdediger: spelers[4],
			keeper: spelers[5],
			wissels: spelers.slice(6)
		};
		wedstrijd.opstellingQ4 = {
			spits: spelers[0],
			linkshalf: spelers[1],
			midden: spelers[2],
			rechtshalf: spelers[3],
			verdediger: spelers[4],
			keeper: spelers[5],
			wissels: spelers.slice(6)
		};

		wedstrijd.opstellingBerekend = true;

		return of(1);
	}

	wisselSpelers(opstelling: WedstrijdOpstelling, positie: WedstrijdOpstellingPositie, huidigeSpeler: WedstrijdSpeler, speler: Speler) {
		if (huidigeSpeler.id === speler.id) return;

		// Check of deze speler al binnen deze opstelling voorkomt
		for (const property of ALLE_POSITIE_PROPERTIES) {
			var val = opstelling[property];
			if (val && val.id === speler.id) {
				// De 'nieuwe' speler zit al in deze opstelling, we moeten de spelers dus gewoon even wisselen
				var old = opstelling[positie];
				opstelling[positie] = opstelling[property];
				opstelling[property] = old;

				return;
			}
		}

		var wisselIndex = opstelling.wissels.findIndex(i => i.id === speler.id);
		if (!~wisselIndex) return;
		opstelling[positie] = opstelling.wissels[wisselIndex];
		opstelling.wissels[wisselIndex] = huidigeSpeler;

		// TODO: Nu we een opstelling hebben aangepast, moeten we de opstellingen van de kwarten erna ook aanpassen!
	}

	opslaan() : Observable<boolean> {
		if (this.form.valid) {
			return this.wedstrijd$
				.pipe(
					take(1),
					switchMap(wedstrijd => this.dataSvc.wedstrijdOpslaan(wedstrijd)),
					map(_ => true)
				)
		}
		return of(false);
	}
}
