import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { User, Booking, Flight } from './schemas.js';


const app = express();

app.use(express.json());
app.use(bodyParser.json({limit: "30mb", extended: true}))
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());

const requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.header('x-user-id'));
        if (!user || user.usertype !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Admin access required' });
    }
};

const requireUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.header('x-user-id'));
        if (!user) return res.status(401).json({ message: 'Login required' });
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Login required' });
    }
};

// mongoose setup

const PORT = 6001;
mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
).then(()=>{

    // All the client-server activites


    app.post('/register', async (req, res) => {
        const { username, email, usertype, password } = req.body;
        let approval = 'approved';
        try {
          
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            if(usertype === 'flight-operator'){
                approval = 'not-approved'
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username, email, usertype, password: hashedPassword, approval
            });
            const userCreated = await newUser.save();
            return res.status(201).json(userCreated);

        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Server Error' });
        }
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        try {

            const user = await User.findOne({ email });
    
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            } else{
                
                return res.json(user);
            }
          
        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Server Error' });
        }
    });

    app.put('/change-password', requireUser, async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }
        if (!await bcrypt.compare(currentPassword, req.user.password)) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        req.user.password = await bcrypt.hash(newPassword, 10);
        await req.user.save();
        res.json({ message: 'Password changed successfully' });
    });

    app.put('/profile', requireUser, async (req, res) => {
        const { username } = req.body;
        if (typeof username !== 'string' || !username.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }
        req.user.username = username.trim();
        await req.user.save();
        res.json({ username: req.user.username });
    });
      

    // Approve flight operator

    app.post('/approve-operator', requireAdmin, async(req, res)=>{
        const {id} = req.body;
        try{
            
            const user = await User.findById(id);
            user.approval = 'approved';
            await user.save();
            res.json({message: 'approved!'})
        }catch(err){
            res.status(500).json({ message: 'Server Error' });
        }
    })

    // reject flight operator

    app.post('/reject-operator', requireAdmin, async(req, res)=>{
        const {id} = req.body;
        try{
            
            const user = await User.findById(id);
            user.approval = 'rejected';
            await user.save();
            res.json({message: 'rejected!'})
        }catch(err){
            res.status(500).json({ message: 'Server Error' });
        }
    })


    // fetch user

    app.get('/fetch-user/:id', async (req, res)=>{
        const id = await req.params.id;
        console.log(req.params.id)
        try{
            const user = await User.findById(req.params.id);
            console.log(user);
            res.json(user);

        }catch(err){
            console.log(err);
        }
    })

    // fetch all users

    app.get('/fetch-users', async (req, res)=>{

        try{
            const users = await User.find();
            res.json(users);

        }catch(err){
            res.status(500).json({message: 'error occured'});
        }
    })

    app.put('/update-user/:id', requireAdmin, async (req, res) => {
        const { username, email } = req.body;
        if (typeof username !== 'string' || typeof email !== 'string' || !username.trim() || !email.trim()) {
            return res.status(400).json({ message: 'Name and email are required' });
        }
        try {
            const user = await User.findOneAndUpdate(
                { _id: req.params.id, usertype: { $in: ['customer', 'flight-operator'] } },
                { $set: { username: username.trim(), email: email.trim() } },
                { new: true, runValidators: true }
            ).select('-password');
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json(user);
        } catch (error) {
            if (error.code === 11000) return res.status(409).json({ message: 'Email already exists' });
            res.status(500).json({ message: 'Server Error' });
        }
    });

    app.post('/admin/users', requireAdmin, async (req, res) => {
        const { username, email, usertype, password } = req.body;
        if (!username?.trim() || !email?.trim() || !['customer', 'flight-operator'].includes(usertype) || !password) {
            return res.status(400).json({ message: 'Name, email, user type, and password are required' });
        }
        try {
            const user = await User.create({
                username: username.trim(), email: email.trim(), usertype,
                password: await bcrypt.hash(password, 10), approval: 'approved'
            });
            const safeUser = user.toObject();
            delete safeUser.password;
            res.status(201).json(safeUser);
        } catch (error) {
            if (error.code === 11000) return res.status(409).json({ message: 'Email already exists' });
            res.status(500).json({ message: 'Server Error' });
        }
    });

    app.delete('/admin/users/:id', requireAdmin, async (req, res) => {
        try {
            const user = await User.findOneAndDelete({ _id: req.params.id, usertype: { $in: ['customer', 'flight-operator'] } });
            if (!user) return res.status(404).json({ message: 'User not found' });
            await Booking.deleteMany({ user: user._id });
            res.json({ message: 'User deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    });


    // Add flight

    app.post('/add-flight', async (req, res)=>{
        const {flightName, flightId, origin, destination, departureTime, 
                                arrivalTime, basePrice, totalSeats} = req.body;
        try{

            const flight = new Flight({flightName, flightId, origin, destination, 
                                        departureTime, arrivalTime, basePrice, totalSeats});
            const newFlight = flight.save();

            res.json({message: 'flight added'});

        }catch(err){
            console.log(err);
        }
    })

    app.post('/admin/flights', requireAdmin, async (req, res) => {
        const { flightName, flightId, origin, destination, departureTime, arrivalTime, basePrice, totalSeats } = req.body;
        if (!flightName?.trim() || !flightId?.trim() || !origin || !destination || !departureTime || !arrivalTime || Number(basePrice) <= 0 || Number(totalSeats) <= 0) {
            return res.status(400).json({ message: 'Complete valid flight details are required' });
        }
        try {
            const flight = await Flight.create({ flightName: flightName.trim(), flightId: flightId.trim(), origin, destination, departureTime, arrivalTime, basePrice: Number(basePrice), totalSeats: Number(totalSeats) });
            res.status(201).json(flight);
        } catch (error) {
            if (error.code === 11000) return res.status(409).json({ message: 'Flight ID already exists' });
            res.status(500).json({ message: 'Server Error' });
        }
    });

    app.delete('/admin/flights/:id', requireAdmin, async (req, res) => {
        try {
            const flight = await Flight.findByIdAndDelete(req.params.id);
            if (!flight) return res.status(404).json({ message: 'Flight not found' });
            await Booking.deleteMany({ flight: flight._id });
            res.json({ message: 'Flight deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    });

    // update flight
    
    app.put('/update-flight', requireAdmin, async (req, res)=>{
        const {_id, flightName, flightId, origin, destination, 
                    departureTime, arrivalTime, basePrice, totalSeats} = req.body;
        try{

            const flight = await Flight.findById(_id)

            flight.flightName = flightName;
            flight.flightId = flightId;
            flight.origin = origin;
            flight.destination = destination;
            flight.departureTime = departureTime;
            flight.arrivalTime = arrivalTime;
            flight.basePrice = basePrice;
            flight.totalSeats = totalSeats;

            const newFlight = flight.save();

            res.json({message: 'flight updated'});

        }catch(err){
            console.log(err);
        }
    })

    // fetch flights

    app.get('/fetch-flights', async (req, res)=>{
        
        try{
            const flights = await Flight.find();
            res.json(flights);

        }catch(err){
            console.log(err);
        }
    })


    // fetch flight

    app.get('/fetch-flight/:id', async (req, res)=>{
        const id = await req.params.id;
        console.log(req.params.id)
        try{
            const flight = await Flight.findById(req.params.id);
            console.log(flight);
            res.json(flight);

        }catch(err){
            console.log(err);
        }
    })

    // fetch all bookings

    app.get('/fetch-bookings', async (req, res)=>{
        
        try{
            const bookings = await Booking.find();
            res.json(bookings);

        }catch(err){
            console.log(err);
        }
    })

    // Book ticket

    app.post('/book-ticket', async (req, res)=>{
        const {user, flight, flightName, flightId,  departure, destination, 
                    email, mobile, passengers, totalPrice, journeyDate, journeyTime, seatClass} = req.body;
        try{
            const bookings = await Booking.find({flight: flight, journeyDate: journeyDate, seatClass: seatClass});
            const numBookedSeats = bookings.reduce((acc, booking) => acc + booking.passengers.length, 0);
            
            let seats = "";
            const seatCode = {'economy': 'E', 'premium-economy': 'P', 'business': 'B', 'first-class': 'A'};
            let coach = seatCode[seatClass];
            for(let i = numBookedSeats + 1; i< numBookedSeats + passengers.length+1; i++){
                if(seats === ""){
                    seats = seats.concat(coach, '-', i);
                }else{
                    seats = seats.concat(", ", coach, '-', i);
                }
            }
            const booking = new Booking({user, flight, flightName, flightId, departure, destination, 
                                            email, mobile, passengers, totalPrice, journeyDate, journeyTime, seatClass, seats});
            await booking.save();

            res.json({message: 'Booking successful!!'});
        }catch(err){
            console.log(err);
        }
    })


    // cancel ticket

    app.put('/cancel-ticket/:id', async (req, res)=>{
        const id = await req.params.id;
        try{
            const booking = await Booking.findById(req.params.id);
            booking.bookingStatus = 'cancelled';
            await booking.save();
            res.json({message: "booking cancelled"});

        }catch(err){
            console.log(err);
        }
    })

    app.put('/admin/bookings/:id', requireAdmin, async (req, res) => {
        const { journeyDate, journeyTime, seatClass } = req.body;
        if (!journeyDate || !journeyTime || !seatClass) {
            return res.status(400).json({ message: 'Journey date, time, and seat class are required' });
        }
        try {
            const booking = await Booking.findByIdAndUpdate(
                req.params.id,
                { $set: { journeyDate, journeyTime, seatClass } },
                { new: true, runValidators: true }
            );
            if (!booking) return res.status(404).json({ message: 'Booking not found' });
            res.json(booking);
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    });






        app.listen(PORT, ()=>{
            console.log(`Running @ ${PORT}`);
        });
    }
).catch((e)=> console.log(`Error in db connection ${e}`));