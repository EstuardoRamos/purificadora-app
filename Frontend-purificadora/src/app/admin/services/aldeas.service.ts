import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Aldea } from '../../interfaces/cliente.interface';

@Injectable({
  providedIn: 'root'
})
export class AldeasService {
  private baseUrl = environment.baseUrlEnv;

  constructor(private http: HttpClient ) { }
  getAldeas(){
    return this.http.get(`${this.baseUrl}/aldeas`);
  }
  crearAldea(aldea: Aldea){
    return this.http.post(`${this.baseUrl}/aldeas`, aldea);
  }
  updateAldea(aldea: Aldea){
    return this.http.put(`${this.baseUrl}/aldeas/`, aldea);
  }

}
