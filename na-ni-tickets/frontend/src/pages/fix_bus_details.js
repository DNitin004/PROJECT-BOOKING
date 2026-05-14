const fs = require('fs');
let code = fs.readFileSync('c:/Users/nithi/OneDrive/Desktop/PROJECT-BOOKING/na-ni-tickets/frontend/src/pages/node_bus_details.js', 'utf8');
code = code.replace(/const fs = require\('fs'\);\n\nconst code = `/, '');
code = code.replace(/`;\n\nfs\.writeFileSync.*/, '');
fs.writeFileSync('c:/Users/nithi/OneDrive/Desktop/PROJECT-BOOKING/na-ni-tickets/frontend/src/pages/BusDetails.js', code);
