const express = require('express');
const cors = require('cors');
const { corsOrigin } = require('./config');
const { tratarErros } = require('./middlewares/tratarErros');

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get('/saude', (req, res) => res.json({ ok: true }));
app.use('/auth', require('./routes/auth'));
app.use('/partidas', require('./routes/partidas'));
app.use('/rodadas', require('./routes/rodadas'));
app.use('/ranking', require('./routes/ranking'));
app.use('/historico', require('./routes/historico'));

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use(tratarErros);

module.exports = app;
