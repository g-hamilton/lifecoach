var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { AlertService } from '../../services/alert.service';
let PictureUploadComponent = class PictureUploadComponent {
    constructor(alertService) {
        this.alertService = alertService;
        this.avatar = false; // <-- To use avatar style (rounded) images
        this.messageEvent = new EventEmitter(); // <-- So we can emit the chosen data to a parent component
        this.file = {}; // < -- Will contain the selected file
        this.imagePreviewUrl = {}; // <-- Will contain the silected file's base64 data
        this.allowedFileTypes = ['jpg', 'jpeg', 'png'];
        this.handleImageChange = this.handleImageChange.bind(this);
    }
    ngOnInit() {
        this.file = null;
        // Preload a placeholder image into view depending on image style
        this.imagePreviewUrl =
            this.image !== undefined
                ? this.image
                : this.avatar
                    ? 'assets/img/placeholder.jpg'
                    : 'assets/img/image_placeholder.jpg';
        // If we have passed in an image, load it into view
        if (this.inputImg) {
            this.imagePreviewUrl = this.inputImg;
        }
    }
    ngOnChanges() {
        if (this.inputImg) {
            this.imagePreviewUrl = this.inputImg;
        }
    }
    handleImageChange($event) {
        $event.preventDefault();
        const reader = new FileReader();
        const file = $event.target.files[0];
        reader.onloadend = () => {
            this.file = file;
            // Validate the file
            const result = this.validateFile();
            console.log('File validation result:', result);
            if (result.success) {
                this.imagePreviewUrl = reader.result;
                // console.log('Image preview url:', this.imagePreviewUrl);
                this.emitBase64(); // <-- Should emit the base 64 image url of the chosen file
            }
            else {
                let errorStr = '';
                result.errors.forEach(err => errorStr += (err + ' '));
                this.alertService.alert('warning-message', 'Oops!', errorStr);
            }
        };
        reader.readAsDataURL(file);
    }
    handleClick() {
        // console.log(this.fileInput.nativeElement);
        this.fileInput.nativeElement.click();
    }
    handleRemove() {
        this.file = null;
        this.imagePreviewUrl =
            this.image !== undefined
                ? this.image
                : this.avatar
                    ? 'assets/img/placeholder.jpg'
                    : 'assets/img/image_placeholder.jpg';
        this.fileInput.nativeElement.value = null;
        this.emitFile();
    }
    validateFile() {
        console.log('File:', this.file);
        // Test for supported file type(s)
        const ext = this.file.name.split('.').pop().toLowerCase();
        const res1 = this.allowedFileTypes.includes(ext);
        // Test for maximum file size
        const res2 = this.file.size < 5000000; // 5MB
        // Return
        if (res1 && res2) {
            return { success: true, errors: null };
        }
        else {
            const errors = [];
            if (!res1) {
                errors.push('Unsupported file type. Please review the allowed file types and try again.');
            }
            if (!res2) {
                errors.push('File is too large. Please review the maximum allowed file size, reduce your image size or select a smaller image and try again.');
            }
            return { success: false, errors };
        }
    }
    handleSubmit($event) {
        $event.preventDefault();
        // NOT USED
        // this.state.file is the file/image uploaded
        // in this function you can save the image (this.state.file) on form submit
        // you have to call it yourself
    }
    emitFile() {
        if (this.file) {
            this.messageEvent.emit(this.file);
        }
        else if (this.inputImg) {
            this.messageEvent.emit(this.imagePreviewUrl);
        }
        else {
            this.messageEvent.emit(null);
        }
    }
    emitBase64() {
        this.messageEvent.emit(this.imagePreviewUrl);
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], PictureUploadComponent.prototype, "avatar", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], PictureUploadComponent.prototype, "image", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], PictureUploadComponent.prototype, "inputImg", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], PictureUploadComponent.prototype, "messageEvent", void 0);
__decorate([
    ViewChild('fileInput', { static: false }),
    __metadata("design:type", ElementRef)
], PictureUploadComponent.prototype, "fileInput", void 0);
PictureUploadComponent = __decorate([
    Component({
        selector: 'app-picture-upload',
        templateUrl: './picture-upload.component.html',
        styleUrls: ['./picture-upload.component.css']
    }),
    __metadata("design:paramtypes", [AlertService])
], PictureUploadComponent);
export { PictureUploadComponent };
//# sourceMappingURL=picture-upload.component.js.map