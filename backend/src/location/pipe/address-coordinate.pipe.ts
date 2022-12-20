import { HttpException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AddressCoordinatePipe implements PipeTransform {
  transform(coordinate: string): number {
    if (!coordinate) {
      return;
    }

    const parsedCoordinate = +coordinate;

    if (!parsedCoordinate) {
      throw new HttpException(
        'The provided coordinates should be a number!',
        400,
      );
    }

    return parsedCoordinate;
  }
}
