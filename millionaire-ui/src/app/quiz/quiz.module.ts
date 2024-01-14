import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {QuizComponent} from "./quiz.component";
import {QuizComponentRoutingModule} from "./quiz-routing.module";
import {MatTooltipModule,} from '@angular/material/tooltip';
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {createTranslateLoader} from "../app.module";
import {HttpClient} from "@angular/common/http";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuizComponentRoutingModule,
    MatTooltipModule,
    TranslateModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [QuizComponent]
})
export class QuizModule {
}
