import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  private verificarAcceso(roles?: number[]): boolean | UrlTree {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario) {
      return this.router.createUrlTree(['/login']);
    }

    if (roles && roles.length && !roles.includes(usuario.tipo)) {
      const destino = this.authService.getRutaInicio();
      return this.router.parseUrl(destino);
    }

    return true;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const roles = route.data?.['roles'] as number[] | undefined;
    return this.verificarAcceso(roles);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const roles = childRoute.data?.['roles'] as number[] | undefined;
    return this.verificarAcceso(roles);
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    const roles = route.data?.['roles'] as number[] | undefined;
    return this.verificarAcceso(roles);
  }
}
