import { isValidObjectId } from 'mongoose';
import { ServerError } from '../utils/error';

export function objectIdOrNull(id: string | null): void {
  if (!isValidObjectId(id)) {
    throw new ServerError({
      status: 400,
      message: 'Invalid url param',
      description: `${id} is not a valid ObjectId`,
    });
  }
}
