/*
  A flexible & generic pagination service for paginating with Firestore.
  This is useful for features like infinite scroll across the app.
  Tutorial: https://angularfirebase.com/lessons/infinite-scroll-firestore-angular/
*/

import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, scan, first } from 'rxjs/operators';

import { PaginationQueryConfig } from '../interfaces/pagination.query.config';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  // Source data
  // tslint:disable-next-line: variable-name
  private _done = new BehaviorSubject(false);
  // tslint:disable-next-line: variable-name
  private _loading = new BehaviorSubject(false);
  // tslint:disable-next-line: variable-name
  private _data = new BehaviorSubject([]);

  private query: PaginationQueryConfig;

  // Observable data
  data: Observable<any>;
  done: Observable<boolean> = this._done.asObservable();
  loading: Observable<boolean> = this._loading.asObservable();

  constructor(private afs: AngularFirestore) {
  }

  // Initial query sets options and defines the Observable
  // passing opts will override the defaults
  init(path: string, field: string, opts?: any) {
    this.query = {
      path,
      field,
      limit: 2,
      reverse: false,
      prepend: false,
      where: null,
      ...opts
    };

    const firstP = this.afs.collection(this.query.path, ref => {
      return ref
        .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
        .limit(this.query.limit);
    });

    this.mapAndUpdate(firstP);

    // Create the observable array for consumption in components
    this.data = this._data.asObservable().pipe(scan((acc, val) => {
      const items = [];
      val.forEach((v: any) => {
        for (let index = 0; index < acc.length; index++) {
          const a = acc[index];
          if (a.doc.id === v.doc.id) {
            acc[index] = v; // replace the current doc with the updated doc.
            return;
          }
        }
        items.push(v); // if the doc is not found from the current list, append it
      });
      return this.query.prepend ? acc.concat(items) : items.concat(acc);
    }));
  }

  // Retrieves additional data from firestore
  more() {
    const cursor = this.getCursor();

    const more = this.afs.collection(this.query.path, ref => {
      return ref
        .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
        .limit(this.query.limit)
        .startAfter(cursor);
    });
    this.mapAndUpdate(more);
  }

  // Determines the doc snapshot to paginate query
  private getCursor() {
    const current = this._data.value;
    if (current.length) {
      return this.query.prepend ? current[0].doc : current[current.length - 1].doc;
    }
    return null;
  }


  // Maps the snapshot to usable format the updates source
  private mapAndUpdate(col: AngularFirestoreCollection<any>) {

    if (this._done.value || this._loading.value) {
      return;
    }

    // loading
    this._loading.next(true);

    // Map snapshot with doc ref (needed for cursor)
    return col.snapshotChanges()
      .pipe(tap(arr => {
        let values = arr.map(snap => {
          const data = snap.payload.doc.data();
          const doc = snap.payload.doc;
          return {...data, doc};
        });

        // If prepending, reverse the batch order
        values = this.query.prepend ? values.reverse() : values;

        // update source with new values, done loading
        this._data.next(values);
        this._loading.next(false);

        // no more values, mark done
        if (!values.length) {
          this._done.next(true);
        }
      }), first())
      .subscribe();

  }

}
