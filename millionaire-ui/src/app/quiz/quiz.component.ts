import {Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Question, QuizService} from "./quiz.service";
import {Subscription, timeout} from "rxjs";
import {IonImg, Platform} from '@ionic/angular';
import {NgForm} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";

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

export class QuizComponent implements OnInit, OnDestroy {

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
  language: string = this.translateService.currentLang;
  quiz_language = "en"
  tooltips = {halving: "", audience: "", phone: "", stop: ""}
  isAlertOpen = false;
  questionDifficulty: string = "all";
  questionTopic: string = "all";
  startBtnClicked: boolean = false;
  active: boolean = false;
  isWinning: boolean = false;
  outOfGame: boolean = false;
  networkError = "";
  help_modules: { halving: boolean; audience: boolean; phone: boolean } = {halving: true, audience: true, phone: true};
  usePhone: boolean = false;
  showTopicActionSheet: boolean = false;
  showDifficultyActionSheet: boolean = false;
  statDict: {} = {};
  public topicActionSheetButtons: any[] = [];
  public difficultyActionSheetButtons: any[] = [];
  feedbackModal: boolean = false;
  checkedAnswer: boolean = false;
  pendingAnswer: boolean = false;
  allowSounds: boolean = false;
  allowMusic: boolean = false;
  isReload: boolean = false;
  audio = new Audio();
  music = new Audio();
  showToolbar: boolean = false;
  submitClicked: boolean = false;
  protected readonly Object = Object;
  protected readonly onsubmit = onsubmit;
  // @ts-ignore
  private helpTimeOut = timeout;

  constructor(private quizSvc: QuizService, private translateService: TranslateService, private platform: Platform) {

  }

  public isDesktop() {
    let platforms = this.platform.platforms();
    return platforms[0] == "desktop" || platforms[0] == "mobileweb";
  }

  ngOnInit() {
    this.quizListSubs = this.quizSvc.quizzesChanged.subscribe(quizzes => {
      this.quizData = structuredClone(quizzes);
      for (let quiz of quizzes) {
        let question = {} as QuestionInGame;
        // @ts-ignore
        question.value = quiz[this.quiz_language].text;
        // @ts-ignore
        question.answers = quiz[this.quiz_language].answers;
        // @ts-ignore
        question.correct_answer = quiz[this.quiz_language].answers[quiz[this.quiz_language].correct_answer_index];
        this.quizList.push(question)
      }
      if (this.quizList?.length == 15) {
        let sortOrder = ""
        for (let i = 0; i < this.quizList.length; i++) {
          // @ts-ignore
          this.quizData[i][this.quiz_language].correct_answer = this.quizList[i].correct_answer
          this.quizList[i].answers = this.quizList[i].answers.sort(() => Math.random() - 0.5);
          // @ts-ignore
          for (let j = 0; j < 4; j++) {
            // @ts-ignore
            sortOrder += this.quizList[i].answers.indexOf(this.quizData[i][this.quiz_language].answers[j]).toString()
          }
          const langs = ["en", "de", "hu"]
          for (let l = 0; l < langs.length; l++) {
            // @ts-ignore
            this.quizData[i][langs[l]].correct_answer = this.quizData[i][langs[l]].answers[this.quizData[i][langs[l]].correct_answer_index]
            // @ts-ignore
            const clone = structuredClone(this.quizData[i][langs[l]].answers);
            for (let k = 0; k < 4; k++) {
              // @ts-ignore
              this.quizData[i][langs[l]].answers[parseInt(sortOrder[k])] = clone[k]
            }
          }
        }
        this.startBtnClicked = true;
        this.active = true;
      } else {
        this.networkError = "Service unavailable."
      }
    })
    this.loadTooltips();
    this.loadTopicActions()
    this.loadDifficultyActions();

  }

  loadTooltips() {
    this.translateService.getTranslation(this.quiz_language);
    this.translateService.get('quiz').subscribe((data: any) => {
      this.tooltips.halving = data.halving;
      this.tooltips.audience = data.audience;
      this.tooltips.phone = data.phone;
      this.tooltips.stop = data.stop;
    })
  }

