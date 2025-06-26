const express = require('express')
const cors = require("cors")
const app = express()
const cookieParser = require('cookie-parser');

const adminRoute = require('./routes/admin')
const donorRoute = require('./routes/donor')
const hospitalRoute = require('./routes/hospital')
const prospectRoute = require('./routes/prospect')
const bloodrequestRoute = require("./routes/bloodRequest")
const airoutes = require("./routes/ai")
const adminDonor = require('./routes/admin')
const contactRoute = require("./routes/contact");
const newsletterRoutes = require("./routes/newsletter");
const campaignRoute = require("./routes/campaign"); 

app.use(cookieParser());

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//Cors
app.use(cors({
  origin: "http://localhost:5173",  // Your frontend URL
  credentials: true                 // Allow credentials like cookies
}));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/uploads/profile_pics', express.static(path.join(__dirname, 'uploads/profile_pics')));


//Routes
app.use('/api/v1/admin', adminRoute)
app.use('/api/v1/donors', donorRoute)
app.use('/api/v1/hospitals', hospitalRoute)
app.use('/api/v1/prospects', prospectRoute)
app.use("/api/v1/blood", bloodrequestRoute);

app.use('/api/v1/ai', airoutes);

app.use('/api/v1/admin', adminDonor);

app.use("/api/v1/contact", contactRoute);

app.use("/api/v1/newsletter", newsletterRoutes);

app.use('/api/v1/admin/newsletter', require('./routes/newsletter'));

app.use("/api/v1/admin/campaign", campaignRoute);


// ✅ Schedule reminder job
require('./jobs/sendReminders');


module.exports = app;






