import { HttpException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AddrInRangeRadiusPipe implements PipeTransform {
  transform(radius: string): number {
    if (!radius) {
      return;
    }

    const parsedRadius = Number.parseInt(radius, 10);

    if (!parsedRadius || parsedRadius > 400) {
      throw new HttpException(
        'The radius must be an integer between 1 and 400 meters!',
        400,
      );
    }

    return parsedRadius;
  }
}
