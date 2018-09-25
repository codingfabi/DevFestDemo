import { Component } from '@angular/core';
import PouchDB from 'pouchdb';
import {FormGroup, FormBuilder, Validators}  from '@angular/forms';
import {countrieModel} from './models/countrieModel';
import { ValueTransformer } from '@angular/compiler/src/util';

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
  searchString: string;

  countrie : countrieModel = new countrieModel();
  countrieForm: FormGroup;
  searchForm: FormGroup;

  constructor(private formBuilder: FormBuilder){
  }



  ngOnInit(){
  this.db.info().then(function (info) {
    console.log(info);
  })

  this.countrieForm = this.formBuilder.group({
      'name': [this.countrie.name, [
          Validators.required        
      ]],
      'capital': [this.countrie.capital, [
          Validators.required
        ]],
      'residents' : [this.countrie.residents, [ 
          Validators.required
        ]]
  })
  this.searchForm = this.formBuilder.group({
      'search': [this.searchString, [
          Validators.required        
      ]]
  })
}

  addToDB(doc){
    this.db.put(doc);
    console.log("Added this doc: \n", doc);
  }

  getFromDB(id){

    if(id===undefined){
      console.log("ID is undef");
    }
    this.db.get(id).then(function(countrie){
      console.log(countrie);
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

  addCountrie(){

      var tempCountrie = {
        "_id":this.countrie.name,
        "capital":this.countrie.capital,
        "residents":this.countrie.residents
      };

      this.addToDB(tempCountrie);
      //this.getFromDB(this.countrie.name);
    }
  
  searchDB(){
    console.log(this.searchString);
    this.db.get(this.searchString).then(function(countrie){
      console.log(countrie);
    });
  }
}
