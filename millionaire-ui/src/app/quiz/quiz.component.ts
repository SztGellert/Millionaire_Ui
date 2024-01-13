import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {Question, QuizService} from "./quiz.service";
import {Subscription, timeout} from "rxjs";
import {Animation, AnimationController, IonImg, Platform} from '@ionic/angular';
import {NgForm} from "@angular/forms";

interface QuestionInGame {
  value: string;
  answers: string[];
  correct_answer: string;
  topic: string;
  difficulty: boolean;
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})

export class QuizComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  // @ts-ignore
  @ViewChildren(IonImg, {read: ElementRef}) imgElements: QueryList<ElementRef<HTMLIonImgElement>>;
  level: number = 0;
  selectedAnswer: string = "";

  quizData: Question[] = [];
  quizList: QuestionInGame[] = [];
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
  language = "en"
  isAlertOpen = false;
  questionDifficulty: string = "all";
  questionTopic: string = "all";
  startBtnClicked: boolean = false;
  active: boolean = false;
  networkError = "";
  help_modules: { halving: boolean; audience: boolean; phone: boolean } = {halving: true, audience: true, phone: true};
  usePhone: boolean = false;
  showTopicActionSheet: boolean = false;
  showDifficultyActionSheet: boolean = false;
  statDict: {} = {};
  public topicActionSheetButtons: { text: string, role: string, data: { action: string, value: string } }[] = [];
  public difficultyActionSheetButtons: { text: string, role: string, data: { action: string, value: string } }[] = [];
  feedbackModal: boolean = false;
  checkedAnswer: boolean = false;
  allowSounds: boolean = false;
  isReload: boolean = false;
  audio = new Audio();
  protected readonly Object = Object;
  // @ts-ignore
  private imgA: Animation;
  private helpTimeOut = timeout;

  constructor(private quizSvc: QuizService, private platform: Platform, private animationCtrl: AnimationController) {

  }

  public isDesktop() {
    let platforms = this.platform.platforms();
    return platforms[0] == "desktop" || platforms[0] == "mobileweb";
  }

  ngOnInit() {
    this.quizListSubs = this.quizSvc.quizzesChanged.subscribe(quizzes => {
      this.quizData = quizzes;
      for (let quiz of quizzes) {
        let question = {} as QuestionInGame;
        // @ts-ignore
        question.value = quiz[this.language].text;
        // @ts-ignore
        question.answers = quiz[this.language].answers;
        // @ts-ignore
        question.correct_answer = quiz[this.language].answers[quiz.en.correct_answer_index];
        this.quizList.push(question)
      }
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
    this.checkedAnswer = true;
    if (this.quizList[this.level].correct_answer == answer && this.level < 14) {
      setTimeout(() => {
        this.isAlertOpen = false;
      }, 1500)
      setTimeout(() => {
        this.level += 1
        this.checkedAnswer = false;
        this.selectedAnswer = "";
      }, 1800)
      this.isAlertOpen = true;
      this.usePhone = false;
      this.statDict = {};
      // @ts-ignore
      clearTimeout(this.helpTimeOut);
      this.playAudio("correct_answer", 2)
      return
    }
    if (this.quizList[this.level].correct_answer == answer && this.level == 14) {
      this.quizList[this.level].value = 'CONGRATULATIONS!!! YOU ARE A MILLIONAIRE!! YOU JUST WON ' + this.prizesList[14] + '!!!';
      this.quizList[this.level].answers = [];
      this.playAudio('final_theme')
      // @ts-ignore
      clearTimeout(this.helpTimeOut);
      return
    }
    this.playAudio("wrong_answer")
    this.active = false;
    this.isAlertOpen = true;
    setTimeout(() => {
      this.isAlertOpen = false;
    }, 1500)
    // @ts-ignore
    clearTimeout(this.helpTimeOut);

  }

  // @ts-ignore
  selectAnswer(answer) {
    this.selectedAnswer = answer;
    // @ts-ignore
    this.selectIndex = this.quizList[this.level].answers.indexOf(this.selectedAnswer);
  }

  audience() {

    // @ts-ignore
    const func = () => {
      let max = 100;
      let min = 40;
      let correct_chance = Math.floor(Math.random() * (max - min + 1) + min)
      let sum = correct_chance;
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
            sum += chance;
          } else {
            // @ts-ignore
            this.statDict[this.quizList[this.level].answers[i]] = 100 - sum;
            sum += 100 - sum
          }
        }
      }
      if (sum != 100) {
        throw Error("Audience feature unexpected error.");
      }
    };


    if (this.help_modules.audience) {
      this.help_modules.audience = false;
      if (this.allowSounds) {
        this.playAudio('audience', 36)
        // @ts-ignore
        this.helpTimeOut = setTimeout(() => {
          func();
        }, 33000);
      } else {
        func();
      }

    }
  }

  getStat(item: string): number {
    // @ts-ignore
    return this.statDict[item]
  }

  halving() {
    if (this.help_modules.halving) {
      this.playAudio('halving')

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
      if (!this.allowSounds) {
        this.help_modules.phone = false;
        this.usePhone = true;
        return
      }
      this.playAudio('phone', 46)
      this.help_modules.phone = false;
      // @ts-ignore
      this.helpTimeOut = setTimeout(() => {
        this.usePhone = true;
      }, 42000)
    }
  }

  reloadPage() {
    this.level = 0
    this.help_modules.halving = true;
    this.help_modules.audience = true;
    this.help_modules.phone = true;
    this.usePhone = false;
    this.quizList = [];
    this.startBtnClicked = false;
    this.networkError = "";
    this.statDict = {};
    this.checkedAnswer = false;
    this.selectedAnswer = "";
    this.isReload = true;
    this.audio.pause();
    // @ts-ignore
    clearTimeout(this.helpTimeOut);
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
    if (ev.target.id === "difficultySelect") {
      this.questionDifficulty = ev.target.value;
    }
  }

  // @ts-ignore
  handleTopicSelectChange(ev) {
    if (ev.target.id === "topicSelect") {
      this.questionTopic = ev.target.value;
    }
  }

  startQuiz() {
    this.quizSvc.fetchQuiz(this.questionTopic, this.questionDifficulty);
  }

  getTooltip(help_type: string): string {
    let label = "";

    switch (help_type) {
      case "halving":
        label = "Take away two wrong answer";
        break;
      case "phone":
        label = "Phone a friend";
        break;
      case "audience":
        label = "Ask the audience";
        break;
      default:
        break;
    }

    return label;
  }

  // @ts-ignore
  logResult(ev) {
    if (ev.detail.data?.value) {
      if (ev.detail.data.action == "topic" && ev.detail.data.value) {
        this.questionTopic = ev.detail.data.value;
      }
      if (ev.detail.data.action == "difficulty" && ev.detail.data.value) {
        this.questionDifficulty = ev.detail.data.value;
      }
    }
    this.showTopicActionSheet = false;
    this.showDifficultyActionSheet = false;
  }

  setOpen(isOpen: boolean) {
    this.feedbackModal = isOpen;
  }

  onSubmit(contactForm: NgForm) {
    if (contactForm.valid) {
      const email = contactForm.value;
      this.quizSvc.sendFeedbackEmail(email)
    }
  }

  playAudio(name: string, timeout: number = 0) {
    if (this.allowSounds) {
      let src = "";
      switch (name) {
        case 'correct_answer':
          src = "https://www.myinstants.com/media/sounds/correct_VsVqwRb.mp3";
          break;
        case 'wrong_answer':
          src = 'https://www.myinstants.com/media/sounds/wrong_JbK803k.mp3'
          break;
        case 'final_theme':
          src = "https://delta.vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/uujixeault/62%20%241%2C000%2C000%20Win.mp3"
          break;
        case 'halving':
          src = 'https://delta.vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/oqmqjluggn/67%2050-50.mp3';
          break;
        case 'phone':
          src = 'https://delta.vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/tntjwcmahr/66%20Phone-A-Friend.mp3';
          break;
        case 'audience':
          src = 'https://delta.vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/lwhnnzheda/68%20Ask%20The%20Audience.mp3';
          break;
        default:
          break
      }


      this.audio.src = src;
      this.audio.load();
      this.audio.play();

      if (timeout != 0) {
        setTimeout(() => {
          this.audio.pause()
        }, timeout * 1000)
      }

    }
  }

  ngAfterViewInit() {
    this.imgA = this.animationCtrl
      .create()
      // @ts-ignore
      .addElement(this.imgElements.get(0).nativeElement)
      .fill('none')
      .duration(100000)
      .keyframes([
        {offset: 0, transform: 'scale(1) rotate(0)'},
        {offset: 0.5, transform: 'scale(5.2) rotate(45deg)'},
        {offset: 1, transform: 'scale(1) rotate(0)'},
      ]);
  }

  ngAfterViewChecked() {
    return
    //this.play()
  }

  play() {
    this.imgA.play();
  }

  pause() {
    this.imgA.pause();
  }

  stop() {
    this.imgA.stop();
  }

  getAnswerClass(answer: string) {

    switch (answer) {

      case this.selectedAnswer  : // all cases
        if (!this.checkedAnswer) {
          return 'selected_answer';
        }
        if (this.checkedAnswer && !this.active) {
          return 'wrong_answer';
        }
        if (this.checkedAnswer && this.active) {
          return 'correct_answer';
        }
        return 'answer';

      case this.quizList[this.level].correct_answer :
        if (this.checkedAnswer) {
          return 'correct_answer';
        }
        return 'answer';

      default:
        if (!this.active) {
          return 'disabled_answer';
        }
        if (this.selectedAnswer) {
          return 'answer answer_transition';
        }
        return 'answer';


    }
  }

  setLanguage(lang: string) {
    if (lang != this.language.substring(0, 2)) {
      this.language = lang;
      if (this.active) {
        this.quizList = [];
        for (let quiz of this.quizData) {
          let question = {} as QuestionInGame;
          // @ts-ignore
          question.value = quiz[this.language].text;
          // @ts-ignore
          question.answers = quiz[this.language].answers;
          // @ts-ignore
          question.correct_answer = quiz[this.language].answers[quiz.en.correct_answer_index];
          this.quizList.push(question)
        }
      }
    }
  }
}
