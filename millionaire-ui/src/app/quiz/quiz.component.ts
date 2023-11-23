import {Component, OnDestroy, OnInit} from '@angular/core';
import {Question, QuizService} from "./quiz.service";
import {Subscription, window} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})


export class QuizComponent implements OnInit, OnDestroy {

  level: number = 0;
  selectedAnswer: string = "";
  question: Question = {} as Question;
  quizList: Question[] = [];
  quizListSubs: Subscription = new Subscription();

  constructor(private quizSvc: QuizService) {
  }

  ngOnInit() {
    this.quizListSubs = this.quizSvc.quizzesChanged.subscribe(quizzes  =>{
      this.quizList = quizzes;
      console.log(quizzes)
      this.quizList[0].answers = this.quizList[0].answers.sort(() => Math.random() - 0.5);

    })
    this.quizSvc.fetchQuiz();
  }

  ngOnDestroy() {
    this.quizListSubs.unsubscribe();
  }

  checkAnswer(answer: string) {
    if (this.quizList[this.level].correct_answer == answer && this.level<14) {
      this.level += 1
      this.quizList[this.level].answers = this.quizList[this.level].answers.sort(() => Math.random() - 0.5);
    } else {
      if (this.quizList[this.level].correct_answer == answer && this.level==14) {
        this.quizList[this.level].value = "CONGRATULATIONS!!! YOU ARE A MILLIONAIRE!!";
        this.quizList[this.level].answers = [];
        return
      }
      this.quizList[this.level].value = "Fail";
      this.quizList[this.level].answers = [];

    }
  }

  reloadPage(){
    location.reload();

  }
}
