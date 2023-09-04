import { Injectable } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import {BehaviorSubject, Observable, filter, forkJoin, map, of, switchMap, take, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private spelers$ = new BehaviorSubject<Speler[]>([
    {id: 1,  actief: true, aantalKeeperbeurtenTotNu: 0, aantalSpeelbeurtenTotNu: 0, aantalWisselbeurtenTotNu: 0, naam: 'Mika', posities: ['Spits', 'Midden', 'Rechtshalf', 'Linkshalf']},
    {id: 2,  actief: true, aantalKeeperbeurtenTotNu: 0, aantalSpeelbeurtenTotNu: 0, aantalWisselbeurtenTotNu: 0, naam: 'Cecilio', posities: ['Keeper', 'Midden']},
    {id: 3,  actief: true, aantalKeeperbeurtenTotNu: 0, aantalSpeelbeurtenTotNu: 0, aantalWisselbeurtenTotNu: 0, naam: 'Luca', posities: ['Verdediger', 'Keeper']},
    {id: 4,  actief: true, aantalKeeperbeurtenTotNu: 0, aantalSpeelbeurtenTotNu: 0, aantalWisselbeurtenTotNu: 0, naam: 'Aylash', posities: ['Rechtshalf', 'Linkshalf', 'Spits']},
    {id: 5,  actief: true, aantalKeeperbeurtenTotNu: 0, aantalSpeelbeurtenTotNu: 0, aantalWisselbeurtenTotNu: 0, naam: 'Emmanuel', posities: ['Rechtshalf','Linkshalf']},
    {id: 6,  actief: true, aantalKeeperbeurtenTotNu: 0, aantalSpeelbeurtenTotNu: 0, aantalWisselbeurtenTotNu: 0, naam: 'Shivan', posities: ['Spits', 'Midden']},
    {id: 7,  actief: true, aantalKeeperbeurtenTotNu: 0, aantalSpeelbeurtenTotNu: 0, aantalWisselbeurtenTotNu: 0, naam: 'Daimen', posities: ['Verdediger']},
    {id: 8,  actief: true, aantalKeeperbeurtenTotNu: 0, aantalSpeelbeurtenTotNu: 0, aantalWisselbeurtenTotNu: 0, naam: 'Semmy', posities: ['Keeper','Rechtshalf','Linkshalf', 'Midden']},
    {id: 9,  actief: true, aantalKeeperbeurtenTotNu: 0, aantalSpeelbeurtenTotNu: 0, aantalWisselbeurtenTotNu: 0, naam: 'Mason', posities: ['Spits', 'Midden', 'Linkshalf', 'Rechtshalf']},
    {id: 10, actief: true, aantalKeeperbeurtenTotNu: 0, aantalSpeelbeurtenTotNu: 0, aantalWisselbeurtenTotNu: 0, naam: 'Jayson', posities: ['Linkshalf','Rechtshalf', 'Midden', 'Spits']}
  ]);

  private wedstrijden$ = new BehaviorSubject<Wedstrijd[]>([{
	datum: '2023-05-22T22:00:00.000Z',
	id: 1,
	tegenstander: 'Waterwijk',
	spelers: [],
	status: 'Concept',
	keeperEersteHelft: null,
	keeperTweedeHelft: null,
	opstellingQ1: {
		spits: null,
		linkshalf: null,
		midden: null,
		rechtshalf: null,
		verdediger: null,
		keeper: null,
		wissels: []
	},
	opstellingQ2: {
		spits: null,
		linkshalf: null,
		midden: null,
		rechtshalf: null,
		verdediger: null,
		keeper: null,
		wissels: []
	},
	opstellingQ3: {
		spits: null,
		linkshalf: null,
		midden: null,
		rechtshalf: null,
		verdediger: null,
		keeper: null,
		wissels: []
	},
	opstellingQ4: {
		spits: null,
		linkshalf: null,
		midden: null,
		rechtshalf: null,
		verdediger: null,
		keeper: null,
		wissels: []
	}
  }]);

  constructor() { }

  getWedstrijdenLijst(): Observable<Wedstrijd[]> {
	return this.wedstrijden$.pipe(map(s => s.sort((a, b) => {
		if (a.datum === undefined) return 1;
		if (b.datum === undefined) return -1;


		var ad = (typeof a.datum === "string") ? new Date(a.datum) : a.datum
		var bd = (typeof b.datum === "string") ? new Date(b.datum) : b.datum
		return ad.getTime() - bd.getTime();
	})), take(1));
  }

  getWedstrijd(id: number): Observable<Wedstrijd> {
    return this.wedstrijden$.pipe(map(i => ({...i.filter(_ => _.id === id)[0]})));
  }

  wedstrijdOpslaan(wedstrijd: Wedstrijd) : Observable<any> {
    var copy = [...this.wedstrijden$.value];
    var index = copy.findIndex(i => i.id === wedstrijd.id);
	if (wedstrijd.id < 0 || index < 0) {
		var hoogsteId = copy.reduce((prev, next) => Math.max(prev, next.id), 0);
		wedstrijd.id = hoogsteId + 1;
		copy.push(wedstrijd);
  	} else {
		copy[index] = wedstrijd;
	}
    this.wedstrijden$.next(copy);
	return of(1);
  }

  wedstrijdDefinitiefMaken(wedstrijd: Wedstrijd): Observable<any> {
	wedstrijd.status = 'Definitief';

	let spelerStatistiekBijwerkenVoorWedstrijdSpeler = (wedstrijdSpeler?: WedstrijdSpeler | null, spelers?: Speler[], isKeeper?: boolean) => {
		if (!wedstrijdSpeler || !spelers) return;
	
		var speler = spelers.find(i => i.id === wedstrijdSpeler.id);
		if (!speler) return;

		if (isKeeper)
			speler.aantalKeeperbeurtenTotNu++;
		else
			speler.aantalSpeelbeurtenTotNu++;		
	}
	let spelerStatistiekBijwerkenVoorWissels = (wissels: WedstrijdSpeler[], spelers?: Speler[]) => {
		if (!wissels?.length || !spelers) return;
	
		for (const wissel of wissels) {
			var speler = spelers.find(i => i.id === wissel.id);
			if (!speler) continue;

			speler.aantalWisselbeurtenTotNu++;
		}
	}
	let spelerStatistiekBijwerkenVoorOpstelling = (opstelling?: WedstrijdOpstelling, spelers?: Speler[]) => {
		if (!opstelling || !spelers) return;

		spelerStatistiekBijwerkenVoorWedstrijdSpeler(opstelling.keeper, spelers, true);
		spelerStatistiekBijwerkenVoorWedstrijdSpeler(opstelling.verdediger, spelers);
		spelerStatistiekBijwerkenVoorWedstrijdSpeler(opstelling.linkshalf, spelers);
		spelerStatistiekBijwerkenVoorWedstrijdSpeler(opstelling.midden, spelers);
		spelerStatistiekBijwerkenVoorWedstrijdSpeler(opstelling.rechtshalf, spelers);
		spelerStatistiekBijwerkenVoorWedstrijdSpeler(opstelling.spits, spelers);
		spelerStatistiekBijwerkenVoorWissels(opstelling.wissels, spelers);
	}

	return this.getSpelers()
		.pipe(
			// Haal de laatste stand van de spelers op
			switchMap(spelers => {
				// Werk aantallen beurten bij
				spelerStatistiekBijwerkenVoorOpstelling(wedstrijd.opstellingQ1, spelers);
				spelerStatistiekBijwerkenVoorOpstelling(wedstrijd.opstellingQ2, spelers);
				spelerStatistiekBijwerkenVoorOpstelling(wedstrijd.opstellingQ3, spelers);
				spelerStatistiekBijwerkenVoorOpstelling(wedstrijd.opstellingQ4, spelers);

				// En sla de spelers op
				return forkJoin(
					spelers.map(s => this.spelerOpslaan(s))
				)
			}),
			// Sla ook de definitief gemaakte wedstrijd op
			switchMap(s => this.wedstrijdOpslaan(wedstrijd))
		);
  }

  getSpelers(): Observable<Speler[]> {
    return this.spelers$.pipe(tap(s => console.table(s)), map(s => s.filter(_ => _.actief).sort((a, b) => a.naam.localeCompare(b.naam))), take(1));
  }

  getSpeler(id: number): Observable<Speler> {
    return this.spelers$.pipe(map(i => ({...i.filter(_ => _.id === id)[0]})));
  }

  spelerOpslaan(speler: Speler): Observable<any> {
    var copy = [...this.spelers$.value];
    var index = copy.findIndex(i => i.id === speler.id);
    if (speler.id < 0 || index < 0) {
      var hoogsteId = copy.reduce((prev, next) => Math.max(prev, next.id), 0);
      speler.id = hoogsteId + 1;
      copy.push(speler);
    } else {
      copy[index] = speler;
    }
    this.spelers$.next(copy);
	return of(1);
  }
 
}


