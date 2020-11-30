import { FormGroup } from '@angular/forms';

// custom validator to check that input is a valid price
export function ProgramPriceValidator(controlName1: string, controlName2: string, controlName3: string, minimumPrice: number, maximumPrice: number) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName1];
        const control1 = formGroup.controls[controlName2];
        const control2 = formGroup.controls[controlName3];
        const strategy = control.value;
        const fullPrice = control1.value;
        const pps = control2.value;

        if (control.errors || control1.errors || control2.errors) {
            // return if another validator has already found an error on the controls
            return;
        }

        // set error on relevant control (1 error at a time) if validation fails for the following reasons..

        // full price not a number
        if (typeof fullPrice !== 'number') {
            control1.setErrors({ notNumber: true });
            return;
        }
        // full price below minimum amount
        if (fullPrice <= minimumPrice) {
            control1.setErrors({ belowMin: true });
            return;
        }
        // full price above max amount
        if (fullPrice > maximumPrice) {
            control1.setErrors({ aboveMax: true });
            return;
        } else { // full price valid!
            control1.setErrors(null);
        }
        if (strategy === 'flexible') {
            // only check price per session if the strategy is flexible
            if (typeof pps !== 'number') {
                control2.setErrors({ notNumber: true });
                return;
            }
            // full price below minimum amount
            if (pps <= minimumPrice) {
                control2.setErrors({ belowMin: true });
                return;
            }
            // full price above max amount
            if (pps > maximumPrice) {
                control2.setErrors({ aboveMax: true });
                return;
            } else { // price per session valid!
                control2.setErrors(null);
            }
        }
    };
}
