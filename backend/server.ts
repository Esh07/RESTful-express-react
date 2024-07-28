import { app } from './src/app/index';
import seedData from './src/lib/seed';
import db from './src/lib/db';

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await seedData(); // Seed the database with some data
        console.log('Database connected');
        app.listen(PORT, () => {
            console.log(`REST API server ready at: ${process.env.HOST}:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
}

startServer();