import { isValidObjectId } from 'mongoose';

export function objectIdOrNull(id: string | null): void {
  if (!isValidObjectId(id)) {
    throw '400: invalid url param';
  }
}
