import config from '../config';

import { GoogleGenerativeAI } from '@google/generative-ai';

export const vertexAI = new GoogleGenerativeAI(config.get('google.key'));
