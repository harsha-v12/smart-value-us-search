/**
 * Server-Side HTML Renderer for /info/home/ landing page.
 * Sets age button URLs dynamically to the verified Routeclk tracking URL.
 */

function renderLandingPage(trackingUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <title>Financial Guide</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
:root {
    --text: #000;
    --grey1: #7A8699;
    --grey2: #A4A4A4;
    --white: #fff;
    --pColor: #004aad;
    --pColor1: #004aad
}

* {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box
}

body {
    font-family: "Poppins", sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #000;
    background: #efefef
}

a {
    transition: .3s linear
}

b, strong {
    font-weight: 600
}

header {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 10px 10px 15px;
    flex-direction: column
}

header p {
    margin-bottom: 15px;
    font-size: 12px
}

header>img {
    width: 184px
}

main {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    max-width: 800px;
    padding: 0 15px
}

main>* {
    width: 100%
}

main .boxes {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 30px;
    border: 1px solid #ccc;
    background: #fff;
    padding: 70px 15px;
    text-align: center
}

main .boxes .head1 {
    font-size: 36px;
    color: #444;
    margin-bottom: 30px
}

main .boxes .btns {
    width: 100%;
    max-width: 550px;
    margin: 0 auto;
    display: flex;
    flex-direction: column
}

main .boxes .btns>a {
    width: 100%;
    background: #efefef;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-decoration: none;
    padding: 13px 15px;
    color: #36447e;
    font-size: 18px;
    position: relative;
    display: block;
    margin: 5px 0;
    font-weight: 600;
}

main .boxes .btns>a:not(:last-child) {
    margin-bottom: 15px
}

main .boxes .btns>a::after {
    position: absolute;
    top: 50%;
    right: 15px;
    content: "❯";
    transform: translateY(-50%)
}

main .steper {
    width: 100%;
    max-width: 650px;
    margin: 30px auto;
    display: flex
}

main .steper>li {
    width: 25%;
    list-style: none;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    position: relative
}

main .steper>li>span {
    width: 30px;
    height: 30px;
    background: #c3c3c3;
    border-radius: 100%;
    line-height: 30px;
    position: relative;
    z-index: 1
}

main .steper>li>b {
    font-weight: normal;
    width: 100%;
    margin-top: 5px
}

main .steper>li::before,
main .steper>li::after {
    width: 50%;
    height: 7px;
    content: "";
    position: absolute;
    top: 12px;
    background: #c3c3c3
}

main .steper>li::before { left: 0 }
main .steper>li::after { right: 0 }
main .steper>li:first-child::before { display: none }
main .steper>li:last-child::after { display: none }

main .steper>li.active>span {
    background: #175ba8;
    color: #fff
}

main .steper>li.active>b {
    color: #175ba8
}

main .steper>li.active::before,
main .steper>li.active::after {
    background: #175ba8
}

main .steper>li.noRightLine::after {
    background: #c3c3c3
}

main footer {
    padding: 0 0 30px;
    font-size: 12px
}

main footer p:not(:last-child) {
    margin-bottom: 15px
}

main footer .logos {
    display: flex
}

main footer .logos>img {
    height: 50px
}

main footer .logos>img:not(:last-child) {
    margin-right: 10px
}

main footer .copyright {
    font-weight: 500;
    font-size: 13px
}

main footer .copyright>* {
    display: inline-block;
    text-decoration: none
}

main footer .copyright>a {
    color: #465e9b;
    font-size: 14px
}

@media(max-width: 575px) {
    main .boxes .head1 {
        font-size: 24px;
        margin-bottom: 20px
    }
    main .boxes {
        padding: 30px 15px
    }
    main .steper>li>b {
        font-size: 11px
    }
    main .boxes .btns>a {
        padding: 10px 15px
    }
    main .boxes .btns>a:not(:last-child) {
        margin-bottom: 10px
    }
}
    </style>
</head>
<body>
<main>
    <ul class="steper">
        <li class="active">
            <span>1</span>
            <b>Start</b>
        </li>
        <li class="active noRightLine">
            <span>2</span>
            <b>Select Age</b>
        </li>
        <li><span>3</span><b>Personalization</b></li>
        <li><span>4</span><b>Results</b></li>
    </ul>

    <div class="boxes">
        <p class="head1">Tap Your Age To Claim Your Refund</p>

        <p class="btns">
            <a href="${trackingUrl}" class="age-btn">18-24</a>
            <a href="${trackingUrl}" class="age-btn">25-34</a>
            <a href="${trackingUrl}" class="age-btn">35-44</a>
            <a href="${trackingUrl}" class="age-btn">45-54</a>
            <a href="${trackingUrl}" class="age-btn">55-64</a>
            <a href="${trackingUrl}" class="age-btn">65+</a>
        </p>
    </div>

    <footer>
        <p class="copyright">
            <a href="#">Terms & Conditions</a> | <a href="#">Privacy Policy</a> © <span>2026</span>
        </p>
    </footer>
</main>

<script>
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch(window.location.pathname + window.location.search, {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        console.log("Tracking API Response:", data);

        if (data.isFallback) {
            window.location.replace(data.destinationUrl);
            return;
        }

        if (data.destinationUrl) {
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
