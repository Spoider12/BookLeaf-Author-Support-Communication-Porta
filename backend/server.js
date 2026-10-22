const express = require ("express")
const cors = require("cors")
const healthRoutes = require("./routes/health.routes")
const dataRoutes = require("./routes/data.route");
const ticketRoutes = require("./routes/ticket.routes");
require("dotenv").config();

const app =express();

//Allow requests from our react frontend

app.use(cors({
    origin : " http://localhost:5173/"
})
);
// Parse incoming JSON request bodies
app.use(express.json());

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});