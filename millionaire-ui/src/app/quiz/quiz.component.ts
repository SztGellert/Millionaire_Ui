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

  protected readonly Object = Object;

  level: number = 0;
  selectedAnswer: string = "";
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

  prizesList: string[] = [
    "£100",
    "£200",
    "£300",
    "£500",
    "£1.000",
    "£2.000",
    "£4.000",
    "£8.000",
    "£16.000",
    "£32.000",
    "£64.000",
    "£125.000",
    "£250.000",
    "£500.000",
    "£1.000.000"
  ];

  isAlertOpen = false;

  questionDifficulty: string = "all";
  questionTopic: string = "all";

  startBtnClicked: boolean = false;
  active: boolean = false;
  networkError = "";

  help_modules: { halving : boolean; audience: boolean ; phone: boolean } = {halving:true, audience:true, phone:true};
  usePhone: boolean = false;

  statDict: {} = {};

  public topicActionSheetButtons: { text: string, role: string, data: { action: string, value:  string}}[] = [];
  public difficultyActionSheetButtons: { text: string, role: string, data: { action: string, value:  string}}[] = [];

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
    this.loadTopicActions();
    this.loadDifficultyActions();
  }

  loadDifficultyActions() {
    for (let item of this.difficultyList) {
      this.difficultyActionSheetButtons = this.difficultyActionSheetButtons.concat({
        text: item,
        role: "destructive",
        data: {
          action: "difficulty",
          value: item,
        },
      },)
    }
    this.difficultyActionSheetButtons = this.difficultyActionSheetButtons.concat({
      text: 'Cancel',
      role: 'cancel',
      data: {
        action: 'cancel',
        value: ''
      },
    });

  }

  loadTopicActions() {
    for (let item of this.topicList) {
      this.topicActionSheetButtons = this.topicActionSheetButtons.concat({
        text: item,
        role: "destructive",
        data: {
          action: "topic",
          value: item,
        },
      },)
    }
    this.topicActionSheetButtons = this.topicActionSheetButtons.concat({
      text: 'Cancel',
      role: 'cancel',
      data: {
        action: 'cancel',
        value: ''
      },
    });

  }

  ngOnDestroy() {
    this.quizListSubs.unsubscribe();
  }

  checkAnswer(answer: string) {
    if (this.quizList[this.level].correct_answer == answer && this.level<14) {
      setTimeout(() => {
        this.isAlertOpen = false;
      }, 1500)
      setTimeout(() => {this.level += 1}, 1800)
      this.isAlertOpen = true;
      this.usePhone = false;
      this.statDict = {};
      return
    }
    if (this.quizList[this.level].correct_answer == answer && this.level==14) {
      this.quizList[this.level].value = 'CONGRATULATIONS!!! YOU ARE A MILLIONAIRE!! YOU JUST WON '+ this.prizesList[14] + '!!!';
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
        let max = 100;
        let correct_chance = Math.floor(Math.random() * max)
        let sum = correct_chance
        let chance = 0;
        // @ts-ignore
        this.statDict[this.quizList[this.level].correct_answer] = correct_chance;
        for (let i = 0; i < this.quizList[this.level].answers.length; i++) {
          // @ts-ignore
          if (this.quizList[this.level].answers[i] != this.quizList[this.level].correct_answer) {
            if (i < 3) {
              chance = Math.floor(Math.random() * (100 - correct_chance - chance + 1))
              // @ts-ignore
              this.statDict[this.quizList[this.level].answers[i]] = chance;
              sum += chance
            } else {
              // @ts-ignore
              this.statDict[this.quizList[this.level].answers[i]] = 100 - sum;
            }
          }
        } if (sum > 100) {
          throw Error("Audience feature unexpected error.");
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
    this.level = 0
    this.help_modules.halving = true;
    this.help_modules.audience = true;
    this.help_modules.phone = true;
    this.usePhone = false;
    this.quizList = [];
    this.startBtnClicked = false;
    this.networkError = "";
    this.statDict = {};
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

  // @ts-ignore
  logResult(ev) {
    if (ev.detail.data.action == "topic") {
      this.questionTopic = ev.detail.data.value;
    }
    if (ev.detail.data.action == "difficulty") {
      this.questionDifficulty = ev.detail.data.value;
    }
  }

}
