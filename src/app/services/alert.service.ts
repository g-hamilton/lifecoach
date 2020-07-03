import { Inject, Injectable } from '@angular/core';
import swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';

/*
  Using SweetAlert2
  https://sweetalert2.github.io/
*/

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    @Inject(DOCUMENT) private document: any,
  ) { }

  alert(type: 'basic' | 'title-and-text' | 'success-message' | 'warning-message-and-confirmation' |
  'warning-message-and-cancel' | 'custom-html' | 'auto-close' | 'input-field' | 'warning-message' |
  'question-and-confirmation' | 'special-delete-account' | 'info-message',
  // tslint:disable-next-line: align
  title?: string, text?: string, confirmText?: string, cancelText?: string, successTitle?: string, successText?: string,
  // tslint:disable-next-line: align
  cancelledTitle?: string, cancelledText?: string, html?: string) {

    return new Promise((resolve) => {
      if (type === 'basic') {
        swal.fire({
          title: title ? title : 'Here\'s a message!',
          buttonsStyling: false,
          confirmButtonClass: 'btn btn-round btn-success'
        })
        .then(result => {
          resolve({complete: true});
        })
        .catch(err => console.error(err));
      } else if (type === 'title-and-text') {
        swal.fire({
          title: title ? title : 'Here\'s a message!',
          text: text ? text : 'It\'s pretty, isn\'t it?',
          buttonsStyling: false,
          confirmButtonClass: 'btn btn-round btn-primary',
          confirmButtonText: confirmText ? confirmText : 'OK'
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => console.error(err));
      } else if (type === 'success-message') {
        swal.fire({
          title: title ? title : 'Good job!',
          text: text ? text : 'You clicked the button!',
          buttonsStyling: false,
          confirmButtonClass: 'btn btn-round btn-success',
          confirmButtonText: confirmText ? confirmText : 'OK',
          type: 'success'
        })
        .then(result => {
          if (result.value) {
            resolve({ complete: true, action: true });
          } else {
            resolve({ complete: true, action: false });
          }
        })
        .catch(err => console.error(err));
      } else if (type === 'info-message') {
        swal.fire({
          title: title ? title : 'Alert',
          text: text ? text : 'You clicked the button!',
          buttonsStyling: false,
          confirmButtonClass: 'btn btn-round btn-success',
          type: 'info'
        })
        .then(result => {
          resolve({complete: true});
        })
        .catch(err => console.error(err));
      } else if (type === 'warning-message-and-confirmation') {
        swal
          .fire({
            title: title ? title : 'Are you sure?',
            text: text ? text : 'You won\'t be able to revert this!',
            type: 'warning',
            showCancelButton: true,
            cancelButtonClass: 'btn btn-round btn-danger',
            confirmButtonClass: 'btn btn-round btn-success mr-1',
            confirmButtonText: confirmText ? confirmText : 'Yes, delete it!',
            buttonsStyling: false
          })
          .then(result => {
            if (result.value) {
              resolve({ complete: true, action: true });
            } else {
              resolve({ complete: true, action: false });
            }
          });
      } else if (type === 'warning-message-and-cancel') {
        swal
          .fire({
            title: title ? title : 'Are you sure?',
            text: text ? text : 'You will not be able to recover this imaginary file!',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: confirmText ? confirmText : 'Yes, delete it!',
            cancelButtonText: cancelText ? cancelText : 'No, keep it',
            confirmButtonClass: 'btn btn-round btn-success mr-1',
            cancelButtonClass: 'btn btn-round btn-danger',
            buttonsStyling: false
          })
          .then(result => {
            if (result.value) {
              swal.fire({
                title: successTitle ? successTitle : 'Deleted!',
                text: successText ? successText : 'Your imaginary file has been deleted.',
                type: 'success',
                confirmButtonClass: 'btn btn-round btn-success',
                buttonsStyling: false
              })
              .then(() => {
                resolve({complete: true});
              })
              .catch(err => console.error(err));
            } else {
              swal.fire({
                title: cancelledTitle ? cancelledTitle : 'Cancelled',
                text: cancelledText ? cancelledText : 'Your imaginary file is safe :)',
                type: 'error',
                confirmButtonClass: 'btn btn-round btn-info',
                buttonsStyling: false
              })
              .then(() => {
                resolve({complete: true});
              })
              .catch(err => console.error(err));
            }
          });
      } else if (type === 'custom-html') {
        swal.fire({
          title: title ? title : 'HTML example',
          buttonsStyling: false,
          confirmButtonClass: 'btn btn-round btn-success mr-1',
          html: html ? html :
            'You can use <b>bold text</b>, ' +
            '<a href="https://github.com">links</a> ' +
            'and other HTML tags'
        })
        .then(result => {
          resolve({complete: true});
        })
        .catch(err => console.error(err));
      } else if (type === 'auto-close') {
        swal.fire({
          title: title ? title : 'Auto close alert!',
          text: text ? text : 'I will close in 2 seconds.',
          timer: 2000,
          showConfirmButton: false
        })
        .then(result => {
          resolve({complete: true});
        })
        .catch(err => console.error(err));
      } else if (type === 'input-field') {
        swal
        .fire({
          title: title ? title : 'Input something',
          html: html ? html :
            `${text ? text + `<br><br>` : ''}` +
            '<div class="form-group">' +
            '<input id="alert-input-field1" type="text" class="form-control" placeholder="Confirm your email..."/>' +
            '</div>',
          showCancelButton: true,
          confirmButtonClass: 'btn btn-round btn-success mr-1',
          cancelButtonClass: 'btn btn-round btn-danger',
          buttonsStyling: false
        })
        .then(result => {
          const data = (this.document.getElementById('alert-input-field1') as HTMLInputElement).value;
          resolve({complete: true, data});
        })
        .catch(err => console.error(err));
      } else if (type === 'warning-message') {
        swal.fire({
          title: title ? title : 'Warning!',
          text: text ? text : 'Something went wrong!',
          buttonsStyling: false,
          confirmButtonClass: 'btn btn-round btn-success',
          type: 'warning'
        })
        .then(result => {
          resolve({complete: true});
        })
        .catch(err => console.error(err));
      } else if (type === 'question-and-confirmation') {
        swal.fire({
          title: title ? title : 'Are you sure?',
          text: text ? text : 'You won\'t be able to revert this!',
          type: 'question',
          showCancelButton: true,
          cancelButtonClass: 'btn btn-round btn-default',
          confirmButtonClass: 'btn btn-round btn-success mr-1',
          confirmButtonText: confirmText ? confirmText : 'Yes!',
          cancelButtonText: cancelText ? cancelText : 'No',
          buttonsStyling: false
        })
        .then(result => {
          if (result.value) {
            swal.fire({
              title: successTitle ? successTitle : 'Done!',
              text: successText ? successText : 'Action complete.',
              type: 'success',
              confirmButtonClass: 'btn btn-round btn-success',
              buttonsStyling: false
            })
            .then(() => {
              resolve({complete: true, action: true});
            })
            .catch(err => console.error(err));
          } else {
            swal.fire({
              title: cancelledTitle ? cancelledTitle : 'Cancelled',
              text: cancelledText ? cancelledText : 'Continue on.',
              type: 'success',
              confirmButtonClass: 'btn btn-round btn-success',
              buttonsStyling: false
            })
            .then(() => {
              resolve({complete: true, action: false});
            })
            .catch(err => console.error(err));
          }
        });
      } else if (type === 'special-delete-account') {
        swal
        .fire({
          title: 'Are you sure?',
          html:
            'Deleting your Lifecoach account is permanent & <b>cannot be undone!</b> <br /><br />' +
            'If you wish to proceed, enter your login email & password to continue.<br /><br />' +
            '<div class="form-group">' +
            '<div class=" row">' +
            '<div class=" col-md-6">' +
            '<input id="alert-input-field1" type="text" placeholder="Login email..." class="form-control" />' +
            '</div>' +
            '<div class=" col-md-6">' +
            '<input id="alert-input-field2" type="text" placeholder="Password..." class="form-control" />' +
            '</div>' +
            '</div>' +
            '</div>',
          showCancelButton: true,
          confirmButtonText: `Delete my account!`,
          cancelButtonText: 'Cancel',
          confirmButtonClass: 'btn btn-round btn-danger mr-1',
          cancelButtonClass: 'btn btn-round btn-primary',
          buttonsStyling: false
        })
        .then(result => {
          if (result.value) {
            const data = {
              email: (this.document.getElementById('alert-input-field1') as HTMLInputElement).value,
              password: (this.document.getElementById('alert-input-field2') as HTMLInputElement).value
            };
            resolve({complete: true, data});
          } else {
            resolve({complete: true, data: null});
          }
        })
        .catch(err => console.error(err));
      }

    });

  }

  closeOpenAlert() {
    swal.close();
  }

}
