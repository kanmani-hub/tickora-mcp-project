import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const BASE_URL = "https://www.web.tickora.co.in";

let sessionCookie = "";

// LOGIN FIXED
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        username: email,   // ⚠️ IMPORTANT CHANGE
        password: password
      }),
      redirect: "manual"
    });

    const cookies = loginRes.headers.raw()["set-cookie"];

    if (!cookies) {
      return res.json({ success: false, message: "No cookie received" });
    }

    sessionCookie = cookies.join(";");

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// PEOPLE
app.get("/people", async (req, res) => {
  const response = await fetch(`${BASE_URL}/api/people`, {
    headers: {
      Cookie: sessionCookie
    }
  });

  const data = await response.text();
  res.send(data);
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});