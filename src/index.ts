// src/index.ts
import express from 'express';
import { Application, Request, Response } from 'express';
import routes from './routes';

const app: Application = express();
const port = process.env.PORT || 3333;

app.use(express.json());
app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
