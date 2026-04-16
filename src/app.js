import express from 'express';
const app = express();
import morgan from 'morgan';

app.use(express.json());
app.use(morgan('dev'));

export default app;