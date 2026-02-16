/**
 * HoReCa Hybrid Application
 * Main entry point
 */

const app = require('./app');
const config = require('./config');

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`HoReCa application running on port ${PORT}`);
});
