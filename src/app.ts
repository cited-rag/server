import cors from "@koa/cors";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import koaLogger from "koa-logger";
import error from "./middleware/error";
import openapi from "./middleware/openapi";
import router from "./router";
import logger from "./utils/logger";

const app = new Koa();

if (process.env.NODE_ENV !== "production") {
	app.use(openapi());
}

app.use(
	koaLogger({
		transporter: (str, args) => {
			logger.info(str);
		},
	})
);
app.use(helmet());
app.use(
	cors({
		origin: "http://localhost:3000", // replace with your client app's URL
		allowMethods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);
app.use(bodyParser());
app.use(error());
app.use(router());

export default app;
