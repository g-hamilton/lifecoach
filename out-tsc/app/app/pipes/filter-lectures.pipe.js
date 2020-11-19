var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe } from '@angular/core';
let FilterLecturesPipe = class FilterLecturesPipe {
    transform(items, section) {
        if (!items || !section || !section.lectures) {
            return null;
        }
        // filter all course lectures.
        // any lectures which do not have a matching id in the relevant section will be filtered out.
        // so, sections should only contain associated lectures in the UI.
        // Important: for correct drag and drop ordering, the original order of filtered items must be preserved
        const filteredPreservingOrder = [];
        section.lectures.forEach(l => {
            const index = items.findIndex(i => i.id === l);
            if (index !== -1) {
                filteredPreservingOrder.push(items[index]);
            }
        });
        return filteredPreservingOrder;
    }
};
FilterLecturesPipe = __decorate([
    Pipe({
        name: 'filterLectures',
        pure: false // enable change detection to re-run pipe
    })
], FilterLecturesPipe);
export { FilterLecturesPipe };
//# sourceMappingURL=filter-lectures.pipe.js.map