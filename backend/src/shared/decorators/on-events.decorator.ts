import { applyDecorators } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces';

// Doesn't work for unknown reason

// Array doesn't work for the 'OnEvent' decorator
export const OnEvents = (
  events: string[],
  options?: OnEventOptions | undefined,
) => applyDecorators(...events.map((e) => OnEvent(e, options)));
