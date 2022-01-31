const jwt = require("jsonwebtoken");

const SECRET_KEY = "hsuwf53y6gsrrksgg0whfewyffccvzsaisnsvdsajk<bzfdrIAMASS";

module.exports = {
  generateTokenForUser: (userData) => {
    return jwt.sign(
      {
        userId: userData.id,
        isAdmin: userData.isAdmin,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
  },
};
