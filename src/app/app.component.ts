import { Component, OnInit } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchDBAuthentication from 'pouchdb-authentication';
import { countryModel } from './models/countryModel';
import { config } from './config';

PouchDB.plugin(PouchDBAuthentication);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'devfestapp';

  /**
   * RemoteDB
   */
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

  /**
   * LocalDB
   */
  private _localDatabase = new PouchDB(config.db);

  // Initialize Variable for MatForms
  deleteString: string;
  searchString: string;

  country: countryModel = new countryModel();

  constructor() {
    /**
     * Login at RemoteDB
     */
    const ajaxOpts = {
      ajax: {
        headers: {
          Authorization: 'Basic ' + window.btoa(`${config.user}:${config.password}`)
        }
      }
    } as any;
    this._remoteDatabase.logIn(config.user, config.password, ajaxOpts, () => {
      console.log('Login Successful');
      this._remoteDatabase.info().then(info => console.log(info));
    });
  }

  ngOnInit() {
    PouchDB.sync(this._localDatabase, this._remoteDatabase);
  }

  addToDB(doc) {
    return this._localDatabase.put(doc)
      .then(() => console.log('Added this doc: \n', doc));
  }

  // get specific source
  getFromDB(id) {
    this._localDatabase.get(id)
      .then(country => console.log(country))
      .catch(err => console.error(err));
  }

  getAllFromDB() {
    console.log('alldocs');
    this._localDatabase.allDocs({})
      .then(result => console.log(result))
      .catch(err => console.error(err));
  }

  addCountry() {
      const tempCountry = {
        '_id': this.country.name,
        'capital': this.country.capital,
        'residents': this.country.residents
      };

      // check if country is already existing, if so just update, else add new. I know it is not single responsibility, but it saves time. 
      this._localDatabase.get(this.country.name).then(doc => {
        tempCountry['_rev'] = doc._rev;
        return this._localDatabase.put(tempCountry);
      }).catch(err => {
        if (err.status === 404) {
          return this._localDatabase.put(tempCountry);
        }
      });
    }

  searchDB() {
    console.log(this.searchString);
    this._localDatabase.get(this.searchString)
      .then(country => console.log(country))
      .catch(err => console.error(err));
  }

  deleteCountry() {
    console.log(this.deleteString);
    this._localDatabase.get(this.deleteString)
      .then(country => this._localDatabase.remove(country))
      .catch(err => console.error(err));
  }
}
