const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB Successfully connected');
  });

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
