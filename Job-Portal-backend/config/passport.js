const passport = require("passport");
const User = require("../models/User"); 

require("./googleStrategy")(passport);
require("./linkedinStrategy")(passport);

module.exports = passport;
