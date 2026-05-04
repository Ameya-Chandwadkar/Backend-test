import dotenv from "dotenv"
import connectdb from "./config/database.js"
import app from "./app.js"
dotenv.config({
    path:'./.env'
});

const startServer = async () => {
  try {
    await connectdb();

    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });

    app.on("error", (error) => {
      console.error("Server error:", error);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // optional: exit process if startup fails
  }
};

startServer();
