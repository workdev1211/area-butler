import { HttpException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AddrInRangeCoordinatePipe implements PipeTransform {
  transform(coordinate: string): number {
    if (!coordinate) {
      return;
    }

    const parsedCoordinate = Number.parseFloat(coordinate);

    if (!parsedCoordinate) {
      throw new HttpException(
        'Specified coordinates must be floating point numbers!',
        400,
      );
    }

    return parsedCoordinate;
  }
}
