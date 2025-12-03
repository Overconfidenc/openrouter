
import express from 'express';
import apiRouter from './routes.js';

const app = express();
const PORT = 3000;

app.use(express.json());


app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Пример запроса POST на http://localhost:${PORT}/api/consult`);
});
