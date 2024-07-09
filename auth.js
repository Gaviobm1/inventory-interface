const auth = (req, res, next) => {
  console.log("Auth middleware called");
  const reject = () => {
    console.log("Authentication failed");
    res.setHeader("www-authenticate", "Basic");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;
  console.log("Authorization header", authorization);

  if (!authorization) {
    return reject();
  }

  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  )
    .toString()
    .split(":");

  if (!(username === "gav" && password === "password1")) {
    return reject();
  }
  console.log("username:", username, "PAssword", password);

  next();
};

module.exports = auth;
