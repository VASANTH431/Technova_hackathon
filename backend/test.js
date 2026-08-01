const mongoose = require('mongoose'); console.log('1'); mongoose.connect('mongodb://localhost:27017/event-booking').then(() => console.log('connected')).catch(e => console.log(e));
