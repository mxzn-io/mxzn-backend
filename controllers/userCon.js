const User = require("./../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let tokens = {};

const genToken = (user, type) => {
  switch (type) {
    case "access":
      return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "40s",
      });
    case "refresh":
      return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "30m",
      });
    default:
      return "";
  }
};

const getIp = (req) => {
  return req.headers["host"].split(":")[0] || "";
};

const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.json({
      status: "error",
      msg: "invalid username",
    });
  }

  if (!password || password.length < 6) {
    return res.json({
      status: "error",
      msg: "invalid password",
    });
  }

  try {
    const bcrPass = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: bcrPass,
    });
    return res.json({
      status: "ok",
      msg: "success",
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.json({
        status: "error",
        msg: "email already in use.",
      });
    }
    throw e;
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      status: "error",
      msg: "email don't exist",
    });
  }

  if (await bcrypt.compare(password, user.password)) {
    const ip = getIp(req);

    return res.json({
      status: "ok",
      data: {
        accessToken: genToken({ email, ip }, "access"),
        refreshToken: genToken({ email, ip }, "refresh"),
      },
      msg: "login successfully",
    });
  }

  return res.json({
    status: "error",
    msg: "invalid email or password",
  });
};

const logout = (req, res) => {
  const { token } = req.body;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ msg: "token not valid" });

    const ip = getIp();
    const { email } = payload;
    delete tokens[email]["ip"][ip];

    res.status(200).json({ msg: "logout successfully" });
  });
};

const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ status: 'error', msg: "refresh token not valid" });

    const ip = getIp(req);
    const { email } = payload;

    res.json({ accessToken: genToken({ email, ip }, "access"), refreshToken: genToken({ email, ip }, "refresh") });
  });
};

const userInfo = async (req, res) => {
  const { email } = req.user;
  const { name, avatar, phone } = await User.findOne({ email });
  res.json({ status: "ok", data: { email, name, avatar, phone } });
};

const updateUser = async (req, res) => {
  const { email } = req.user;
  console.log(req.body)

  try {
    await User.findOneAndUpdate({ email }, { ...req.body });
  } catch (e) {
    console.log(e)
  }

  return res.json({
    status: "ok",
    msg: "success",
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  userInfo,
  updateUser,
};
