import * as authService from "../services/auth.service.js";

export async function registerHandler(req, res) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: { message: err.message } });
  }
}

export async function loginHandler(req, res) {
  try {
    const data = await authService.login(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: { message: err.message } });
  }
}

export async function meHandler(req, res) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: { message: err.message } });
  }
}
