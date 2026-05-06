import express from "express";
import cors from "cors";

const app = express();  // create an express app

app.use(cors({
    origin: '*' // Allow all origins (including file:// which is 'null')
}));

app.use(express.json());

// serve static files
app.use('/public', express.static('public'));

// routes import
import hirerRouter from './routes/user.route.js';
import resumeRouter from './routes/resume.route.js';


// routes declaration
app.use("/api/v1/hirers", hirerRouter);
app.use("/api/v1/resumes", resumeRouter);

// example routes:
// POST http://localhost:4000/api/v1/hirers/register
// POST http://localhost:4000/api/v1/resumes/upload

export default app;