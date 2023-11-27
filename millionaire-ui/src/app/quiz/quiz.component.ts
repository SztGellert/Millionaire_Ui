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

  help_modules: { halving : boolean; audience: boolean ; phone: boolean } = {halving:true, audience:true, phone:true};
  audienceStats:  number[] = [];
  usePhone: boolean = false;

  statDict: {} = {};
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
      this.usePhone = false;
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

  audience() {
    if (this.help_modules.audience) {
      this.help_modules.audience = false;
      let min = Math.ceil(41);
      let max = Math.floor(89);
      let correct_chance = Math.floor(Math.random() * (max - min + 1)) + min
      let sum = correct_chance
      let chance = 0;
      this.audienceStats = [];
      // @ts-ignore
      this.statDict[this.quizList[this.level].correct_answer] = correct_chance;
      for (let i = 0; i < this.quizList[this.level].answers.length-1; i++) {

        // @ts-ignore
        if (this.quizList[this.level].answers[i] != this.quizList[this.level].correct_answer) {
          if (i < 2 ) {
            chance = Math.floor(Math.random() * ((100-correct_chance-chance)-1) + 1) + 1;
            // @ts-ignore
            this.statDict[this.quizList[this.level].answers[i]] = chance;
            this.audienceStats = this.audienceStats.concat([chance])
            sum += chance
          } else {
            if (100-sum > 0 ) {
              this.audienceStats = this.audienceStats.concat([100-sum])
              // @ts-ignore
              this.statDict[this.quizList[this.level].answers[i]] = 100-sum;

            } else {
              this.audienceStats = this.audienceStats.concat([0])
              // @ts-ignore
              this.statDict[this.quizList[this.level].answers[i]] = 0;
            }
          }
        }
      }
    }
  }


  getStat(item: string): number {
      // @ts-ignore
    return this.statDict[item]
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

  phone() {
    if (this.help_modules.phone) {

      this.help_modules.phone = false;
      this.usePhone = true;
    }
  }

  reloadPage(){
    this.quizSvc.fetchQuiz(this.questionTopic, this.questionDifficulty);
    this.level = 0
    this.help_modules.halving = true;
    this.help_modules.audience = true;
    this.help_modules.phone = true;
    this.usePhone = false;
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


  getTooltip(help_type: string) {
    // @ts-ignore
    if (this.help_modules[help_type]) {
      return "Use " + help_type
    } else {
      return "already used!"
    }
  }




}
