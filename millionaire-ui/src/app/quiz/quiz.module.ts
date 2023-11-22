import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import {QuizComponent} from "./quiz.component";
import {QuizComponentRoutingModule} from "./quiz-routing.module";



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuizComponentRoutingModule,
  ],
  declarations: [QuizComponent]
})
export class QuizModule {}
