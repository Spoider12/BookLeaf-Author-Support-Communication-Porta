const express = require ("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const healthRoutes = require("./routes/health.routes")
const dataRoutes = require("./routes/data.route");
const ticketRoutes = require("./routes/ticket.routes");
require("dotenv").config();

const connectDB = require("./config/db");

const app =express();

//Allow requests from our react frontend

app.use(cors({
    origin : process.env.CLIENT_URL || "http://localhost:5173",
    credentials : true,
})
);
// Parse incoming JSON request bodies
app.use(express.json());
app.use(cookieParser());

 

// Register API Routes
app.use("/", healthRoutes)
app.use("/api", dataRoutes);
app.use("/api/tickets", ticketRoutes);

// Test API endpoint
app.get("/", (req, res) => {
  res.json({
    message: "BookLeaf API is running!",
  });
});

const PORT = process.env.PORT || 5000

const startServer = async () => {
    await connectDB();


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
};
startServer();