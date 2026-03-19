require("dotenv").config();

const app = require("./app");
const config = require("./config");
const { initializeDatabase } = require("./database/db");

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(config.port, () => {
      console.log(`Server running on port localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
