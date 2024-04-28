import type { Middleware } from 'koa';
import compose from 'koa-compose';
import serve from 'koa-static';
import { koaSwagger } from 'koa2-swagger-ui';
import path from 'path';

export default function (): Middleware {
  return compose([
    serve(path.resolve('public')),
    koaSwagger({
      title: 'LP Auth Server API Docs',
      swaggerOptions: { url: 'openapi.json' },
    }),
  ]);
}
