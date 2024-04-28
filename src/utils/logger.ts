import log4js from 'log4js';

const layout = { type: 'pattern', pattern: '%r %d %p %z %m' };
log4js.configure({
  appenders: {
    error: { type: 'file', filename: 'error.log', layout },
    info: { type: 'file', filename: 'info.log', layout },
    out: { type: 'stdout', layout },
  },
  categories: {
    error: { appenders: ['error'], level: 'error' },
    info: { appenders: ['info'], level: 'info' },
    default: { appenders: ['out'], level: 'all' },
  },
});

const logger = log4js.getLogger();
export default logger;
