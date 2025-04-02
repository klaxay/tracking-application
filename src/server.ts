import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connectdb.js';

import driverRoutes from './routes/driver.route.js';
import customerRoutes from './routes/customer.route.js';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/drivers', driverRoutes);
app.use('/api/customers', customerRoutes);

const PORT: string | number = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
