import { Component, Input, OnInit, ViewChild, AfterViewInit, OnDestroy, AfterViewChecked, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatChip, MatChipList } from '@angular/material';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

/*
  Reusable material chips multi-select component
  Integrates with Angular forms
  https://zoaibkhan.com/blog/create-a-multi-select-chips-component-with-angular-material/
*/

@Component({
  selector: 'app-chips-multi-select',
  templateUrl: './chips-multi-select.component.html',
  styleUrls: ['./chips-multi-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ChipsMultiSelectComponent,
      multi: true,
    },
  ]
})
export class ChipsMultiSelectComponent implements OnInit, ControlValueAccessor, AfterViewInit, AfterViewChecked, OnDestroy {

  @Input() options: string[];
  @Output() changeEvent = new EventEmitter<any>(); // <-- So we can emit onChange
  @ViewChild('chipList', {static: false}) public chipList: MatChipList;

  private disabled = false;
  private value: string[] = [];
  private subscriptions: Subscription = new Subscription();

  // To integrate with Angular forms using ControlValueAccessor

  onChange!: (value: string[]) => void;

  writeValue(value: string[]): void {
    // console.log('writeValue', value);
    // When form value set when chips list initialized
    if (this.chipList && value) {
      this.selectChips(value);
    } else if (value) {
      // When chips not initialized
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  propagateChange(value: string[]) {
    if (this.onChange) {
      this.onChange(value);
      this.changeEvent.emit(); // in addition to the form stuff, emit when changed
    }
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // end of functions specifically for for ControlValueAccessor

  constructor(
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.selectChips(this.value);

    this.subscriptions.add( // subscribe to changes in the chip state
      this.chipList.chipSelectionChanges
      .pipe(
        map((event) => event.source))
      .subscribe((chip) => {
        if (chip.selected) { // if we've selected a chip in the ui, update the form
          this.value = [...this.value, chip.value];
          // console.log(this.value);
        } else { // if a chip is de-selected, update the form
          this.value = this.value.filter((o) => o !== chip.value);
          // console.log(this.value);
        }

        this.propagateChange(this.value);
      })
    );
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  selectChips(value: string[]) {
    // console.log('selectChips', value);
    this.chipList.chips.forEach((chip) => chip.deselect());

    const chipsToSelect = this.chipList.chips.filter((c) =>
      value.includes(c.value)
    );

    chipsToSelect.forEach((chip) => chip.select());
  }

  toggleSelection(chip: MatChip) {
    if (!this.disabled) {
      chip.toggleSelected();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
