require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Bus = require('./models/Bus');

const routesData = [
  // --- NORTH INDIA ROUTES ---
  ['Jammu', 'Pathankot', 'Jalandhar', 'Ludhiana', 'Ambala', 'Panipat', 'Sonipat', 'Delhi'],
  ['Shimla', 'Solan', 'Chandigarh', 'Karnal', 'Roorkee', 'Meerut', 'Modinagar', 'Ghaziabad', 'Delhi'],
  ['Delhi', 'Noida', 'Greater Noida', 'Mathura', 'Agra', 'Etawah', 'Kanpur', 'Lucknow', 'Ayodhya', 'Basti', 'Gorakhpur', 'Kushinagar'],
  ['Delhi', 'Gurugram', 'Rewari', 'Jaipur', 'Ajmer', 'Bhilwara', 'Udaipur', 'Gandhinagar', 'Ahmedabad', 'Vadodara', 'Surat', 'Vapi'],
  ['Jaipur', 'Jodhpur', 'Pali', 'Mount Abu', 'Palanpur', 'Rajkot', 'Junagadh', 'Bhavnagar'],
  ['Amritsar', 'Tarn Taran', 'Phagwara', 'Kurukshetra', 'Delhi', 'Faridabad', 'Palwal', 'Agra', 'Gwalior', 'Jhansi', 'Bhopal', 'Indore'],
  ['Gorakhpur', 'Deoria', 'Siwan', 'Chhapra', 'Hajipur', 'Patna', 'Gaya', 'Nawada', 'Bhagalpur'],
  ['Patna', 'Muzaffarpur', 'Darbhanga', 'Samastipur', 'Begusarai', 'Khagaria', 'Katihar', 'Purnia', 'Kishanganj', 'Siliguri', 'Guwahati'],
  ['Guwahati', 'Shillong', 'Tezpur', 'Dimapur', 'Kohima', 'Imphal'],
  ['Varanasi', 'Mirzapur', 'Sasaram', 'Deoghar', 'Dhanbad', 'Asansol', 'Durgapur', 'Burdwan', 'Kolkata', 'Haldia'],
  ['Indore', 'Ujjain', 'Ratlam', 'Mandsaur', 'Dhule', 'Nashik', 'Bhiwandi', 'Thane', 'Mumbai'],
  ['Bikaner', 'Jaisalmer', 'Barmer', 'Jalore', 'Atmedabad', 'Anand', 'Nadiad', 'Surat'],
  ['Dehradun', 'Haridwar', 'Rishikesh', 'Muzaffarnagar', 'Meerut', 'Delhi', 'Aligarh', 'Gwalior'],

  // --- CENTRAL INDIA ROUTES ---
  ['Raipur', 'Bilaspur', 'Korba', 'Raigarh', 'Rourkela', 'Jharsuguda', 'Sambalpur', 'Cuttack', 'Bhubaneswar'],
  ['Jabalpur', 'Sagar', 'Bhopal', 'Sehore', 'Dewas', 'Indore', 'Khandwa', 'Burhanpur'],
  ['Nagpur', 'Amravati', 'Akola', 'Jalna', 'Aurangabad', 'Ahmednagar', 'Pune', 'Lonavala', 'Satara', 'Kolhapur'],
  
  // --- SOUTH INDIA ROUTES ---
  ['Mumbai', 'Navi Mumbai', 'Panvel', 'Pune', 'Satara', 'Karad', 'Kolhapur', 'Belagavi', 'Hubli', 'Davanagere', 'Tumkur', 'Bangalore'],
  ['Bangalore', 'Hosur', 'Krishnagiri', 'Ambur', 'Vellore', 'Kanchipuram', 'Chennai', 'Tambaram'],
  ['Chennai', 'Chengalpattu', 'Villupuram', 'Tindivanam', 'Salem', 'Erode', 'Tiruppur', 'Coimbatore', 'Palakkad', 'Thrissur', 'Kochi'],
  ['Salem', 'Namakkal', 'Karur', 'Dindigul', 'Madurai', 'Virudhunagar', 'Tirunelveli', 'Nagercoil', 'Kanyakumari'],
  ['Hyderabad', 'Jadcherla', 'Kurnool', 'Anantapur', 'Kadiri', 'Penukonda', 'Chikkaballapur', 'Bangalore', 'Mysore', 'Ooty'],
  ['Hyderabad', 'Suryapet', 'Kodad', 'Vijayawada', 'Eluru', 'Rajahmundry', 'Kakinada', 'Tuni', 'Anakapalle', 'Visakhapatnam', 'Vizianagaram', 'Srikakulam'],
  ['Kasaragod', 'Kannur', 'Thalassery', 'Kozhikode', 'Malappuram', 'Thrissur', 'Ernakulam', 'Alappuzha', 'Kottayam', 'Kollam', 'Thiruvananthapuram'],
  ['Adilabad', 'Nizamabad', 'Karimnagar', 'Warangal', 'Khammam', 'Nalgonda', 'Miryalaguda', 'Guntur', 'Tenali', 'Ongole', 'Nellore'],
  ['Tirupati', 'Chittoor', 'Kadapa', 'Proddatur', 'Kurnool', 'Mahbubnagar', 'Hyderabad', 'Secunderabad'],
  ['Tiruchirappalli', 'Thanjavur', 'Kumbakonam', 'Nagapattinam', 'Karaikudi', 'Ramanathapuram', 'Thoothukudi'],
  ['Goa', 'Karwar', 'Udupi', 'Mangalore', 'Kasaragod', 'Kannur'],
  ['Visakhapatnam', 'Kakinada', 'Bhimavaram', 'Vijayawada', 'Guntur', 'Ongole', 'Nellore', 'Tirupati', 'Vellore'],
  ['Bangalore', 'Mandya', 'Hassan', 'Mysore', 'Coorg', 'Wayanad']
];

