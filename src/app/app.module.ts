import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireFunctionsModule } from '@angular/fire/functions';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

import { AppRoutingModule } from './app-routing.module';
import { ComponentsModule } from './components/components.module';

const firebaseConfig = {
  apiKey: 'AIzaSyAfIPLLdCHsiVhYBrSNGXivOiNNBdWywqo',
  authDomain: 'lifecoach-6ab28.firebaseapp.com',
  databaseURL: 'https://lifecoach-6ab28.firebaseio.com',
  projectId: 'lifecoach-6ab28',
  storageBucket: 'lifecoach-6ab28.appspot.com',
  messagingSenderId: '765043503954',
  appId: '1:765043503954:web:5e5b0b376f5a7bf349008b',
  measurementId: 'G-S4801FLL5M'
};

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserTransferStateModule,
    NoopAnimationsModule,
    AppRoutingModule,
    ToastrModule.forRoot(),
    ComponentsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
