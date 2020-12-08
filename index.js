const mongoose = require('mongoose');
const db = require('./config/config').get(process.env.NODE_ENV);
const app = require('./server');

mongoose.connect(
    db.DATABASE, 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true
    },
    (err) => {
        if (err) console.log(err);
        
        const PORT = process.env.PORT||3000;
        app.listen(PORT, () => {console.log(`App is up and running at port ${PORT}`); });
    } 
);