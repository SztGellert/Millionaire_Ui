import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Subject} from "rxjs";

export interface Question {
  value: string;
  answers: string[];
  correct_answer: string;
  topic: string;
  difficulty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  quizzesChanged: Subject<Question[]> = new Subject<Question[]>;

  constructor(private http: HttpClient) {
  }

  fetchQuiz(topic: string, difficulty: string) {

    if (topic == "all") {
      topic = ""
    }
    if (difficulty == "all") {
      difficulty = ""
    }

    this.http.get<Question[]>('https://yi4tfqk2xmyzsgt72ojur5bk6q0mjtnw.lambda-url.eu-north-1.on.aws?topic=' + topic + '&difficulty=' + difficulty)
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
