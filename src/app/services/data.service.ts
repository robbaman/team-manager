import { Injectable } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import {BehaviorSubject, Observable, filter, map, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private spelers$ = new BehaviorSubject<Speler[]>([
    {id: 1,  actief: true, naam: 'Mika', posities: ['Spits', 'Midden', 'Rechtshalf', 'Linkshalf']},
    {id: 2,  actief: true, naam: 'Cecilio', posities: ['Keeper', 'Midden']},
    {id: 3,  actief: true, naam: 'Luca', posities: ['Verdediger', 'Keeper']},
    {id: 4,  actief: true, naam: 'Aylash', posities: ['Rechtshalf', 'Linkshalf', 'Spits']},
    {id: 5,  actief: true, naam: 'Emmanuel', posities: ['Rechtshalf','Linkshalf']},
    {id: 6,  actief: true, naam: 'Shivan', posities: ['Spits', 'Midden']},
    {id: 7,  actief: true, naam: 'Daimen', posities: ['Verdediger']},
    {id: 8,  actief: true, naam: 'Semmy', posities: ['Keeper','Rechtshalf','Linkshalf', 'Midden']},
    {id: 9,  actief: true, naam: 'Mason', posities: ['Spits', 'Midden', 'Linkshalf', 'Rechtshalf']},
    {id: 10, actief: true, naam: 'Jayson', posities: ['Linkshalf','Rechtshalf', 'Midden', 'Spits']}
  ]);

  private wedstrijden$ = new BehaviorSubject<Wedstrijd[]>([{
	datum: '2023-05-22T22:00:00.000Z',
	id: 1,
	tegenstander: 'Waterwijk',
	spelers: [],
	status: 'Concept',
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
	})));
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
	// TODO: Bereken nieuwe spelerstatistieken!
	return this.wedstrijdOpslaan(wedstrijd);
  }

  getSpelers(): Observable<Speler[]> {
    return this.spelers$.pipe(map(s => s.filter(_ => _.actief).sort((a, b) => a.naam.localeCompare(b.naam))));
  }

  getSpeler(id: number): Observable<Speler> {
    return this.spelers$.pipe(map(i => ({...i.filter(_ => _.id === id)[0]})));
  }

  spelerOpslaan(speler: Speler) {
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
	datum?: Date | string;
}

export interface WedstrijdSpeler {
	id: number;
	naam: string;
	aanwezig: boolean;
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