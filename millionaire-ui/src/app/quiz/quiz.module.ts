import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import {QuizComponent} from "./quiz.component";
import {QuizComponentRoutingModule} from "./quiz-routing.module";
import {MatTooltipModule,} from '@angular/material/tooltip';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuizComponentRoutingModule,
    MatTooltipModule],
  declarations: [QuizComponent]
})
export class QuizModule {}
