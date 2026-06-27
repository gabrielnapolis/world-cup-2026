import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlayerPhotoService {
  private http = inject(HttpClient);
  private cache = new Map<string, string | null>();
  private readonly baseUrl = 'https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=';

  getPhoto(playerName: string): Observable<string | null> {
    if (this.cache.has(playerName)) {
      const val = this.cache.get(playerName);
      return of(val !== undefined ? val : null);
    }

    const normalizedName = this.normalizeName(playerName);
    
    return this.searchPlayer(normalizedName).pipe(
      switchMap(photoUrl => {
        if (photoUrl) {
          this.cache.set(playerName, photoUrl);
          return of(photoUrl);
        }
        
        const firstToken = normalizedName.split(' ')[0];
        if (firstToken && firstToken !== normalizedName) {
          return this.searchPlayer(firstToken).pipe(
            map(fallbackUrl => {
              this.cache.set(playerName, fallbackUrl);
              return fallbackUrl;
            })
          );
        }
        
        this.cache.set(playerName, null);
        return of(null);
      })
    );
  }

  private searchPlayer(query: string): Observable<string | null> {
    return this.http.get<any>(`${this.baseUrl}${encodeURIComponent(query)}`).pipe(
      map(response => {
        if (response && response.player && response.player.length > 0) {
          const p = response.player[0];
          return p.strCutout || p.strThumb || null;
        }
        return null;
      }),
      catchError((err) => {
        console.error('Error fetching player photo:', err);
        return of(null);
      })
    );
  }

  private normalizeName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\./g, '')
      .trim();
  }
}
