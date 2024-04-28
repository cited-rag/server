import Joi from 'joi';
import { Middleware } from 'koa';

export enum Methods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

export type RouterParams = Record<string, Function>;

export type ResourceDefinition = {
  path: string;
  controller: Middleware;
  method: Methods;
  schema?: Joi.ObjectSchema<any> | null;
  security?: Middleware[];
};

export type AuthRequest = {
  password: string;
  name: string;
};

export type ValidateNameRequest = {
  name: string;
};