  loadDifficultyActions() {
    this.difficultyActionSheetButtons = [];
    this.translateService.getTranslation(this.quiz_language)
    this.translateService.get('menu').subscribe((data: any) => {
      for (let item of this.difficultyList) {
        this.difficultyActionSheetButtons = this.difficultyActionSheetButtons.concat({
          text: data.difficulties[item],
          cssClass: this.questionDifficulty === item ? 'selected-action' : '',
          role: item === this.difficultyList[3] ? 'destructive' : '',
          data: {
            action: "difficulty",
            value: item,
          },
        },)
      }
      this.difficultyActionSheetButtons = this.difficultyActionSheetButtons.concat({
        text: data.cancel,
        role: 'cancel',
        data: {
          action: 'cancel',
          value: ''
        },
      });
    });
  }

  loadTopicActions() {
    this.topicActionSheetButtons = [];
    this.translateService.getTranslation(this.quiz_language)
    this.translateService.get('menu').subscribe((data: any) => {
      for (let item of this.topicList) {
        this.topicActionSheetButtons = this.topicActionSheetButtons.concat({
          text: data.topics[item],
          cssClass: this.questionTopic === item ? 'selected-action' : '',
          role: "",
          data: {
            action: "topic",
            value: item,
          },
        },)
      }

      this.topicActionSheetButtons = this.topicActionSheetButtons.concat({
        text: data.cancel,
        role: 'cancel',
        data: {
          action: 'cancel',
          value: ''
        },
      });
    });
  }

  ngOnDestroy() {
    this.quizListSubs.unsubscribe();
  }

