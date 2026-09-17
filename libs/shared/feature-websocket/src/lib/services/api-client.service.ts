import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export interface RequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?:
    HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(url, options).pipe(catchError(this.handleError));
  }

  post<T, B = unknown>(url: string, body: B, options?: RequestOptions): Observable<T> {
    return this.http.post<T>(url, body, options).pipe(catchError(this.handleError));
  }

  put<T, B = unknown>(url: string, body: B, options?: RequestOptions): Observable<T> {
    return this.http.put<T>(url, body, options).pipe(catchError(this.handleError));
  }

  delete<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(url, options).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown API error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Server error ${error.status}: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
