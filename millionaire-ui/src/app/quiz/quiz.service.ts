import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Subject} from "rxjs";

export interface Question {
  value: string;
  answers: string[];
  correct_answer: string;
  type: string;
  difficulty: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class QuizService {

  constructor(private http: HttpClient) {
  }
  quizzesChanged: Subject<Question[]> = new Subject<Question[]>;

  fetchQuiz() {
    this.http.get<Question[]>('https://yi4tfqk2xmyzsgt72ojur5bk6q0mjtnw.lambda-url.eu-north-1.on.aws?topic=arts')
      .subscribe(resData => this.quizzesChanged.next(resData));
  }
}




