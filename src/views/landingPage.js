/**
 * Server-Side HTML Renderer for landing page.
 * Sets age button URLs dynamically to the verified Routeclk tracking URL.
 */

function renderLandingPage(trackingUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <title>National Reduction</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
* {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
}

body {
    font-family: "Poppins", sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #000;
    background: #efefef;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 25px 15px 20px;
}

.top-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.logo {
    font-family: Impact, "Arial Black", "Poppins", sans-serif;
    font-size: 30px;
    letter-spacing: 0.5px;
    color: #000000;
    text-align: center;
    margin-bottom: 22px;
    line-height: 1.2;
}

.logo .green {
    color: #2f8541;
}

.steper {
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
    display: flex;
    list-style: none;
    padding: 0;
}

.steper>li {
    width: 25%;
    list-style: none;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    position: relative;
}

.steper>li>span {
    width: 26px;
    height: 26px;
    background: #c3c3c3;
    border-radius: 100%;
    line-height: 26px;
    font-size: 12px;
    font-weight: 700;
    color: #555;
    position: relative;
    z-index: 2;
    text-align: center;
}

.steper>li>b {
    font-weight: 500;
    width: 100%;
    margin-top: 6px;
    font-size: 11px;
    color: #555;
    white-space: nowrap;
}

.steper>li::before,
.steper>li::after {
    width: 50%;
    height: 5px;
    content: "";
    position: absolute;
    top: 11px;
    background: #c3c3c3;
    z-index: 1;
}

.steper>li::before { left: 0; }
.steper>li::after { right: 0; }
.steper>li:first-child::before { display: none; }
.steper>li:last-child::after { display: none; }

.steper>li.active>span {
    background: #165ba8;
    color: #fff;
}

.steper>li.active>b {
    color: #165ba8;
    font-weight: 700;
}

.steper>li.active::before,
.steper>li.active::after {
    background: #165ba8;
}

.steper>li.noRightLine::after {
    background: #c3c3c3;
}

main {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: auto 0;
    padding: 20px 0;
}

.boxes {
    width: 100%;
    max-width: 600px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.06);
    padding: 48px 45px 44px;
    text-align: center;
}

.boxes .head1 {
    font-size: 26px;
    font-weight: 700;
    color: #222222;
    margin-bottom: 28px;
    line-height: 1.3;
}

.boxes .btns {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 13px;
}

.boxes .btns>a {
    width: 100%;
    background: #efefef;
    border: 1px solid #d5dbe3;
    border-radius: 5px;
    text-decoration: none;
    padding: 13px 20px;
    color: #173f7a;
    font-size: 17px;
    font-weight: 700;
    position: relative;
    display: block;
    text-align: center;
    transition: background 0.2s ease, border-color 0.2s ease;
}

.boxes .btns>a:hover {
    background: #e2e6eb;
    border-color: #cbd5e1;
}

.boxes .btns>a::after {
    position: absolute;
    top: 50%;
    right: 20px;
    content: "❯";
    transform: translateY(-50%);
    font-size: 13px;
    font-weight: 900;
    color: #173f7a;
}

footer {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 10px 0 5px;
}

.footer-logo {
    font-family: Impact, "Arial Black", "Poppins", sans-serif;
    font-size: 17px;
    letter-spacing: 0.5px;
    color: #000000;
    margin-bottom: 6px;
    line-height: 1.2;
}

.footer-logo .green {
    color: #2f8541;
}

.copyright {
    font-weight: 600;
    font-size: 12px;
    color: #173f7a;
}

.copyright a {
    color: #173f7a;
    text-decoration: none;
}

.copyright a:hover {
    text-decoration: underline;
}

@media(max-width: 640px) {
    .boxes {
        padding: 35px 22px 30px;
        max-width: 100%;
    }
    .boxes .head1 {
        font-size: 21px;
        margin-bottom: 20px;
    }
    .boxes .btns>a {
        padding: 11px 16px;
        font-size: 15.5px;
    }
    .steper {
        max-width: 340px;
    }
    .steper>li>b {
        font-size: 10px;
    }
    .logo {
        font-size: 26px;
        margin-bottom: 18px;
    }
}
    </style>
</head>
<body>
    <div class="top-section">
        <div class="logo">NATIONAL <span class="green">REDUCTION</span></div>

        <ul class="steper">
            <li class="active">
                <span>1</span>
                <b>Start</b>
            </li>
            <li class="active noRightLine">
                <span>2</span>
                <b>Select Age</b>
            </li>
            <li>
                <span>3</span>
                <b>Personalization</b>
            </li>
            <li>
                <span>4</span>
                <b>Results</b>
            </li>
        </ul>
    </div>

    <main>
        <div class="boxes">
            <h1 class="head1">Tap Your Age To Claim Your Refund</h1>

            <div class="btns">
                <a href="${trackingUrl || '#'}" class="age-btn">18-24</a>
                <a href="${trackingUrl || '#'}" class="age-btn">25-34</a>
                <a href="${trackingUrl || '#'}" class="age-btn">35-44</a>
                <a href="${trackingUrl || '#'}" class="age-btn">45-54</a>
                <a href="${trackingUrl || '#'}" class="age-btn">55-64</a>
                <a href="${trackingUrl || '#'}" class="age-btn">65+</a>
            </div>
        </div>
    </main>

    <footer>
        <div class="footer-logo">NATIONAL <span class="green">REDUCTION</span></div>
        <p class="copyright">
            <a href="#">Terms & Conditions</a> | <a href="#">Privacy Policy</a> &copy; 2025
        </p>
    </footer>

    <script>
    document.addEventListener("DOMContentLoaded", async function () {
        try {
            const endpoint = (window.location.pathname && window.location.pathname !== '/' && window.location.pathname !== '/home/index.html' && window.location.pathname !== '/index.html')
                ? (window.location.pathname + window.location.search)
                : ('/api/v1/tracking/resolve' + window.location.search);
            const response = await fetch(endpoint, {
                headers: { 'Accept': 'application/json' }
            }).catch(() => fetch('/api/v1/tracking/resolve' + window.location.search, { headers: { 'Accept': 'application/json' } }));

            const data = await response.json();
            console.log("Tracking API Response (/info/home):", data);

            if (data && data.isFallback && data.destinationUrl) {
                window.location.replace(data.destinationUrl);
                return;
            }

            if (data && data.destinationUrl) {
                document.querySelectorAll(".age-btn").forEach(btn => {
                    btn.setAttribute("href", data.destinationUrl);
                });
            }
        } catch (err) {
            console.error("Tracking API Error:", err);
        }
    });
    </script>
</body>
</html>`;
}

module.exports = { renderLandingPage };
