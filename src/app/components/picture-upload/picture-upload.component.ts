import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output, OnChanges } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import {ImageHelperService} from '../../services/image-helper.service';

@Component({
  selector: 'app-picture-upload',
  templateUrl: './picture-upload.component.html',
  styleUrls: ['./picture-upload.component.css']
})
export class PictureUploadComponent implements OnInit, OnChanges {

  @Input() avatar = false; // <-- To use avatar style (rounded) images
  @Input() image: string; // <-- To use image style (square) images
  @Input() inputImg: string; // <-- So we can pass an image into the component on load

  @Output() messageEvent = new EventEmitter<any>(); // <-- So we can emit the chosen data to a parent component

  public file: any = {}; // < -- Will contain the selected file
  public imagePreviewUrl: any = {}; // <-- Will contain the silected file's base64 data

  private allowedFileTypes = ['jpg', 'jpeg', 'png', 'webp', 'bmp']; // added webp (lighter) and bmp (for windows users)

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  constructor(
    private alertService: AlertService,
    private imageHelper: ImageHelperService
  ) {
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

  handleImageChange($event: any) {
    $event.preventDefault();
    const reader = new FileReader();
    const file = $event.target.files[0];
    reader.onloadend = () => {
      this.file = file;
      // Validate the file
      const result = this.validateFile();

      // TODO: resize image here and then preview should be with resized image

      console.log('File validation result:', result);
      if (result.success) {
        this.imagePreviewUrl = reader.result;  // TODO: here should be resized image
        // console.log('Image preview url:', this.imagePreviewUrl);
        this.emitBase64(); // <-- Should emit the base 64 image url of the chosen file
      } else {
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
    const ext: string = this.file.name.split('.').pop().toLowerCase();
    const res1 = this.allowedFileTypes.includes(ext);
    // Test for maximum file size
    const res2 = this.file.size < 5000000; // 5MB
    // Return
    if (res1 && res2) {
      return {success: true, errors: null};
    } else {
      const errors = [];
      if (!res1) {
        errors.push('Unsupported file type. Please review the allowed file types and try again.');
      }
      if (!res2) {
        errors.push('File is too large. Please review the maximum allowed file size, reduce your image size or select a smaller image and try again.');
      }
      return {success: false, errors};
    }
  }

  handleSubmit($event: any) {
    $event.preventDefault();
    // NOT USED
    // this.state.file is the file/image uploaded
    // in this function you can save the image (this.state.file) on form submit
    // you have to call it yourself
  }

  emitFile() {
    if (this.file) {
      this.messageEvent.emit(this.file);
    } else if (this.inputImg) {
      this.messageEvent.emit(this.imagePreviewUrl);
    } else {
      this.messageEvent.emit(null);
    }
  }

  emitBase64() {
    this.messageEvent.emit(this.imagePreviewUrl);
  }
}