const operators = ['Intercity SmartBus', 'Orange Tours', 'VRL Travels', 'SRS Travels', 'Kaveri Travels', 'Zingbus', 'NueGo', 'Chartered Speed'];
const busTypes = ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper'];

const generateTimeObj = (baseHours) => {
    let hours = Math.floor(baseHours) % 24;
    let minutes = Math.floor((baseHours % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const run = async () => {
    await connectDB();
    try {
        console.log('Clearing old buses data...');
        await Bus.deleteMany({});
        
        let busesToInsert = [];
        let busCounter = 1000;

        const populateRoutes = (stops, reverse = false) => {
            const routeStops = reverse ? [...stops].reverse() : [...stops];
            const source = routeStops[0];
            const destination = routeStops[routeStops.length - 1];

            for (let day = 0; day < 7; day++) {
                const date = new Date();
                date.setDate(date.getDate() + day);

                for (let b = 0; b < 2; b++) {
                    const operator = operators[Math.floor(Math.random() * operators.length)];
                    const bType = busTypes[Math.floor(Math.random() * busTypes.length)];
                    
                    const startHour = Math.floor(Math.random() * 24);
                    const totalDurationHours = (routeStops.length - 1) * (2 + Math.random() * 2);
                    const fare = Math.round(totalDurationHours * 50);
                    
                    const depTime = generateTimeObj(startHour);
                    const arrTime = generateTimeObj(startHour + totalDurationHours);
                    
                    busesToInsert.push({
                        busNumber: `IND-${busCounter++}`,
                        busName: `${source}-${destination} Express`,
                        operatorName: operator,
                        busType: bType,
                        totalSeats: 40,
                        rating: (Math.random() * 2 + 3).toFixed(1),
                        routes: [{
                            _id: new mongoose.Types.ObjectId(),
                            source: { name: source, city: source },
                            destination: { name: destination, city: destination },
                            stops: routeStops,
                            departureTime: depTime,
                            arrivalTime: arrTime,
                            journeyDuration: `${totalDurationHours.toFixed(1)} hrs`,
                            fare: fare,
                            bookedSeats: [],
                            date: date
                        }],
                        isActive: true
                    });
                }
            }
        };

        routesData.forEach(stops => {
            populateRoutes(stops, false);
            populateRoutes(stops, true);
        });

        console.log(`Inserting ${busesToInsert.length} buses covering all major pan-India intermediate stops...`);
        await Bus.insertMany(busesToInsert);
        console.log('Successfully seeded Pan-India bus network!');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();