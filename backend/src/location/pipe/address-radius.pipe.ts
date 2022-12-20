import { HttpException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AddressRadiusPipe implements PipeTransform {
  transform(radius: string): number {
    if (!radius) {
      return;
    }

    const parsedRadius = +radius;

    if (!parsedRadius || parsedRadius > 400) {
      throw new HttpException(
        'Radius should be correctly specified and not be higher than 400 meters!',
        400,
      );
    }

    return parsedRadius;
  }
}
