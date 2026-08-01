require('dotenv').config(); const mongoose = require('mongoose'); console.log('1'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('connected')).catch(e => console.log(e));
