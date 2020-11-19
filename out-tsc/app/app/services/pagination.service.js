/*
  A flexible & generic pagination service for paginating with Firestore.
  This is useful for features like infinite scroll across the app.
  Tutorial: https://angularfirebase.com/lessons/infinite-scroll-firestore-angular/
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { tap, scan, first } from 'rxjs/operators';
let PaginationService = class PaginationService {
    constructor(afs) {
        this.afs = afs;
        // Source data
        // tslint:disable-next-line: variable-name
        this._done = new BehaviorSubject(false);
        // tslint:disable-next-line: variable-name
        this._loading = new BehaviorSubject(false);
        // tslint:disable-next-line: variable-name
        this._data = new BehaviorSubject([]);
        this.done = this._done.asObservable();
        this.loading = this._loading.asObservable();
    }
    // Initial query sets options and defines the Observable
    // passing opts will override the defaults
    init(path, field, opts) {
        this.query = Object.assign({ path,
            field, limit: 2, reverse: false, prepend: false, where: null }, opts);
        const firstP = this.afs.collection(this.query.path, ref => {
            return ref
                .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
                .limit(this.query.limit);
        });
        this.mapAndUpdate(firstP);
        // Create the observable array for consumption in components
        this.data = this._data.asObservable().pipe(scan((acc, val) => {
            const items = [];
            val.forEach((v) => {
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
    getCursor() {
        const current = this._data.value;
        if (current.length) {
            return this.query.prepend ? current[0].doc : current[current.length - 1].doc;
        }
        return null;
    }
    // Maps the snapshot to usable format the updates source
    mapAndUpdate(col) {
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
                return Object.assign(Object.assign({}, data), { doc });
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
};
PaginationService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [AngularFirestore])
], PaginationService);
export { PaginationService };
//# sourceMappingURL=pagination.service.js.map