import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { Flight, User } from './schemas.js';

const demoPassword = 'password123';

const users = [
    { username: 'Demo Admin', email: 'admin@example.com', usertype: 'admin', approval: 'approved' },
    { username: 'Demo Customer', email: 'customer@example.com', usertype: 'customer', approval: 'approved' },
    { username: 'Demo Operator', email: 'operator@example.com', usertype: 'flight-operator', approval: 'approved' }
];

const flights = [
    {
        flightName: 'Skyline Express', flightId: 'SK101', origin: 'Chennai', destination: 'Bengaluru',
        departureTime: '08:30', arrivalTime: '09:40', basePrice: 4200, totalSeats: 180
    },
    {
        flightName: 'Coastal Air', flightId: 'CA202', origin: 'Mumbai', destination: 'Delhi',
        departureTime: '14:15', arrivalTime: '16:25', basePrice: 5800, totalSeats: 160
    },
    {
        flightName: 'Southern Star', flightId: 'SS303', origin: 'Hyderabad', destination: 'Kolkata',
        departureTime: '19:45', arrivalTime: '22:05', basePrice: 5100, totalSeats: 150
    }
];

async function seed() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is missing from server/.env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const hashedPassword = await bcrypt.hash(demoPassword, 10);

    for (const user of users) {
        await User.updateOne(
            { email: user.email },
            { $set: { ...user, password: hashedPassword } },
            { upsert: true }
        );
    }

    for (const flight of flights) {
        await Flight.updateOne({ flightId: flight.flightId }, { $set: flight }, { upsert: true });
    }

    console.log(`Seeded ${users.length} users and ${flights.length} flights.`);
    console.log(`Demo password for all users: ${demoPassword}`);
}

seed()
    .catch((error) => {
        console.error('Seed failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });