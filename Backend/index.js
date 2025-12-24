require("dotenv").config();
const express = require("express");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        response_type: "code",
        scope: "identify"
    });

    res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

app.get("/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect("/");

    try {
        // 1️⃣ Trocar code por token
        const tokenResponse = await fetch(
            "https://discord.com/api/oauth2/token",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: process.env.REDIRECT_URI
                })
            }
        );

        const token = await tokenResponse.json();

        // 2️⃣ Buscar dados do usuário
        const userResponse = await fetch(
            "https://discord.com/api/users/@me",
            {
                headers: {
                    Authorization: `Bearer ${token.access_token}`
                }
            }
        );

        const user = await userResponse.json();

        console.log("Usuário logado:", user);

        // 3️⃣ Redirecionar para página final
        res.redirect(`/graypath.html?id=${user.id}`);

    } catch (err) {
        console.error("Erro no OAuth:", err);
        res.redirect("/");
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});