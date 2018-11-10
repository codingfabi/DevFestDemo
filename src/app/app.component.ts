import { Component } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchDBAuthentication from 'pouchdb-authentication'; 
import { FormGroup, FormBuilder, Validators }  from '@angular/forms';
import { countryModel } from './models/countryModel';

PouchDB.plugin(PouchDBAuthentication);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'devfestapp';
  private _remoteDatabase: any;
  db = new PouchDB('countries');

  //initilize Variable for MatForms
  deleteString: string;
  searchString: string;

  country : countryModel = new countryModel();
  countryForm: FormGroup;
  searchForm: FormGroup;
  deleteForm: FormGroup;

  constructor(private formBuilder: FormBuilder){
    this._remoteDatabase = new PouchDB('http://localhost:5984/countries',
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
  this.countryForm = this.formBuilder.group({
      'name': [this.country.name, [
          Validators.required        
      ]],
      'capital': [this.country.capital, [
          Validators.required
        ]],
      'residents' : [this.country.residents, [ 
          Validators.required
        ]]
  })
  this.searchForm = this.formBuilder.group({
      'search': [this.searchString, [
          Validators.required        
      ]]
  })
  this.deleteForm = this.formBuilder.group({
    'delete': [this.deleteString, [
      Validators.required
    ]]
  });
  PouchDB.sync(this.db, this._remoteDatabase);
}

  addToDB(doc){
    this.db.put(doc);
    console.log("Added this doc: \n", doc);
  }


  //get specific source
  getFromDB(id){

    this.db.get(id).then(function(country){
      console.log(country);
    }).catch(function(err){
      console.log(err);
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

  addCountry(){

      var tempcountry = {
        "_id":this.country.name,
        "capital":this.country.capital,
        "residents":this.country.residents
      };

      //check if country is allready existing, if so just update, else add new. I know it is not single responsibility, but it saves time. 
      this.db.get(this.country.name).then((doc)=> {
        if(doc===undefined){
          this.db.put(tempcountry);
        }
        else{
          tempcountry["_rev"]=doc._rev;
          this.db.put(tempcountry);
        }
      });
    }
  
  searchDB(){
    console.log(this.searchString);
    this.db.get(this.searchString).then(function(country){
      console.log(country);
    }).catch(function (err){
      console.log(err);
    });
  }

  deleteCountry(){

    console.log(this.deleteString);
    this.db.get(this.deleteString).then((country) => {
      this.db.remove(country);
    }).catch(function (err){
      console.log(err);
    });
  }
}