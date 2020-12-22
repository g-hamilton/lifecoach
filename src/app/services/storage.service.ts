import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: AngularFireStorage
  ) { }

  getStorageDomain() {
    return 'https://firebasestorage.googleapis.com';
  }

  generateRandomImgID() {
    return Math.random().toString(36).substr(2, 9);
  }

  async storePhotoUpdateDownloadUrl(uid: string, img: string) {
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
      const destination = this.storage.ref(path);
      const snap = await destination.putString(original, 'data_url');
      const storagePath = await snap.ref.getDownloadURL();
      console.log(`Profile img stored & download URL ${storagePath} captured successfully.`);
      return storagePath;
    } catch (err) {
      console.error(err);
      return original;
    }
  }

  deleteProfilePicFromStorage(uid: string, imgId: string) {
    /*
    1. Check if a profile image exists by looking for a download url
    2. If the image exists in storage, delete it
    */
    const path = `users/${uid}/profilePics/${imgId}`;
    try {
      const $obs = this.storage.ref(path).getDownloadURL();
      $obs.pipe(first()).subscribe(data => {
        if (data) {
          this.storage.ref(path).delete();
        } else {
          console.log(`Profile image not found in storage.`);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  deleteProfileVideoFromStorage(uid: string, path: string) {
    /*
    1. Check if a profile video exists by looking for a download url
    2. If the video exists in storage, delete it
    */
    try {
      const $obs = this.storage.ref(path).getDownloadURL();
      $obs.pipe(first()).subscribe(data => {
        if (data) {
          this.storage.ref(path).delete();
        } else {
          console.log(`Profile video not found in storage.`);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  async storeCourseImageUpdateDownloadUrl(uid: string, img: string) {
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
      const destination = this.storage.ref(path);
      const snap = await destination.putString(original, 'data_url');
      const storagePath = await snap.ref.getDownloadURL();
      console.log(`Course img stored & download URL ${storagePath} captured successfully.`);
      return storagePath;
    } catch (err) {
      console.error(err);
      return original;
    }
  }

  async storeTinyMceImage(file: File, userId: string) {
    /*
    1. Stores an image file at a given path in Firebase Storage
    2. Returns the newly assigned updated storage URL
    */

    // The storage path
    const path = `users/${userId}/editorContent/${file.name}`;


    try {
      console.log(`Attempting storage upload...`);

      const snap = await this.storage.upload(path, file);

      const downloadUrl = await snap.ref.getDownloadURL();

      console.log(`File stored & download URL ${downloadUrl} captured successfully.`);
      return downloadUrl;

    } catch (err) {
      console.error(err);
    }
  }

  async storeServiceImageUpdateDownloadUrl(uid: string, img: string) {
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
      const destination = this.storage.ref(path);
      const snap = await destination.putString(original, 'data_url');
      const storagePath = await snap.ref.getDownloadURL();
      console.log(`Img stored & download URL ${storagePath} captured successfully.`);
      return storagePath;
    } catch (err) {
      console.error(err);
      return original;
    }
  }

  async storeProgramImageUpdateDownloadUrl(uid: string, img: string) {
    /*
    1. Stores an image at a given path in Firebase Storage with an auto assigned ID
    2. Replaces the dataURL with the storage URL
    3. Returns the newly assigned updated storage URL
    4. If unable to store the image, returns the original dataURL as a fallback.
    */
    const original = img;
    const imgId = this.generateRandomImgID();
    const path = `users/${uid}/programImages/${imgId}`;
    try {
      console.log(`Attempting storage upload for user ${uid}`);
      const destination = this.storage.ref(path);
      const snap = await destination.putString(original, 'data_url');
      const storagePath = await snap.ref.getDownloadURL();
      console.log(`Program img stored & download URL ${storagePath} captured successfully.`);
      return storagePath;
    } catch (err) {
      console.error(err);
      return original;
    }
  }

  deleteProgramImageFromStorage(uid: string, imgId: string) {
    /*
    1. Check if an image exists by looking for a download url
    2. If the image exists in storage, delete it
    */
    const path = `users/${uid}/programImages/${imgId}`;
    try {
      const $obs = this.storage.ref(path).getDownloadURL();
      $obs.pipe(first()).subscribe(data => {
        if (data) {
          this.storage.ref(path).delete();
        } else {
          console.log(`Program image not found in storage.`);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

}
