import {Component, OnDestroy, OnInit} from '@angular/core';
import {Question, QuizService} from "./quiz.service";
import {Subscription} from "rxjs";
import { Platform } from '@ionic/angular';


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
  difficultyList: string[] = ["all", "easy", "medium", "hard"];

  topicList: string[] = [
    "all",
    "arts",
    "biology",
    "chemistry",
    "economy",
    "gastronomy",
    "general",
    "geography",
    "history",
    "literature",
    "mathematics",
    "music",
    "original",
    "physics",
    "sports"
  ];

  questionDifficulty: string = "all";
  questionTopic: string = "all";

  startBtnClicked: boolean = false;
  active: boolean = false;
  networkError = "";

  constructor(private quizSvc: QuizService, private platform: Platform) {}

  public isDesktop() {
    let platforms = this.platform.platforms();
    return platforms[0] == "desktop" || platforms[0] == "mobileweb";
  }

  ngOnInit() {
    this.quizListSubs = this.quizSvc.quizzesChanged.subscribe(quizzes  =>{
      this.quizList = quizzes;
      if (this.quizList?.length == 15) {
        for (let i = 0; i < this.quizList.length; i++) {
          this.quizList[i].answers = this.quizList[i].answers.sort(() => Math.random() - 0.5);
        }
        this.startBtnClicked = true;
        this.active = true;
      } else {
        this.networkError = "Service unavailable."
      }
    })
  }

  ngOnDestroy() {
    this.quizListSubs.unsubscribe();
  }

  checkAnswer(answer: string) {
    if (this.quizList[this.level].correct_answer == answer && this.level<14) {
      this.level += 1
      this.quizList[this.level].answers = this.quizList[this.level].answers.sort(() => Math.random() - 0.5);
      return
    }
    if (this.quizList[this.level].correct_answer == answer && this.level==14) {
      this.quizList[this.level].value = "CONGRATULATIONS!!! YOU ARE A MILLIONAIRE!!";
      this.quizList[this.level].answers = [];
      return
    }
    this.active = false;
  }

  // @ts-ignore
  selectAnswer(ev) {
    this.selectedAnswer = ev.target.value;
    // @ts-ignore
    this.selectIndex = this.quizList[this.level].answers.indexOf(this.selectedAnswer);

  }

  reloadPage() {
    this.level = 0
    this.quizList = [];
    this.startBtnClicked = false;
    this.networkError = "";
  }

  // @ts-ignore
  compareWith(o1, o2) {
    if (!o1 || !o2) {
      return o1 === o2;
    }

    if (Array.isArray(o2)) {
      return o2.some((o) => o.id === o1.id);
    }

    return o1.id === o2.id;
  }

  // @ts-ignore
  handleDifficultySelectChange(ev) {
    if (ev.target.id === "difficultySelect"){
      this.questionDifficulty = ev.target.value;
    }
  }

  // @ts-ignore
  handleTopicSelectChange(ev) {
    if (ev.target.id === "topicSelect"){
      this.questionTopic = ev.target.value;
    }
  }

  startQuiz() {
    this.quizSvc.fetchQuiz(this.questionTopic, this.questionDifficulty);
  }
}
