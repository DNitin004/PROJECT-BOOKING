require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const connectDB = require("./config/database");
const Bus = require("./models/Bus");

const importData = async () => {
    await connectDB();
    try {
        console.log("Clearing old buses data...");
        await Bus.deleteMany({});
        console.log("Old buses deleted.");

        const csvPath = "c:/Users/nithi/Downloads/indian_bus_fare_dataset.csv";
        const content = fs.readFileSync(csvPath, "utf-8");
        const lines = content.split("\n").filter(l => l.trim().length > 0);
        
        const validBusTypes = ["AC", "Non-AC", "Sleeper", "Semi-Sleeper"];
        const mapBusType = (rawType) => {
             const rt = rawType.toLowerCase();
             if (rt.includes("sleeper")) {
                 if (rt.includes("non")) return "Non-AC";
                 return "Sleeper";
             }
             if (rt.includes("non-ac")) return "Non-AC";
             if (rt.includes("volvo") || rt.includes("ac") || rt.includes("luxury")) return "AC";
             return "Semi-Sleeper"; // fallback
        };

        const generateTime = () => {
             const h = Math.floor(Math.random()*(23-8+1)+8);
             const m = [0, 15, 30, 45][Math.floor(Math.random()*4)];
             return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}`;
        };

        const addHours = (timeStr, durationStr) => {
             const [h, m] = timeStr.split(":").map(Number);
             const duration = parseFloat(durationStr);
             const dh = Math.floor(duration);
             const dm = Math.round((duration - dh) * 60);
             let nm = m + dm;
             let nh = h + dh + Math.floor(nm/60);
             nm = nm % 60;
             nh = nh % 24;
             return `${nh.toString().padStart(2,"0")}:${nm.toString().padStart(2,"0")}`;
        };

        let buses = [];
        // Just take 150 buses for performance instead of 1000s 
        const maxLines = Math.min(150, lines.length);
        for (let i = 1; i < maxLines; i++) {
             // Agency,Source,Destination,Bus Type,Travel Date,Fare Price (INR),Total Seats,Duration (hours)
             const cols = lines[i].split(",");
             if(cols.length < 8) continue;
             
             const opName = cols[0];
             const source = cols[1];
             const dest = cols[2];
             const busTypeRaw = cols[3];
             const dateRaw = cols[4];
             const fareRaw = cols[5];
             const seatsRaw = cols[6];
             const durationRaw = cols[7];

             const busType = mapBusType(busTypeRaw);
             const depTime = generateTime();
             const arrTime = addHours(depTime, durationRaw);

             buses.push({
                  busNumber: `IND-${i*1000 + Math.floor(Math.random()*900)}`,
                  busName: `${opName} Express`,
                  operatorName: opName,
                  busType: busType,
                  totalSeats: parseInt(seatsRaw) || 40,
                  rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
                  routes: [{
                      source: { name: source, city: source },
                      destination: { name: dest, city: dest },
                      stops: [source, dest],
                      departureTime: depTime,
                      arrivalTime: arrTime,
                      journeyDuration: `${parseFloat(durationRaw).toFixed(1)} hrs`,
                      fare: Math.round(parseFloat(fareRaw) || 1200),
                      bookedSeats: [],
                      date: new Date(dateRaw) // or simply Date.now() if we want them future
                  }]
             });
        }
        
        // Let's modify the dates to be future dates so user can search it
        buses.forEach(b => {
             let d = new Date();
             d.setDate(d.getDate() + Math.floor(Math.random()*7));
             b.routes[0].date = d;
        });

        await Bus.insertMany(buses);
        console.log(`Successfully imported ${buses.length} buses from CSV.`);
        process.exit();
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
};

importData();
