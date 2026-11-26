const app = require('./app');
const { pool } = require('./db');
const { porta } = require('./config');

async function iniciar() {
  try {
    await pool.query('SELECT 1');
    console.log('Conectado ao MySQL.');
  } catch (erro) {
    console.error('Falha ao conectar no MySQL:', erro.message);
    process.exit(1);
  }
  app.listen(porta, () => console.log(`API PAR-Guessr rodando em http://localhost:${porta}`));
}

iniciar();
