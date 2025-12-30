import express from "express";
import dotenv from "dotenv";
import pasteRoutes from "./routes/paste.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", pasteRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
