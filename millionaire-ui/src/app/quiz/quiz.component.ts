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
  difficultyList: string[] = ["easy", "medium", "hard"];

  topicList: string[] = [
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

  questionDifficulty: string = "";
  questionTopic: string = "";

  help_modules: { halving : boolean; audience: boolean ; phone: boolean } = {halving:true, audience:true, phone:true};

  constructor(private quizSvc: QuizService, private platform: Platform) {}

  public isDesktop() {
    let platforms = this.platform.platforms();
    return platforms[0] == "desktop" || platforms[0] == "mobileweb";

  }

  ngOnInit() {
    this.quizListSubs = this.quizSvc.quizzesChanged.subscribe(quizzes  =>{
      this.quizList = quizzes;
      this.quizList[0].answers = this.quizList[0].answers.sort(() => Math.random() - 0.5);
    })
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

  halving() {
    if (this.help_modules.halving) {

      this.help_modules.halving = false;

      let reset = 0

      for (let i = 0; i < this.quizList[this.level].answers.length; i++) {
        if (reset == 2) {
          return
        }

        if (this.quizList[this.level].answers[i] !== this.quizList[this.level].correct_answer) {
          this.quizList[this.level].answers.splice(i, 1)
          reset += 1
        }
      }
    }
  }

  reloadPage(){
    this.quizSvc.fetchQuiz(this.questionTopic, this.questionDifficulty);
    this.level = 0
    this.help_modules.halving = true;
    this.help_modules.audience = true;
    this.help_modules.phone = true;
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
    if (this.questionTopic != "" && this.questionDifficulty != "") {
      this.quizSvc.fetchQuiz(this.questionTopic, this.questionDifficulty);
    }
  }

  getTooltip(help_type: string) {
    // @ts-ignore
    if (this.help_modules[help_type]) {
      return "Use " + help_type
    } else {
      return "already used!"
    }
  }




}
