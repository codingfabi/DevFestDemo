import { Component } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchDBAuthentication from 'pouchdb-authentication'; 
import { FormGroup, FormBuilder, Validators }  from '@angular/forms';
import { countryModel } from './models/countryModel';
import { config } from './config'

PouchDB.plugin(PouchDBAuthentication);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'devfestapp';
  private _remoteDatabase = new PouchDB(`${config.remoteUrl}/${config.db}`, {
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
  } as PouchDB.Configuration.RemoteDatabaseConfiguration);
  private _localDatabase = new PouchDB(config.db);

  //initilize Variable for MatForms
  deleteString: string;
  searchString: string;

  country : countryModel = new countryModel();
  countryForm: FormGroup;
  searchForm: FormGroup;
  deleteForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    const ajaxOpts = {
      ajax: {
        headers: {
          Authorization: 'Basic ' + window.btoa(`${config.user}:${config.password}`)
        }
      }
    }
    this._remoteDatabase.logIn(config.user, config.password, ajaxOpts).then(() =>{
      console.log("Login Successful");
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
  PouchDB.sync(this._localDatabase, this._remoteDatabase);
}

  addToDB(doc){
    this._localDatabase.put(doc);
    console.log("Added this doc: \n", doc);
  }


  //get specific source
  getFromDB(id){
    this._localDatabase.get(id).then(function(country){
      console.log(country);
    }).catch(function(err){
      console.log(err);
    })  
  }

  getAllFromDB(){
    console.log("alldocs");
    this._localDatabase.allDocs({
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
      this._localDatabase.get(this.country.name).then((doc)=> {
        if(doc === undefined){
          this._localDatabase.put(tempcountry);
        }
        else{
          tempcountry["_rev"]=doc._rev;
          this._localDatabase.put(tempcountry);
        }
      });
    }
  
  searchDB(){
    console.log(this.searchString);
    this._localDatabase.get(this.searchString).then(function(country){
      console.log(country);
    }).catch(function (err){
      console.log(err);
    });
  }

  deleteCountry(){
    console.log(this.deleteString);
    this._localDatabase.get(this.deleteString).then((country) => {
      this._localDatabase.remove(country);
    }).catch(function (err){
      console.log(err);
    });
  }
}