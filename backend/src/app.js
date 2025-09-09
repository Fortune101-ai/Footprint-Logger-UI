const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDatabase = require('./config/db');

connectToDatabase().catch(err => {
    console.error('Failed to connect to the database', err);
    process.exit(1);
});


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});