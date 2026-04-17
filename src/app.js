import express from 'express';
const app = express();
import morgan from 'morgan';
import authRouter from './routes/auth.routes.js';

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRouter)

export default app;