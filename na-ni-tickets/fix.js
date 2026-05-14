const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend', 'src', 'pages', 'TrainDetails.js');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/className=\{k-coach-btn \\\\\}/g, 'className={\k-coach-btn \\}');
code = code.replace(/className=\{bk-seat \\\} \\\} \\\}\}/g, 'className={\k-seat \ \ \\}');
code = code.replace(/title=\{Seat \\\}/g, 'title={\Seat \\}');
code = code.replace(/className=\{bk-checkout-btn \\\}\}/g, 'className={\k-checkout-btn \\}');
code = code.replace(/const seatId = \\\};/g, 'const seatId = \\-\\;');

fs.writeFileSync(file, code);