  checkAnswer(answer: string) {
    this.pendingAnswer = true;
    if (this.quizList[this.level].correct_answer == answer) {
      if (this.level < 14) {
        setTimeout(() => {
          this.checkedAnswer = true;
          this.isAlertOpen = true;
          // @ts-ignore
          clearTimeout(this.helpTimeOut);
          this.playAudio("correct_answer", 2)
          this.usePhone = false;
          this.statDict = {};
        }, 4000)
        setTimeout(() => {
          this.isAlertOpen = false;
        }, 5000)
        setTimeout(() => {
          if (!this.outOfGame) {
            this.level += 1
            this.checkedAnswer = false;
            this.selectedAnswer = "";
            this.pendingAnswer = false;
            this.playAudioMusic();
          } else {
            this.active = false;
            this.pendingAnswer = false;
          }

        }, 5300)
        this.playAudio('final')
      } else {
        setTimeout(() => {
          this.checkedAnswer = true;
          this.isWinning = true;
          this.playAudio('correct_answer')
          // @ts-ignore
          clearTimeout(this.helpTimeOut);
          return
        }, 7100)
        this.playAudio('final')
      }
    } else {
      let timeout = 4000;
      if (this.level == 14) {
        timeout = 7000;
      }
      setTimeout(() => {
        this.checkedAnswer = true;
        this.music.pause();
        this.playAudio("wrong_answer")
        this.active = false;
        this.isAlertOpen = true;
        setTimeout(() => {
          this.isAlertOpen = false;
        }, 2500)
        // @ts-ignore
        clearTimeout(this.helpTimeOut);
      }, timeout)
      this.playAudio("final")
    }
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
        let phoneChanged = false;
        let halvingChanged = false;

        if (this.help_modules.phone) {
          this.help_modules.phone = false;
          phoneChanged = true;
        }
        if (this.help_modules.halving) {
          this.help_modules.halving = false;
          halvingChanged = true;
        }
        this.playAudio('audience', 36)
        // @ts-ignore
        this.helpTimeOut = setTimeout(() => {
          func();
          if (phoneChanged) {
            this.help_modules.phone = true;
          }
          if (halvingChanged) {
            this.help_modules.halving = true;
          }
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
      let audienceChanged = false;
      let halvingChanged = false;
      if (this.help_modules.audience) {
        this.help_modules.audience = false;
        audienceChanged = true;
      }
      if (this.help_modules.halving) {
        this.help_modules.halving = false;
        halvingChanged = true;
      }
      // @ts-ignore
      this.helpTimeOut = setTimeout(() => {
        this.usePhone = true;
        if (audienceChanged) {
          this.help_modules.audience = true;
        }
        if (halvingChanged) {
          this.help_modules.halving = true;
        }
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
    this.pendingAnswer = false;
    this.checkedAnswer = false;
    this.selectedAnswer = "";
    this.isWinning = false;
    this.outOfGame = false;
    this.isReload = true;
    this.audio.pause();
    this.music.pause();
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

  startQuiz() {
    this.playAudioMusic();
    this.quizSvc.fetchQuiz(this.questionTopic, this.questionDifficulty);
  }

  getTooltip(help_type: string): string {
    // @ts-ignore
    return this.tooltips[help_type];
  }

  // @ts-ignore
  logResult(ev) {
    if (ev.detail.data?.value) {
      if (ev.detail.data.action == "topic" && ev.detail.data.value) {
        this.questionTopic = ev.detail.data.value;
        this.loadTopicActions();
      }
      if (ev.detail.data.action == "difficulty" && ev.detail.data.value) {
        this.questionDifficulty = ev.detail.data.value;
        this.loadDifficultyActions();
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
      contactForm.reset()
      const email = contactForm.value;
      this.quizSvc.sendFeedbackEmail(email)
    } else {
      let messages = document.getElementById("messages");
      messages?.classList.add("ion-touched");
      messages?.classList.add("ion-invalid");
      this.submitClicked = true;
    }
  }

  playAudioMusic() {
    if (this.allowMusic) {
      let src = "";
      if (this.level < 5) {
        src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/gbsxnbblhj/11%20%24100-%241%2C000%20Questions.mp3"
      } else if (this.level === 5) {
        src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/aokfkhoocj/14%20%242%2C000%20Question.mp3"
      } else if (this.level === 6) {
        src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/mksvhlwtxc/19%20%244%2C000%20Question.mp3"
      } else if (this.level === 7) {
        src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/jpwsuamjxy/24%20%248%2C000%20Question.mp3"
      } else if (this.level === 8) {
        src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/qeevmijfco/29%20%2416%2C000%20Question.mp3"
      } else if (this.level === 9) {
        src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/zitvaxtwyx/34%20%2432%2C000%20Question.mp3"
      } else if (this.level === 10) {
        src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/rpjteuukem/39%20%2464%2C000%20Question.mp3"
      } else if (this.level === 11) {
        src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/foourcouxn/44%20%24125%2C000%20Question.mp3"
      } else if (this.level === 12) {
        src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/ffaekfyhys/49%20%24250%2C000%20Question.mp3"
      } else if (this.level === 13) {
        src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/wvlsjrnuzp/54%20%24500%2C000%20Question.mp3"
      } else {
        src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/hidywqfcea/59%20%241%2C000%2C000%20Question.mp3"
      }
      this.music.src = src;
      this.music.loop = true;
      this.music.load();
      this.music.play();
    }

  }

  playMusic() {
    this.allowMusic = true;
    if (this.active && !this.outOfGame) {
      this.playAudioMusic();
    }
  }

  stopMusic() {
    this.allowMusic = false;
    this.music.pause()
  }

  playAudio(name: string, timeout: number = 0) {
    if (this.allowSounds && !this.outOfGame) {
      let src = "";
      switch (name) {
        case 'correct_answer':
          if (this.level === 4) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/blntezgaun/12%20Win%20%241%2C000.mp3";
            timeout = 8;
          } else if (this.level === 5) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/njmvthwqgw/17%20%242%2C000%20Win.mp3";
          } else if (this.level === 6) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/pjijryqyei/22%20%244%2C000%20Win.mp3";
          } else if (this.level === 7) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/isggfzkliv/27%20%248%2C000%20Win.mp3";
          } else if (this.level === 8) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/yuzvzpvpmx/32%20%2416%2C000%20Win.mp3";
          } else if (this.level === 9) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/yhsegolhfo/37%20%2432%2C000%20Win.mp3";
            timeout = 8;
          } else if (this.level === 10) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/ereqgtncsi/42%20%2464%2C000%20Win.mp3";
          } else if (this.level === 11) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/evyfifizmc/47%20%24125%2C000%20Win.mp3";
          } else if (this.level === 12) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/evrltjdslu/52%20%24250%2C000%20Win.mp3";
          } else if (this.level === 13) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/isnasksttn/57%20%24500%2C000%20Win.mp3";
          } else if (this.level === 14) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/jhorhztmvh/77%20%241%2C000%2C000%20Win%20%28Double%20String%20Version%29.mp3";
          } else {
            src = "https://www.myinstants.com/media/sounds/correct_VsVqwRb.mp3";
          }
          break;
        case 'wrong_answer':
          if (this.level === 5) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/rjhzqvzlas/16%20%242%2C000%20Lose.mp3";
          } else if (this.level === 6) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/yfeukwjqpi/21%20%244%2C000%20Lose.mp3";
          } else if (this.level === 7) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/wuabusrlky/26%20%248%2C000%20Lose.mp3";
          } else if (this.level === 8) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/lcjeyuuohe/31%20%2416%2C000%20Lose.mp3";
          } else if (this.level === 9) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/nsgdfbhohc/36%20%2432%2C000%20Lose.mp3";
          } else if (this.level === 10) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/lxmljojuyt/41%20%2464%2C000%20Lose.mp3";
          } else if (this.level === 11) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/hljjczjopk/46%20%24125%2C000%20Lose.mp3";
          } else if (this.level === 12) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/mobwortxts/51%20%24250%2C000%20Lose.mp3";
          } else if (this.level === 13) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/brhweclkpt/56%20%24500%2C000%20Lose.mp3";
          } else if (this.level === 14) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/szpzgiupts/61%20%241%2C000%2C000%20Lose.mp3";
          } else {
            src = 'https://www.myinstants.com/media/sounds/wrong_JbK803k.mp3'
          }
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
        case 'final' :
          if (this.level === 5) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/awanowgypj/15%20%242%2C000%20Final%20Answer-.mp3"
          } else if (this.level === 6) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/kdklojqnph/20%20%244%2C000%20Final%20Answer-.mp3";
          } else if (this.level === 7) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/lhyuugzgqk/25%20%248%2C000%20Final%20Answer-.mp3"
          } else if (this.level === 8) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/lsxtvfepru/30%20%2416%2C000%20Final%20Answer-.mp3";
          } else if (this.level === 9) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/qmedsiwtys/35%20%2432%2C000%20Final%20Answer-.mp3";
          } else if (this.level === 10) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/jecbhnngvg/40%20%2464%2C000%20Final%20Answer-.mp3";
          } else if (this.level === 11) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/zossgcnjxl/45%20%24125%2C000%20Final%20Answer-.mp3";
          } else if (this.level === 12) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/dbmdofpign/50%20%24250%2C000%20Final%20Answer-.mp3";
          } else if (this.level === 13) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/kxzosrrgrk/55%20%24500%2C000%20Final%20Answer-.mp3";
          } else if (this.level === 14) {
            src = "https://vgmsite.com/soundtracks/who-wants-to-be-a-millionaire-the-album/pzaiedrqha/60%20%241%2C000%2C000%20Final%20Answer-.mp3";
          } else {
            src = ''
          }
          break;

        default:
          break;
      }

      if (name !== "final" && this.level > 5 && this.allowMusic) {
        this.music.pause();
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

  getAnswerClass(answer: string) {

    switch (answer) {

      case this.selectedAnswer  : // all cases
        if (!this.checkedAnswer) {
          return 'selected_answer';
        }
        if (this.checkedAnswer && !this.active && !this.outOfGame) {
          return 'wrong_answer';
        }
        if (this.checkedAnswer && this.outOfGame && !this.active) {
          if (this.selectedAnswer !== this.quizList[this.level].correct_answer) {
            return 'wrong_answer';
          }
          return 'correct_answer';
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
    if (lang != this.quiz_language.substring(0, 2)) {
      this.quiz_language = lang;
      this.translateService.use(this.quiz_language);
      if (this.active) {
        this.loadTooltips();
        this.quizList = [];
        for (let quiz of this.quizData) {
          let question = {} as QuestionInGame;
          // @ts-ignore
          question.value = quiz[this.quiz_language].text;
          // @ts-ignore
          question.answers = quiz[this.quiz_language].answers;
          // @ts-ignore
          question.correct_answer = quiz[this.quiz_language].correct_answer;

          this.quizList.push(question)
        }
      }
      this.loadTopicActions();
      this.loadDifficultyActions();
    }
  }

  answerOutOfGame() {
    this.stopMusic();
    this.outOfGame = true;
  }

  getPrize(): string {
    if (this.outOfGame) {
      if (this.level > 0) {
        return this.prizesList[this.level - 1]
      }
      return "£0"
    }
    if (!this.active) {
      if (this.level > 9) {
        return this.prizesList[9]
      } else if (this.level > 4) {
        return this.prizesList[4]
      } else {
        return "£0"
      }
    }
    return this.prizesList[this.level]
  }

  isMobileScreen() {
    return this.platform.width() <= 560;
  }
}
