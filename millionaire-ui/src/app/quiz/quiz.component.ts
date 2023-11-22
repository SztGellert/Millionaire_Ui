import {Component, OnDestroy, OnInit} from '@angular/core';
import {Question, QuizService} from "./quiz.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})


export class QuizComponent implements OnInit, OnDestroy {

  quizList: Question[] = [];
  private quizListSubs: Subscription = new Subscription();

  constructor(private quizSvc: QuizService) {}

  ngOnInit() {
    this.quizListSubs = this.quizSvc.quizzesChanged.subscribe(quizzes  =>{
      this.quizList = quizzes;
      console.log(quizzes)
    })
    this.quizSvc.fetchQuiz();
  }

  ngOnDestroy() {
    this.quizListSubs.unsubscribe();
  }


}
