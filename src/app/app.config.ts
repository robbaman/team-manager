import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_DATE_LOCALE } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
	provideRouter(routes), 
	provideAnimations(),
	{provide: MAT_DATE_LOCALE, useValue: 'nl-NL'}
]
};
