// server.js
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ BudgetBuddy API escuchando en http://localhost:${PORT}`);
});

