import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { DataService } from '../services/data.service';
import { map } from 'rxjs';

@Component({
  selector: 'tm-statistieken',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatTableModule],
  templateUrl: './statistieken.component.html',
  styleUrls: ['./statistieken.component.scss']
})
export class StatistiekenComponent {
  data = inject(DataService);

  hover: string = '';

  spelers$ = this.data.getSpelers();
  posities$ = this.data.getSpelers()
    .pipe(
      map(spelers => {
        const initial: {positie: string; spelers: string[]}[] = [];
        return spelers.reduce((resultaat, speler) => {
          speler.posities.forEach(position => {
            const existingPosition = resultaat.find(item => item.positie === position);
            if (existingPosition) {
              existingPosition.spelers.push(speler.naam);
            } else {
              resultaat.push({ positie: position, spelers: [speler.naam] });
            }
          });
          return resultaat;
        }, initial);

      })
    )
}

