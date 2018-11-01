import { Component } from '@angular/core';
import PouchDB from 'pouchdb';
import {FormGroup, FormBuilder, Validators}  from '@angular/forms';
import {countrieModel} from './models/countrieModel';
import PouchDBAuthentication from 'pouchdb-authentication'; 
import { ValueTransformer } from '@angular/compiler/src/util';

PouchDB.plugin(PouchDBAuthentication);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'defvestapp';
  private _remoteDatabase: any;
  db = new PouchDB('countires');
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
    this._remoteDatabase = new PouchDB('http://192.168.178.55:5984/countries',
      {

        ajax: {
          rejectUnauthorized: false, timeout: 60000,
        },
        // This is a workaround for PouchDB 7.0.0 with pouchdb-authentication 1.1.3:
        // https://github.com/pouchdb-community/pouchdb-authentication/issues/239
        // It is necessary, until this merged PR will be published in PouchDB 7.0.1
        // https://github.com/pouchdb/pouchdb/pull/7395
        fetch(url, opts) {
          opts.credentials = 'include';
          return (PouchDB as any).fetch(url, opts);
        },
        skip_setup: true,
      } as PouchDB.Configuration.RemoteDatabaseConfiguration
    );
    const ajaxOpts = {
      ajax: {
        headers: {
          Authorization: 'Basic ' + window.btoa('testuser' + ':' + 'pass')
        }
      }
    }
    this._remoteDatabase.logIn('testuser', 'pass', ajaxOpts).then(() =>{
      console.log("Login Succesfull");
      this._remoteDatabase.info().then(function (info) {
        console.log(info);
      })
    })
    
  }



 

  ngOnInit(){
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
  PouchDB.sync(this.db, this._remoteDatabase);
}

  addToDB(doc){
    this.db.put(doc);
    console.log("Added this doc: \n", doc);
  }


  //get specific source
  getFromDB(id){

    if(id===undefined){
      console.log("ID is undef");
    }
    this.db.get(id).then(function(countrie){
      console.log(countrie);
    })
  }

  getAllfromDB(){
    console.log("alldocs");
    this.db.allDocs({
    }).then(function (result){
      console.log(result);
    }).catch( function (err){
      console.log(err);
    });
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