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
  parseAuthorization: (authorization) => {
    const authorizationKey = authorization.split(" ");
    const token = authorizationKey[1];
    return token;
    //return authorization != null ? authorization.replace("Bearer", "") : null;
  },
  getUserId: (authorization) => {
    let userId = -1;
    const token = module.exports.parseAuthorization(authorization);
    if (token != null) {
      try {
        const jwtToken = jwt.verify(token, SECRET_KEY);
        if (jwtToken != null) userId = jwtToken.userId;
      } catch (err) {}
    }
    return userId;
  },
};
