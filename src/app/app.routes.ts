import { Routes } from '@angular/router';
import { WedstrijdenLijstComponent } from './wedstrijden-lijst/wedstrijden-lijst.component';
import { SpelersLijstComponent } from './spelers-lijst/spelers-lijst.component';
import { WedstrijdToevoegenComponent } from './wedstrijd-toevoegen/wedstrijd-toevoegen.component';
import { HomeComponent } from './home/home.component';
import { SpelerDetailsComponent } from './speler-details/speler-details.component';
import { StatistiekenComponent } from './statistieken/statistieken.component';
import { WedstrijdBewerkenComponent } from './wedstrijd-bewerken/wedstrijd-bewerken.component';

export const routes: Routes = [
    {
        path: 'wedstrijden',
        component: WedstrijdenLijstComponent,
        title: 'Wedstrijden',
        data: { title: 'Example Page' }
    },
    {
        path: 'wedstrijd-toevoegen',
        component: WedstrijdToevoegenComponent,
        title: 'Wedstrijd toevoegen'
    },
    {
        path: 'speler-toevoegen',
        component: SpelerDetailsComponent,
        title: 'Speler toevoegen'
    },
    {
        path: 'speler/:id',
        component: SpelerDetailsComponent,
        title: 'Speler details'
    },  {
        path: 'statistieken',
        component: StatistiekenComponent,
        title: 'Statistieken'
    },
    {
        path: 'wedstrijd/:id/bewerken',
        component: WedstrijdBewerkenComponent,
        title: 'Wedstrijd details'
    },
    {
        path: 'spelers',
        component: SpelersLijstComponent,
        title: 'Spelers'
    },
    {
        path: '',
        pathMatch: 'prefix',
        component: HomeComponent,
        title: 'Home'
    }
];
