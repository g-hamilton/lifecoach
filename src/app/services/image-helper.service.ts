import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {isString} from '@angular/fire/database/utils';

@Injectable({
  providedIn: 'root'
})
export class ImageHelperService {

  constructor() {
  }

  fixOrientation(file): Observable<any> {
    return new Observable((observer) => {
      this.getOrientation(file)
        .subscribe(orientation => {
          this.getBase64(file)
            .pipe(switchMap((base64) => this.resetOrientation(base64, orientation)))
            .subscribe((fixed64) => {
              observer.next(this.dataURItoBlob(fixed64));
              observer.complete();
            }, error1 => {
              observer.error(error1);
              observer.complete();
            });
        });
    });
  }

  getOrientation(file): Observable<any> {
    return new Observable((observer) => {
      let reader: any;
      reader = new FileReader();
      reader.onload = (event) => {

        const view = new DataView(event.target.result);

        if (view.getUint16(0, false) !== 0xFFD8) {
          observer.next(-2);
          observer.complete();
        }

        const length = view.byteLength;
        let offset = 2;

        while (offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;

          if (marker === 0xFFE1) {
            if (view.getUint32(offset += 2, false) !== 0x45786966) {
              observer.next(-1);
              observer.complete();
            }
            const little = view.getUint16(offset += 6, false) === 0x4949;
            offset += view.getUint32(offset + 4, little);
            const tags = view.getUint16(offset, little);
            offset += 2;

            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                observer.next(view.getUint16(offset + (i * 12) + 8, little));
                observer.complete();
              }
            }
            // tslint:disable-next-line:no-bitwise
          } else if ((marker & 0xFF00) !== 0xFF00) {
            break;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        observer.next(-1);
        observer.complete();
      };

      try {
        reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
      } catch (e) {
        observer.error(e);
      }
    });
  }

  getBase64(file): Observable<any> {
    return new Observable<any>((observer) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result;
        observer.next(base64);
      };
      reader.onerror = (error) => {
        observer.error(error);
      };
    });
  }

  resetOrientation(srcBase64, srcOrientation): Observable<any> {
    return new Observable((observer) => {
      const img = new Image();

      img.onerror = () => {
        observer.error(new Error('brokenImage'));
        observer.complete();
      };

      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const  canvas = document.createElement('canvas');
        const  ctx = canvas.getContext('2d');

        // set proper canvas dimensions before transform & export
        if (4 < srcOrientation && srcOrientation < 9) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        // transform context before drawing image
        switch (srcOrientation) {
          case 2:
            ctx.transform(-1, 0, 0, 1, width, 0);
            break;
          case 3:
            ctx.transform(-1, 0, 0, -1, width, height);
            break;
          case 4:
            ctx.transform(1, 0, 0, -1, 0, height);
            break;
          case 5:
            ctx.transform(0, 1, 1, 0, 0, 0);
            break;
          case 6:
            ctx.transform(0, 1, -1, 0, height, 0);
            break;
          case 7:
            ctx.transform(0, -1, -1, 0, height, width);
            break;
          case 8:
            ctx.transform(0, -1, 1, 0, 0, width);
            break;
          default:
            break;
        }

        // draw image
        ctx.drawImage(img, 0, 0);

        // export base64
        observer.next(canvas.toDataURL());
      };

      img.src = srcBase64;
    });
  }


  dataURItoBlob(dataURI) {
    const bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
      atob(dataURI.split(',')[1]) :
      unescape(dataURI.split(',')[1]);
    const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const max = bytes.length;
    const ia = new Uint8Array(max);
    for (let i = 0; i < max; i++) {
      ia[i] = bytes.charCodeAt(i);
    }
    // const blob = new Blob([ia], { type: mime });
    return new File([ia], 'image.jpeg', {type: mime});
  }


  resizeImage(file, base64?: boolean, maxSize?: number, quality?: number): Promise<{ img, height, width }> {
    if (base64 == null) {
      base64 = false;
    }
    if (maxSize == null) {
      maxSize = 1024;
    }
    if (quality == null) {
      quality = 1;
    }
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement('canvas');


    const resize = () => {
      let width = image.width;
      let height = image.height;

      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(image, 0, 0, width, height);
      canvas.getContext('2d').globalCompositeOperation = 'destination-over';
      canvas.getContext('2d').fillStyle = '#ffffff';
      canvas.getContext('2d').fillRect(0, 0, width, height);

      if (base64) {
        return {img: canvas.toDataURL('image/jpeg', quality), width, height};
      }

      return {img: this.dataURItoBlob(canvas.toDataURL('image/jpeg', quality)), width, height};
    };

    return new Promise((ok, no) => {

      reader.onload = (readerEvent: any) => {
        image.onload = () => ok(resize());
        image.onerror = () => {
          no(new Error('brokenImage'));
          return;
        };

        image.src = readerEvent.target.result;
      };
      console.log(isString(file));
      if (isString(file) || !file.type.match(/image.*/)) {
        reader.readAsDataURL(this.dataURItoBlob(file));
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

}
