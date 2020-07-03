import { FormGroup } from '@angular/forms';

// custom validator to check that any URL string contains the scheme
export function UrlScheme(controlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];

        if (control.errors) {
            // return if another validator has already found an error on the control
            return;
        }

        // set error on control if validation fails
        if ( (control.value as string) !== '' &&
        !(control.value as string).includes('http://') &&
        !(control.value as string).includes('https://') ) {
            control.setErrors({ missingUrlScheme: true });
        } else {
            control.setErrors(null);
        }
    };
}
