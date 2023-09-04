import { Component, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { ALLE_POSITIES, DataService, Speler, SpelerPositie } from '../services/data.service';
import { FormControl, FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { AutofocusDirective } from '../autofocus.directive';

@Component({
  selector: 'tm-speler-details',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, AutofocusDirective, MatInputModule, FormsModule, MatButtonModule, DragDropModule, MatIconModule],
  templateUrl: './speler-details.component.html',
  styleUrls: ['./speler-details.component.scss']
})
export class SpelerDetailsComponent {
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  dataSvc = inject(DataService);
  speler: Speler | undefined;
  beschikbaar: SpelerPositie[] = []; 
  toegewezen: SpelerPositie[] = [];

  @ViewChild(NgForm)form?: NgForm;

  constructor() {
    this.activatedRoute.params
      .pipe(
        takeUntilDestroyed(),
        switchMap(params => {
          if (params['id']) {
            return this.dataSvc.getSpeler(parseInt(params['id']));
          } else
            return of({id: -1, actief: true, posities: [], naam: '', aantalKeeperbeurtenTotNu: 0, aantalSpeelbeurtenTotNu: 0, aantalWisselbeurtenTotNu: 0} as Speler);
        })
      ).subscribe(speler => {
        this.speler = speler;
        this.toegewezen = speler.posities;
        this.beschikbaar = ALLE_POSITIES.filter(p => speler.posities.indexOf(p) < 0)
      })
  }

  drop(event: CdkDragDrop<SpelerPositie[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  opslaan() {
    if (this.speler === undefined || !this.form?.valid) return;
    this.dataSvc.spelerOpslaan(this.speler).pipe(takeUntilDestroyed()).subscribe();
    this.router.navigate(['/spelers'])
  }
}
