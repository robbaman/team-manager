import { Injectable } from '@angular/core';
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

  constructor() { }

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