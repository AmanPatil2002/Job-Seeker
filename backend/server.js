const express = require("express");
const cors = require("cors");
require('dotenv').config();

const authRoutes = require("./Routes/authRoutes");
const jobRoutes = require("./Routes/jobRoutes");
const applicationRoutes = require("./Routes/applicationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Routes 
app.use("/auth", authRoutes);
app.use("/job", jobRoutes);
app.use("/application", applicationRoutes);


app.listen(PORT, ()=>{
    console.log(`Server Running on Port ${PORT}`);
});
