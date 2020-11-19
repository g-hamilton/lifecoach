// custom validator to check that input is a valid price
export function PriceValidator(controlName1, controlName2, minimumPrice, maximumPrice) {
    return (formGroup) => {
        const strategy = formGroup.controls[controlName1];
        const control = formGroup.controls[controlName2];
        const v = control.value;
        if (strategy.value === 'free') {
            // return if the pricing strategy is free
            return;
        }
        if (control.errors) {
            // return if another validator has already found an error on the control
            return;
        }
        // set error on control (1 error at a time) if validation fails for the following reasons..
        // not a number
        if (typeof v !== 'number') {
            control.setErrors({ notNumber: true });
            return;
        }
        // below minimum amount
        if (v <= minimumPrice) {
            control.setErrors({ belowMin: true });
            return;
        }
        // above max amount
        if (v > maximumPrice) {
            control.setErrors({ aboveMax: true });
            return;
        }
        else { // valid!
            control.setErrors(null);
        }
    };
}
//# sourceMappingURL=price.validator.js.map