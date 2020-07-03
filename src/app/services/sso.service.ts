import { Injectable } from '@angular/core';
import { CloudFunctionsService } from '../services/cloud-functions.service';

@Injectable({
  providedIn: 'root'
})
export class SsoService {

  constructor(
    private cloudFunctionsService: CloudFunctionsService
  ) { }

  async getSsoToken(uid: string) {

    const token = JSON.parse(localStorage.getItem('jwt')); // check local storage for a saved token

    if (token) { // saved token exists
      return token;

    } else { // no saved token
      const res: any = await this.cloudFunctionsService.generateJWT(uid); // cloud call to generate a token
      if (!res.error && res.token) {
        localStorage.setItem('jwt', JSON.stringify(res.token));
        return res.token;
      } else {
        console.error(res.error);
        return null;
      }
    }

  }
}
