var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { first } from 'rxjs/operators';
let StorageService = class StorageService {
    constructor(storage) {
        this.storage = storage;
    }
    getStorageDomain() {
        return 'https://firebasestorage.googleapis.com';
    }
    generateRandomImgID() {
        return Math.random().toString(36).substr(2, 9);
    }
    storePhotoUpdateDownloadUrl(uid, img) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
            1. Stores an image at a given path in Firebase Storage with an auto assigned ID
            2. Replaces the dataURL with the storage URL
            3. Returns the newly assigned updated storage URL
            4. If unable to store the image, returns the original dataURL as a fallback.
            */
            const original = img;
            const imgId = this.generateRandomImgID();
            const path = `users/${uid}/profilePics/${imgId}`;
            try {
                console.log(`Attempting storage upload for user ${uid}`);
                const destination = this.storage.ref(path);
                const snap = yield destination.putString(original, 'data_url');
                const storagePath = yield snap.ref.getDownloadURL();
                console.log(`Profile img stored & download URL ${storagePath} captured successfully.`);
                return storagePath;
            }
            catch (err) {
                console.error(err);
                return original;
            }
        });
    }
    deleteProfilePicFromStorage(uid, imgId) {
        /*
        1. Check if a profile image exists by looking for a download url
        2. If the image exists in storage, delete it
        */
        const path = `users/${uid}/profilePics/${imgId}`;
        try {
            const $obs = this.storage.ref(path).getDownloadURL();
            $obs.pipe(first()).subscribe(data => {
                if (data) {
                    this.storage.ref(path).delete();
                }
                else {
                    console.log(`Profile image not found in storage.`);
                }
            });
        }
        catch (err) {
            console.error(err);
        }
    }
    deleteProfileVideoFromStorage(uid, path) {
        /*
        1. Check if a profile video exists by looking for a download url
        2. If the video exists in storage, delete it
        */
        try {
            const $obs = this.storage.ref(path).getDownloadURL();
            $obs.pipe(first()).subscribe(data => {
                if (data) {
                    this.storage.ref(path).delete();
                }
                else {
                    console.log(`Profile video not found in storage.`);
                }
            });
        }
        catch (err) {
            console.error(err);
        }
    }
    storeCourseImageUpdateDownloadUrl(uid, img) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
            1. Stores an image at a given path in Firebase Storage with an auto assigned ID
            2. Replaces the dataURL with the storage URL
            3. Returns the newly assigned updated storage URL
            4. If unable to store the image, returns the original dataURL as a fallback.
            */
            const original = img;
            const imgId = this.generateRandomImgID();
            const path = `users/${uid}/coursePics/${imgId}`;
            try {
                console.log(`Attempting storage upload for user ${uid}`);
                const destination = this.storage.ref(path);
                const snap = yield destination.putString(original, 'data_url');
                const storagePath = yield snap.ref.getDownloadURL();
                console.log(`Course img stored & download URL ${storagePath} captured successfully.`);
                return storagePath;
            }
            catch (err) {
                console.error(err);
                return original;
            }
        });
    }
    storeTinyMceImage(file, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
            1. Stores an image file at a given path in Firebase Storage
            2. Returns the newly assigned updated storage URL
            */
            // The storage path
            const path = `users/${userId}/editorContent/${file.name}`;
            try {
                console.log(`Attempting storage upload...`);
                const snap = yield this.storage.upload(path, file);
                const downloadUrl = yield snap.ref.getDownloadURL();
                console.log(`File stored & download URL ${downloadUrl} captured successfully.`);
                return downloadUrl;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    storeServiceImageUpdateDownloadUrl(uid, img) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
            1. Stores an image at a given path in Firebase Storage with an auto assigned ID
            2. Replaces the dataURL with the storage URL
            3. Returns the newly assigned updated storage URL
            4. If unable to store the image, returns the original dataURL as a fallback.
            */
            const original = img;
            const imgId = this.generateRandomImgID();
            const path = `users/${uid}/serviceImages/${imgId}`;
            try {
                console.log(`Attempting storage upload for user ${uid}`);
                const destination = this.storage.ref(path);
                const snap = yield destination.putString(original, 'data_url');
                const storagePath = yield snap.ref.getDownloadURL();
                console.log(`Img stored & download URL ${storagePath} captured successfully.`);
                return storagePath;
            }
            catch (err) {
                console.error(err);
                return original;
            }
        });
    }
};
StorageService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [AngularFireStorage])
], StorageService);
export { StorageService };
//# sourceMappingURL=storage.service.js.map