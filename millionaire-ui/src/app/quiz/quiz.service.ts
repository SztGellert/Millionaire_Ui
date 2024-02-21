import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Subject} from "rxjs";

export interface Question {
  en: QuestionDetail;
  de: QuestionDetail;
  hu: QuestionDetail;
  topic: string;
  difficulty: string;
  id: number
}

export interface QuestionDetail {
  text: string;
  answers: string[];
  correct_answer_index: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  quizzesChanged: Subject<Question[]> = new Subject<Question[]>;

  constructor(private http: HttpClient) {
  }

  fetchQuiz(topic: string, difficulty: string, exceptions: {}) {

    if (topic == "all") {
      topic = ""
    }
    if (difficulty == "all") {
      difficulty = ""
    }

    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.http.post<Question[]>('https://yi4tfqk2xmyzsgt72ojur5bk6q0mjtnw.lambda-url.eu-north-1.on.aws?topic=' + topic + '&difficulty=' + difficulty, exceptions, {'headers': headers})
      .subscribe(resData => this.quizzesChanged.next(resData));
  }

  sendFeedbackEmail(data: any) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.http.post('https://formspree.io/f/mdorryrg',
      {name: data.name, replyto: data.email, message: data.messages},
      {'headers': headers}).subscribe(
      response => {
        console.log(response);
      }
    );
  }

}
