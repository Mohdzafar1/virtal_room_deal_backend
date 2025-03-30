const jwt = require('jsonwebtoken');


exports.authenticateUser = (req, res, next) => {
  console.log("Authorization Header:", req.headers.authorization);
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token missing or invalid." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user to request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};