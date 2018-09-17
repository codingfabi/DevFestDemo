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
  dummie={
    "_id":"Germany",
    "capital":"Berlin",
    "residents": 80000000
  }
  constructor(){
  }



  ngOnInit(){
  this.db.info().then(function (info) {
    console.log(info);
  })
}

  addDummie(){
      this.db.put(this.dummie);
      console.log("addedDummie");
  }

  getDummie(){
    this.db.get("Germany").then(function (dummie){
      console.log(dummie);
      console.log("Got Dummie");
    })
  }
  
}
