import app from "./app";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

// Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
    server.close(() => {
        process.exit(1); // then exit
    });

    setTimeout(() => {
        process.abort();
    }, 1000).unref();
});

// Handle Unhandled Promise rejections
process.on("unhandledRejection", (reason, promise) => {
    server.close(() => {
        process.exit(1);
    });

    setTimeout(() => {
        process.abort();
    }, 1000).unref();
});
