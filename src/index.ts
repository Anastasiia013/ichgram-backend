import "dotenv/config";
import startServer from "./server";
import connectDatabase from "./db/connectDatabase";

const bootstrap = async (): Promise<void> => {
  try {
    await connectDatabase();
    startServer();
  } catch (error) {
    console.error("Fatal error during startup:");
    console.error(error);
    process.exit(1);
  }
};

bootstrap();