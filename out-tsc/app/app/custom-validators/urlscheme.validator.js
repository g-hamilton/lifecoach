// custom validator to check that any URL string contains the scheme
export function UrlScheme(controlName) {
    return (formGroup) => {
        const control = formGroup.controls[controlName];
        if (control.errors) {
            // return if another validator has already found an error on the control
            return;
        }
        // set error on control if validation fails
        if (control.value !== '' &&
            !control.value.includes('http://') &&
            !control.value.includes('https://')) {
            control.setErrors({ missingUrlScheme: true });
        }
        else {
            control.setErrors(null);
        }
    };
}
//# sourceMappingURL=urlscheme.validator.js.map