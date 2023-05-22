import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MaterialExampleModule } from './material.module';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimations()]
};
