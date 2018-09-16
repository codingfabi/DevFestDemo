import { Component } from '@angular/core';
import PouchDB from 'pouchdb';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'defvestapp';
  db = new PouchDB('http://localhost:5984/countries');
}
