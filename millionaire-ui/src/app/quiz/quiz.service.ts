import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
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

  constructor(private http: HttpClient) {
  }
  quizzesChanged: Subject<Question[]> = new Subject<Question[]>;

  fetchQuiz(topic: string, difficulty: string) {
    this.http.get<Question[]>('https://yi4tfqk2xmyzsgt72ojur5bk6q0mjtnw.lambda-url.eu-north-1.on.aws?topic=' + topic + '&difficulty=' + difficulty)
      .subscribe(resData => this.quizzesChanged.next(resData));
  }
}