export type SpelerPositie = 'Keeper' | 'Verdediger' | 'Linkshalf' | 'Midden' | 'Rechtshalf' | 'Spits';
export type WedstrijdStatus = 'Definitief' | 'Concept';
export const ALLE_POSITIES: SpelerPositie[] = ['Keeper', 'Verdediger', 'Linkshalf', 'Midden', 'Rechtshalf', 'Spits']
export type WedstrijdOpstellingPositie = keyof Pick<WedstrijdOpstelling, 'keeper' | 'verdediger' | 'linkshalf' | 'midden' | 'rechtshalf' | 'spits'>;
export const ALLE_POSITIE_PROPERTIES: WedstrijdOpstellingPositie[] = ['keeper', 'verdediger', 'linkshalf', 'midden', 'rechtshalf', 'spits']

export interface Speler {
  naam: string;
  id: number;
  actief: boolean;
  aantalWisselbeurtenTotNu: number;
  aantalKeeperbeurtenTotNu: number;
  aantalSpeelbeurtenTotNu: number;
  posities: SpelerPositie[]
}


export interface Wedstrijd {
	id: number;
	tegenstander: string;
	status: WedstrijdStatus;
	opstellingBerekend?: boolean;
	spelers: WedstrijdSpeler[];
	opstellingQ1?: WedstrijdOpstelling;
	opstellingQ2?: WedstrijdOpstelling;
	opstellingQ3?: WedstrijdOpstelling;
	opstellingQ4?: WedstrijdOpstelling;
	keeperEersteHelft: WedstrijdSpeler | null;
	keeperTweedeHelft: WedstrijdSpeler | null;
	datum?: Date | string;
}

export interface WedstrijdSpeler {
	id: number;
	naam: string;
	aanwezig: boolean;
	aantalWisselbeurtenDezeWedstrijd: number;
	aantalKeeperbeurtenDezeWedstrijd: number;
	aantalSpeelbeurtenDezeWedstrijd: number;
  }

export interface WedstrijdOpstelling {
	spits: WedstrijdSpeler | null;
	linkshalf: WedstrijdSpeler | null;
	midden: WedstrijdSpeler | null;
	rechtshalf: WedstrijdSpeler | null;
	verdediger: WedstrijdSpeler | null;
	keeper: WedstrijdSpeler | null;
	wissels: WedstrijdSpeler[];
}