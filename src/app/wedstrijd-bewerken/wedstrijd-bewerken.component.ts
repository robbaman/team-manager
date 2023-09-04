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
import { ALLE_POSITIES, ALLE_POSITIE_PROPERTIES, DataService, Speler, SpelerPositie, Wedstrijd, WedstrijdOpstelling, WedstrijdOpstellingPositie, WedstrijdSpeler } from '../services/data.service';
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

	wedstrijd: Wedstrijd | null = null;
	actieveSpelers: Speler[] = [];
	herBerekenAlleLatereKwarten = false;

	afrondenClicked$ = new Subject<void>();
	opslaanClicked$ = new Subject<void>();

	@ViewChild(NgForm, { static: true }) form!: NgForm;


	constructor() {
		this.activatedRoute.params
			.pipe(
				switchMap(params => this.dataSvc.getWedstrijd(parseInt(params['id']))),
				withLatestFrom(this.dataSvc.getSpelers()),
				takeUntilDestroyed()
			)
			.subscribe(([wedstrijd, spelers]) => {
				var nieuweSpelers = spelers
					.filter(s => !wedstrijd.spelers.find(ws => ws.id === s.id))
					.map(s => ({
						id: s.id,
						naam: s.naam,
						aanwezig: true,
						aantalWisselbeurtenDezeWedstrijd: 0,
						aantalKeeperbeurtenDezeWedstrijd: 0,
						aantalSpeelbeurtenDezeWedstrijd: 0
					  }));
				this.wedstrijd = {...wedstrijd, spelers: [... wedstrijd.spelers, ...nieuweSpelers]};
				this.actieveSpelers = spelers;
			})
	}

	afrondenClicked() {
		if (!this.wedstrijd) return;
		var dialogRef = this.dialog.open(ConfirmDialogComponent);
		dialogRef.componentInstance.headerText = 'Wedstrijd afronden';
		dialogRef.componentInstance.bodyText = 'Door de wedstrijd af te ronden wordt deze alleen lezen en worden de spelerstatistieken definitief bijgewerkt. Weet je zeker dat je dit wilt?';
		dialogRef.afterClosed()
			.pipe(
				switchMap(result => {
					if (result)
						return this.dataSvc.wedstrijdDefinitiefMaken(this.wedstrijd!);
					else
						return of(1)
				})
			)
			.subscribe()
	}

	berekenOpstellingenClicked() {
		if (!this.wedstrijd) return;

		if (this.wedstrijd.opstellingBerekend) {
			var dialogRef = this.dialog.open(ConfirmDialogComponent);
			dialogRef.componentInstance.headerText = 'Opstelling herberekenen';
			dialogRef.componentInstance.bodyText = 'Weet je zeker dat je de opstelling volledig wilt herberekenen? De huidige opstelling gaat hierbij verloren.';
			dialogRef.afterClosed()
				.subscribe(result => {
					if (result) {
						this.berekenOpstellingen()
					}
				});
		} else {
			this.berekenOpstellingen()
		}
	}

	resetSpelerBeurten() {
		if (!this.wedstrijd) return;
		this.wedstrijd.spelers.forEach(s => {
			s.aantalWisselbeurtenDezeWedstrijd = 0;
			s.aantalKeeperbeurtenDezeWedstrijd = 0;
			s.aantalSpeelbeurtenDezeWedstrijd = 0;
		});
	}

	telSpelerbeurtenVoorOpstelling(opstelling?: WedstrijdOpstelling) {
		if (!opstelling) return;

		if (opstelling.keeper) opstelling.keeper.aantalKeeperbeurtenDezeWedstrijd++
		if (opstelling.verdediger) opstelling.verdediger.aantalSpeelbeurtenDezeWedstrijd++
		if (opstelling.linkshalf) opstelling.linkshalf.aantalSpeelbeurtenDezeWedstrijd++
		if (opstelling.midden) opstelling.midden.aantalSpeelbeurtenDezeWedstrijd++
		if (opstelling.rechtshalf) opstelling.rechtshalf.aantalSpeelbeurtenDezeWedstrijd++
		if (opstelling.spits) opstelling.spits.aantalSpeelbeurtenDezeWedstrijd++

		opstelling.wissels.forEach(w => {
			w.aantalWisselbeurtenDezeWedstrijd++;
		})
	}

	bepaalBesteSpelerVoorPositie(beschikbareWedstrijdSpelers: WedstrijdSpeler[], positie: SpelerPositie) : WedstrijdSpeler | null {
		if (beschikbareWedstrijdSpelers.length == 0) return null;
		var alleBeschikbareSpelers = this.actieveSpelers.filter(as => beschikbareWedstrijdSpelers.find(b => b.id === as.id));
		var spelersVoorPositie = this.actieveSpelers.filter(as => ~as.posities.indexOf(positie));
		var beschikbareWedstrijdSpelersVoorPositie = beschikbareWedstrijdSpelers.filter(i => i.aanwezig).filter(i => spelersVoorPositie.find(s => i.id === s.id));

		if (beschikbareWedstrijdSpelersVoorPositie.length === 0) {
			// Als er geen spelers voor de betreffende positie zijn, dan alle spelers meenemen
			beschikbareWedstrijdSpelersVoorPositie = beschikbareWedstrijdSpelers;
		}

		// In principe willen we een speler die op de positie uit de voeten kan, maar alleen als niet alle spelers voor de positie meer speelbeurten hebben dan
		// een andere speler (bijvoorbeeld als we maar aanwezige 1 verdediger hebben)
		var laagstAantalSpeelbeurtenVoorPositie = beschikbareWedstrijdSpelersVoorPositie.sort((a, b) => a.aantalSpeelbeurtenDezeWedstrijd - b.aantalSpeelbeurtenDezeWedstrijd)[0].aantalSpeelbeurtenDezeWedstrijd;
		var laagstAantalSpeelbeurtenVoorAlleBeschikbareSpelers = beschikbareWedstrijdSpelers.sort((a, b) => a.aantalSpeelbeurtenDezeWedstrijd - b.aantalSpeelbeurtenDezeWedstrijd)[0].aantalSpeelbeurtenDezeWedstrijd;
		var wedstrijdSpelersMetLaagsteAantalSpeelbeurten = laagstAantalSpeelbeurtenVoorPositie <= laagstAantalSpeelbeurtenVoorAlleBeschikbareSpelers
			? beschikbareWedstrijdSpelersVoorPositie.filter(i => i.aantalSpeelbeurtenDezeWedstrijd === laagstAantalSpeelbeurtenVoorPositie)
			: beschikbareWedstrijdSpelers.filter(i => i.aantalSpeelbeurtenDezeWedstrijd === laagstAantalSpeelbeurtenVoorAlleBeschikbareSpelers)

		// Als het maar 1 speler is met dit aantal beurten, retourneer deze dan
		if (wedstrijdSpelersMetLaagsteAantalSpeelbeurten.length == 1) {
			return wedstrijdSpelersMetLaagsteAantalSpeelbeurten[0];
		}

		// Het zijn dus meer spelers, kijk naar de hoeveelheid wisselbeurten van de overgebleven spelers
		var spelersMetLaagsteAantalSpeelbeurten = alleBeschikbareSpelers
			.filter(as => wedstrijdSpelersMetLaagsteAantalSpeelbeurten.find(i => i.id === as.id))
		const spelersMetHoogsteWisselBeurtenAantal = spelersMetLaagsteAantalSpeelbeurten
			.sort((a, b) => (b.aantalWisselbeurtenTotNu + b.aantalKeeperbeurtenTotNu) - (a.aantalWisselbeurtenTotNu + a.aantalKeeperbeurtenTotNu));
		const aantalWisselEnKeepersBeurten = spelersMetHoogsteWisselBeurtenAantal[0].aantalWisselbeurtenTotNu + spelersMetHoogsteWisselBeurtenAantal[0].aantalKeeperbeurtenTotNu
		var alleSpelersMetDitAantal = spelersMetLaagsteAantalSpeelbeurten.filter(a => (a.aantalWisselbeurtenTotNu + a.aantalKeeperbeurtenTotNu) == aantalWisselEnKeepersBeurten);

		// Pak een willekeurige uit de lijst van spelers die overblijven
		var randomIndex = Math.floor(Math.random() * alleSpelersMetDitAantal.length);
		return beschikbareWedstrijdSpelers.find(i => i.id === alleSpelersMetDitAantal[randomIndex].id) ?? null;
	}

	maakOpstellingObvBeurten(kwartNummer: number) : WedstrijdOpstelling | undefined {
		if (!this.wedstrijd) return undefined;

		var result: WedstrijdOpstelling = {
			spits:  null,
			linkshalf:  null,
			midden:  null,
			rechtshalf:  null,
			verdediger:  null,
			keeper:  null,
			wissels: []
		};

		
		// Maak een kopietje zodat we spelers uit de lijst kunnen halen
		var beschikbareSpelers = this.wedstrijd.spelers
			.filter(s => s.aanwezig)
			.filter(s => s.id !== this.wedstrijd?.keeperEersteHelft?.id && s.id !== this.wedstrijd?.keeperTweedeHelft?.id);

		// Begin met de keeper, die wijkt af omdat we per helft een keeper willen
		switch (kwartNummer) {
			case 1:
			case 2:
				result.keeper = this.wedstrijd.keeperEersteHelft;
				break;
			case 3:
			case 4:
				result.keeper = this.wedstrijd.keeperTweedeHelft;
				break;
		}

		// Voor elke positie:
		// - Bepaal de spelers die nog niet in de opstelling van dit kwart zitten
		// - Bepaal eerst alle spelers die binnen de huidige opstelling het laagste speelbeurten hebben
		// - Zoek binnen deze spelers de spelers die de positie kunnen spelen
		// - Als dit er meerdere zijn, pak dan de speler die in totaal het meeste aantal wisselbeurten gehad hebben
		// - Als dit er nog steeds meerdere zijn, pak dan willekeurig een speler
		
		// De keeper van de andere helft krijgt voorrang, dus bepaal eerst wie dat is
		var prioriteitWedstrijdSpeler = kwartNummer <= 2
			? this.wedstrijd.keeperTweedeHelft
			: this.wedstrijd.keeperEersteHelft;

		var prioriteitSpeler = this.actieveSpelers.find(s => s.id === prioriteitWedstrijdSpeler?.id);
		var prioriteitSpelerVoorkeursPositie: SpelerPositie | null = null;
		if (prioriteitSpeler) {
			// Bepaal vervolgens welke geforceerde positie de keeper krijgt
			var posities = prioriteitSpeler.posities.filter(i => i !== 'Keeper');
			if (posities.length) {
				var randomIndex = Math.floor(Math.random() * posities.length);
				prioriteitSpelerVoorkeursPositie = posities[randomIndex];
			} else {
				const allePositiesBehalveKeeper = ALLE_POSITIES.filter(i => i !== 'Keeper');
				var randomIndex = Math.floor(Math.random() * allePositiesBehalveKeeper.length);
				prioriteitSpelerVoorkeursPositie = allePositiesBehalveKeeper[randomIndex];
				
			}
		}

		if (prioriteitSpelerVoorkeursPositie === 'Verdediger') {
			result.verdediger = prioriteitWedstrijdSpeler;
		} else {
			result.verdediger = this.bepaalBesteSpelerVoorPositie(beschikbareSpelers, 'Verdediger');
			beschikbareSpelers = beschikbareSpelers.filter(i => i.id !== result.verdediger?.id);
		}

		if (prioriteitSpelerVoorkeursPositie === 'Spits') {
			result.spits = prioriteitWedstrijdSpeler;
		} else {
			result.spits = this.bepaalBesteSpelerVoorPositie(beschikbareSpelers, 'Spits');
			beschikbareSpelers = beschikbareSpelers.filter(i => i.id !== result.spits?.id);
		}

		if (prioriteitSpelerVoorkeursPositie === 'Midden') {
			result.midden = prioriteitWedstrijdSpeler;
		} else {

			result.midden = this.bepaalBesteSpelerVoorPositie(beschikbareSpelers, 'Midden');
			beschikbareSpelers = beschikbareSpelers.filter(i => i.id !== result.midden?.id);
		}

		if (prioriteitSpelerVoorkeursPositie === 'Linkshalf') {
			result.linkshalf = prioriteitWedstrijdSpeler;
		} else {
			result.linkshalf = this.bepaalBesteSpelerVoorPositie(beschikbareSpelers, 'Linkshalf');
			beschikbareSpelers = beschikbareSpelers.filter(i => i.id !== result.linkshalf?.id);
		}

		if (prioriteitSpelerVoorkeursPositie === 'Rechtshalf') {
			result.rechtshalf = prioriteitWedstrijdSpeler;
		} else {
			result.rechtshalf = this.bepaalBesteSpelerVoorPositie(beschikbareSpelers, 'Rechtshalf');
			beschikbareSpelers = beschikbareSpelers.filter(i => i.id !== result.rechtshalf?.id);
		}

		result.wissels = beschikbareSpelers;

		return result;
	}

	berekenOpstellingen() {
		if (!this.wedstrijd) return;

		var beschikbareSpelers = this.wedstrijd.spelers.filter(s => s.aanwezig);
		this.wedstrijd.keeperEersteHelft = this.bepaalBesteSpelerVoorPositie(beschikbareSpelers, 'Keeper');
		this.wedstrijd.keeperTweedeHelft = this.bepaalBesteSpelerVoorPositie(beschikbareSpelers.filter(bs => bs.id !== this.wedstrijd?.keeperEersteHelft?.id), 'Keeper');
		
		// Probeer binnen deze wedstrijd elke speler evenveel speelbeurten te geven
		// Als er 'gaten' vallen binnen de opstelling probeer deze dan te geven
		// aan spelers die tot deze wedstrijd de meeste wisselbeurten gehad hebben
		this.deelHerberekenOpstellingen(1);

		this.wedstrijd.opstellingBerekend = true;
	}

	
	deelHerberekenOpstellingen(vanafKwart: number) {
		if (!this.wedstrijd) return;

		this.resetSpelerBeurten();

		if (vanafKwart <= 1) 
			this.wedstrijd.opstellingQ1 = this.maakOpstellingObvBeurten(1);
		this.telSpelerbeurtenVoorOpstelling(this.wedstrijd.opstellingQ1!);

		if (vanafKwart <= 2) 
			this.wedstrijd.opstellingQ2 = this.maakOpstellingObvBeurten(2);
		this.telSpelerbeurtenVoorOpstelling(this.wedstrijd.opstellingQ2!);

		if (vanafKwart <= 3) 
			this.wedstrijd.opstellingQ3 = this.maakOpstellingObvBeurten(3);
		this.telSpelerbeurtenVoorOpstelling(this.wedstrijd.opstellingQ3!);
	
		if (vanafKwart <= 4) 
			this.wedstrijd.opstellingQ4 = this.maakOpstellingObvBeurten(4);
		this.telSpelerbeurtenVoorOpstelling(this.wedstrijd.opstellingQ4!);
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

		// De 'nieuwe' speler zit nog niet in deze opstelling, wissel hem daarom met een van de wissels
		var wisselIndex = opstelling.wissels.findIndex(i => i.id === speler.id);
		if (!~wisselIndex) return;
		opstelling[positie] = opstelling.wissels[wisselIndex];
		opstelling.wissels[wisselIndex] = huidigeSpeler;

		// En herbereken de beurtentelling en de opstellingen van de kwarten erna ook!
		var kwartnummerVanafWaarOpnieuwDeOpstellingenTeBepalen = !this.herBerekenAlleLatereKwarten
			? 10
			: this.wedstrijd?.opstellingQ1 == opstelling
				? 1
				: this.wedstrijd?.opstellingQ2 == opstelling
					? 2
					: this.wedstrijd?.opstellingQ3 == opstelling
						? 3
						: 4;
		this.deelHerberekenOpstellingen(kwartnummerVanafWaarOpnieuwDeOpstellingenTeBepalen + 1)
	}

	opslaanClicked() {
		if (this.form.valid && this.wedstrijd) {
			this.dataSvc.wedstrijdOpslaan(this.wedstrijd)
				.subscribe();
		}
	}
}
