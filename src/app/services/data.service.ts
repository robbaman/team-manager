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
    {id: 9,  actief: true, naam: 'Noufal', posities: ['Spits', 'Midden', 'Linkshalf', 'Rechtshalf']},
    {id: 10, actief: true, naam: 'Jayson', posities: ['Linkshalf','Rechtshalf', 'Midden', 'Spits']}
  ]);

  private wedstrijden$ = new BehaviorSubject<Wedstrijd[]>([{
	datum: '2023-05-22T22:00:00.000Z',
	id: 1,
	tegenstander: 'Waterwijk',
	spelers: [],
	opstellingQ1: {
		spits: null,
		links: null,
		midden: null,
		rechts: null,
		verdediger: null,
		keeper: null,
		wissels: []
	},
	opstellingQ2: {
		spits: null,
		links: null,
		midden: null,
		rechts: null,
		verdediger: null,
		keeper: null,
		wissels: []
	},
	opstellingQ3: {
		spits: null,
		links: null,
		midden: null,
		rechts: null,
		verdediger: null,
		keeper: null,
		wissels: []
	},
	opstellingQ4: {
		spits: null,
		links: null,
		midden: null,
		rechts: null,
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

  wedstrijdOpslaan(wedstrijd: Wedstrijd) {
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


export type SpelerPositie = 'Keeper' | 'Verdediger' | 'Linkshalf' | 'Midden' | 'Rechtshalf' | 'Spits'

export const ALLE_POSITIES: SpelerPositie[] = ['Keeper', 'Verdediger', 'Linkshalf', 'Midden', 'Rechtshalf', 'Spits']

export interface Speler {
  naam: string;
  id: number;
  actief: boolean;
  posities: SpelerPositie[]
}


export interface Wedstrijd {
	id: number;
	tegenstander: string;
	spelers: WedstrijdSpeler[];
	opstellingQ1: WedstrijdOpstelling;
	opstellingQ2: WedstrijdOpstelling;
	opstellingQ3: WedstrijdOpstelling;
	opstellingQ4: WedstrijdOpstelling;
	datum: Date | string | undefined;
}

export interface WedstrijdSpeler {
	id: number;
	naam: string;
	aanwezig: boolean;
}

export interface WedstrijdOpstelling {
	spits: WedstrijdSpeler | null;
	links: WedstrijdSpeler | null;
	midden: WedstrijdSpeler | null;
	rechts: WedstrijdSpeler | null;
	verdediger: WedstrijdSpeler | null;
	keeper: WedstrijdSpeler | null;
	wissels: WedstrijdSpeler[];
}