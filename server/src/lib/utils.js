import jwt from 'jsonwebtoken'

export const generateToken = (userId, res) => {
  const token = jwt.sign({userId}, process.env.JWT_SECRET, {
    expiresIn : "7d"
  })

  res.cookie("jwt", token, {
    maxAge : 7 * 24 * 60 * 60 * 1000, // in milliseconds
    httpOnly : true, //prevents XSS attacks
    sameSite : "strict", // prevents CSRF attacks
    secure : process.env.NODE_ENV !== "development" // determines whether you are using http or https
   });

   return token;
}