import Router, { Middleware, RouterContext } from '@koa/router';
import Joi from 'joi';
import { Next } from 'koa';
import _ from 'lodash';

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
  props?: string[];
};

export function schemaValidator(schema: Joi.AnySchema): Middleware {
  return async function validate(ctx: RouterContext, next: Function) {
    try {
      Joi.assert(ctx.request.body, schema);
    } catch (err) {
      throw `406: Invalid Schema`;
    }
    await next();
  };
}

export function getSanitizer(props: string[] | undefined) {
  return async function sanitize(ctx: RouterContext, next: Next) {
    ctx.body = props && props.length > 0 ? _.pick(ctx.body, props) : ctx.body;
    await next();
  };
}

export function resource(config: ResourceDefinition[], params: RouterParams = {}): Router {
  const router = new Router();

  for (const definition of config) {
    const security = definition.security != undefined ? definition.security : [];
    const schema = definition.schema != undefined ? definition.schema : Joi.any();
    router[definition.method](
      definition.path,
      ...security,
      schemaValidator(schema),
      definition.controller,
      getSanitizer(definition.props),
    );
  }
  return router;
}
