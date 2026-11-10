/*! Digg Agency Growth Opportunity Assessment, embed build v1.0.1
    https://github.com/jrotzdesign/digg-assessment-embed
    Usage:  <div id="digg-assessment"></div>
            <script src=".../dist/digg-assessment.js" defer></script> */
(function(){

  /* ======================= SETTINGS ======================= */

  /* Where submitted leads go: the /api/lead Function on the digg-assessment
     Cloudflare Pages project. It emails the lead to Joselyne and the results copy
     to the visitor, and only accepts requests from thediggagency.com and the demo
     site. null = demo mode: nothing is sent, the lead is logged to the console.
     The URL is public by design: no key lives here. */
  var ENDPOINT = 'https://digg-assessment.pages.dev/api/lead';

  /* Where "Book a call" goes (opens in the same tab).
     null = show the old "Demo only" alert instead. */
  var BOOK_URL = 'https://www.thediggagency.com/contact-us/';

  /* ======================================================== */

  var CSS = "/* The Digg Agency — Growth Opportunity Assessment, embed build.\n   Ported from the production #assessment-css (digg-assessment, main).\n   Every rule is scoped to #digg-assessment: nothing here touches the host page.\n   Tokens live on the container instead of :root. Keyframes are prefixed dga-. */\n#digg-assessment{\n  --purple:#6944C6; --indigo:#3324D4; --orange:#F7551A; --orange-lt:#FF6B35;\n  --ink:#16141c; --gray:#4A4A4A; --mute:#6f6b84; --line:#e8e4f3;\n  --soft:#F6F4FC; --white:#fff;\n  --grad:linear-gradient(118deg,#6944C6 0%,#3324D4 100%);\n  --ease:cubic-bezier(.22,.61,.36,1);\n  --card:var(--dg-radius);\n  --dg-radius:6px; --dg-radius-sm:calc(var(--dg-radius) - 2px);\n}\n#digg-assessment{-webkit-text-size-adjust:100%}\n#digg-assessment *{box-sizing:border-box;margin:0;padding:0}\n#digg-assessment{font-family:Montserrat,system-ui,sans-serif;color:var(--ink);background:#fff;position:relative;isolation:isolate;\n  min-height:0;padding-top:124px;padding-bottom:80px;display:flex;align-items:flex-start;justify-content:center;padding-left:18px;padding-right:18px;line-height:1.55}\n#digg-assessment img{display:block;max-width:100%}\n#digg-assessment button{font:inherit;cursor:pointer;border:0;background:none;color:inherit}\n#digg-assessment .shell{width:100%;max-width:780px}\n/* purple band behind the header and the top of the card, with the same angled corner as the home hero */\n#digg-assessment::before{content:\"\";position:absolute;left:0;right:0;top:0;height:400px;z-index:-1;background:var(--grad);clip-path:polygon(0 0,100% 0,100% calc(100% - 70px),calc(100% - 120px) 100%,0 100%)}\n#digg-assessment .card{background:var(--white);border-radius:var(--card);padding:44px 46px 38px;position:relative;\n  box-shadow:0 22px 60px rgba(18,6,56,.22),0 0 0 1px rgba(105,68,198,.06)}\n#digg-assessment .eyebrow{font:700 11px Montserrat;letter-spacing:.17em;text-transform:uppercase;color:var(--purple)}\n#digg-assessment h1{font-size:clamp(27px,4.3vw,39px);line-height:1.1;font-weight:700;letter-spacing:-.022em;margin:13px 0 14px}\n#digg-assessment h2{font-size:clamp(19px,2.9vw,26px);line-height:1.3;font-weight:700;letter-spacing:-.012em}\n#digg-assessment p.lede{font-family:\"Open Sans\",sans-serif;color:var(--gray);font-size:16px;max-width:56ch}\n#digg-assessment .meta{display:flex;gap:30px;flex-wrap:wrap;margin:26px 0 30px;padding-top:22px;border-top:1px solid var(--line)}\n#digg-assessment .meta div{font-family:\"Open Sans\",sans-serif;font-size:13px;color:var(--mute)}\n#digg-assessment .meta b{display:block;font-family:Montserrat;font-size:15px;font-weight:700;color:var(--ink);margin-bottom:1px}\n#digg-assessment .btn{display:inline-flex;align-items:center;justify-content:center;gap:11px;background:var(--orange);color:#fff;\n  font-weight:700;font-size:19px;padding:14px 28px;border-radius:var(--dg-radius);\n  transition:background .25s var(--ease),transform .25s var(--ease),box-shadow .25s var(--ease)}\n#digg-assessment .btn:disabled{background:#ddd9e8;cursor:not-allowed;transform:none;box-shadow:none}\n#digg-assessment .btn .arr{transition:transform .3s var(--ease)}\n#digg-assessment .btn.ghost{background:none;color:var(--mute);padding:15px 2px;font-weight:600;font-size:15px}\n#digg-assessment .btn.solid{background:var(--purple)}\n@media(hover:hover){#digg-assessment .btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 11px 26px rgba(247,85,26,.3)}\n#digg-assessment .btn:hover:not(:disabled) .arr{transform:translateX(5px)}\n#digg-assessment .btn.ghost:hover{background:none;color:var(--purple);transform:none;box-shadow:none}\n#digg-assessment .btn.solid:hover{background:var(--indigo);box-shadow:0 11px 26px rgba(105,68,198,.3)}}\n#digg-assessment .steps{display:flex;gap:7px;margin-bottom:26px}\n#digg-assessment .step{flex:1;min-width:0}\n#digg-assessment .step .ln{height:4px;border-radius:4px;background:#ece8f6;overflow:hidden}\n#digg-assessment .step .ln i{display:block;height:100%;width:0;background:var(--purple);border-radius:4px;\n  transition:width .5s var(--ease)}\n#digg-assessment .step.done .ln i{width:100%}\n#digg-assessment .step.now .ln i{background:var(--orange)}\n#digg-assessment .step span{display:block;margin-top:8px;font:600 9.5px Montserrat;letter-spacing:.13em;\n  text-transform:uppercase;color:#c3bed6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\n  transition:color .35s}\n#digg-assessment .step.done span{color:var(--mute)}\n#digg-assessment .step.now span{color:var(--orange)}\n#digg-assessment .qhead{display:flex;align-items:baseline;gap:12px;margin-bottom:11px}\n#digg-assessment .qnum{font:800 12px Montserrat;letter-spacing:.06em;color:var(--purple)}\n#digg-assessment .qof{font-family:\"Open Sans\",sans-serif;font-size:12.5px;color:var(--mute)}\n#digg-assessment #dga-qtext{font-size:clamp(20px,2.85vw,27px);line-height:1.32;font-weight:700;letter-spacing:-.012em;max-width:26ch}\n#digg-assessment .opts{list-style:none;margin:28px 0 28px;display:grid;grid-template-columns:minmax(0,1fr);gap:9px;padding:0}\n#digg-assessment .opts li{will-change:transform,opacity;min-width:0}\n#digg-assessment .opt{width:100%;max-width:100%;box-sizing:border-box;text-align:left;white-space:normal;display:flex;align-items:flex-start;gap:14px;\n  border:1.5px solid var(--line);border-radius:var(--dg-radius);padding:15px 18px;background:#fff;\n  font-family:\"Open Sans\",sans-serif;font-size:14.8px;line-height:1.45;color:var(--gray);\n  transition:border-color .18s,background .18s,transform .18s var(--ease),color .18s}\n@media(hover:hover){#digg-assessment .opt:hover{border-color:#c3b2ec;background:var(--soft);transform:translateX(3px)}}\n#digg-assessment .opt span:last-child{flex:1;min-width:0;overflow-wrap:anywhere}\n#digg-assessment .opt .dot{flex:none;width:18px;height:18px;margin-top:2px;border-radius:50%;border:2px solid #d3cce6;\n  position:relative;transition:border-color .18s}\n#digg-assessment .opt[aria-checked=true]{border-color:var(--purple);background:var(--soft);color:var(--ink);font-weight:600}\n#digg-assessment .opt[aria-checked=true] .dot{border-color:var(--purple)}\n#digg-assessment .opt[aria-checked=true] .dot::after{content:\"\";position:absolute;inset:3px;border-radius:50%;background:var(--purple)}\n#digg-assessment .nav{display:flex;justify-content:space-between;align-items:center;gap:14px}\n#digg-assessment .bars{margin:32px 0 4px;border-top:1px solid var(--line);padding-top:26px;display:grid;gap:19px}\n#digg-assessment .bars .hd{display:flex;justify-content:space-between;align-items:baseline;margin:-4px 0 2px}\n#digg-assessment .bars .hd span{font:700 10px Montserrat;letter-spacing:.15em;text-transform:uppercase;color:var(--mute)}\n#digg-assessment .bar .top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:8px;flex-wrap:wrap}\n#digg-assessment .bar .top b{flex:1;min-width:0;font-size:14px;font-weight:600}\n#digg-assessment .bar .rt{display:flex;align-items:baseline;gap:10px;flex:none}\n#digg-assessment .bar .lvl{font:600 10px Montserrat;letter-spacing:.12em;text-transform:uppercase;color:var(--mute)}\n#digg-assessment .bar .note{margin-top:8px;font-family:\"Open Sans\",sans-serif;font-size:13px;color:var(--mute);\n  max-width:62ch}\n#digg-assessment .vault{position:relative}\n#digg-assessment .locked{filter:blur(5px);opacity:.6;pointer-events:none;user-select:none;\n  max-height:330px;overflow:hidden;\n  -webkit-mask-image:linear-gradient(#000 58%,transparent 100%);mask-image:linear-gradient(#000 58%,transparent 100%);\n  transition:filter .7s var(--ease),opacity .7s var(--ease),max-height .8s var(--ease)}\n#digg-assessment .vault.open .locked{filter:none;opacity:1;pointer-events:auto;user-select:auto;\n  max-height:12000px;-webkit-mask-image:none;mask-image:none}\n#digg-assessment .gate{position:absolute;left:0;right:0;top:58px;z-index:5;text-align:center;\n  max-width:520px;margin:0 auto;\n  background:rgba(255,255,255,.97);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);\n  border:1px solid var(--line);border-radius:var(--dg-radius);padding:30px 30px 26px;\n  box-shadow:0 20px 54px rgba(18,6,56,.14)}\n#digg-assessment .vault.open .gate{display:none}\n#digg-assessment .gate .lock{width:40px;height:40px;margin:0 auto 13px;border-radius:50%;display:grid;place-items:center;\n  background:var(--soft);color:var(--purple)}\n#digg-assessment .gate h3{font-size:19px;letter-spacing:-.01em;margin-bottom:8px}\n#digg-assessment .gate p{font-family:\"Open Sans\",sans-serif;font-size:14.5px;color:var(--gray);max-width:46ch;margin:0 auto 20px}\n#digg-assessment .gate small{display:block;margin-top:13px;font-family:\"Open Sans\",sans-serif;font-size:12px;color:var(--mute)}\n#digg-assessment .gate .err{font-family:\"Open Sans\",sans-serif;font-size:13px;color:var(--orange);font-weight:600;\n  min-height:19px;margin-top:9px}\n#digg-assessment .fixbox{width:100%;box-sizing:border-box;min-height:150px;resize:vertical;border:1.5px solid var(--line);border-radius:var(--dg-radius-sm);\n  padding:15px 18px;margin:28px 0 6px;font-family:\"Open Sans\",sans-serif;font-size:15px;line-height:1.5;color:var(--ink);outline:none;background:#fff}\n#digg-assessment .fixbox:focus{border-color:var(--purple)}\n#digg-assessment .fixcount{text-align:right;font-family:\"Open Sans\",sans-serif;font-size:12px;color:var(--mute);margin-bottom:26px}\n#digg-assessment .email{display:flex;gap:9px;max-width:460px;margin:0 auto}\n#digg-assessment .email input{flex:1;min-width:0;border:1.5px solid var(--line);border-radius:var(--dg-radius-sm);padding:14px 19px;\n  font-family:\"Open Sans\",sans-serif;font-size:14.5px;outline:none;transition:border-color .2s;background:#fff}\n#digg-assessment .email input:focus{border-color:var(--purple)}\n#digg-assessment .email input.bad{border-color:var(--orange)}\n@media(max-width:640px),(hover:none) and (pointer:coarse){#digg-assessment .email input,#digg-assessment .fixbox{font-size:16px}}\n#digg-assessment .cta{margin-top:28px;padding-top:26px;border-top:1px solid var(--line);\n  display:flex;gap:16px;flex-wrap:wrap;align-items:center;justify-content:space-between}\n#digg-assessment .cta[hidden]{display:none}\n#digg-assessment .cta b{display:block;font-size:15px}\n#digg-assessment .cta span{font-family:\"Open Sans\",sans-serif;font-size:13.5px;color:var(--mute)}\n#digg-assessment .cta .btn .arr{font:inherit;color:#fff}\n#digg-assessment .confirm[hidden]{display:none}\n#digg-assessment .confirm{display:flex;align-items:center;gap:9px;margin:22px 0 -6px;padding:12px 16px;\n  border-radius:var(--dg-radius);background:var(--soft);font-family:\"Open Sans\",sans-serif;font-size:13.5px;color:var(--gray)}\n#digg-assessment .confirm svg{flex:none;color:var(--purple)}\n#digg-assessment .confirm b{font-family:Montserrat;font-weight:700;color:var(--ink)}\n#digg-assessment .confirm.fail{background:rgba(247,85,26,.08);color:var(--ink)}\n#digg-assessment .confirm.fail svg{display:none}\n/* honeypot: off-screen, never focused, ignored by screen readers */\n#digg-assessment .hp{position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;opacity:0}\n#digg-assessment .sent{font-family:\"Open Sans\",sans-serif;font-size:13.5px;color:var(--purple);font-weight:600}\n#digg-assessment .screen{display:none}\n#digg-assessment .screen.on{display:block;animation:dga-in .4s var(--ease) both}\n@keyframes dga-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}\n@keyframes dga-qin{from{opacity:0;transform:translateX(26px)}  to{opacity:1;transform:none}}\n@keyframes dga-qinR{from{opacity:0;transform:translateX(-26px)} to{opacity:1;transform:none}}\n@keyframes dga-qlift{from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none}}\n#digg-assessment #dga-s-q.anim .qhead{animation:dga-qin .40s var(--ease) both}\n#digg-assessment #dga-s-q.anim #dga-qtext{animation:dga-qin .46s var(--ease) .04s both}\n#digg-assessment #dga-s-q.anim .opts li{animation:dga-qlift .46s var(--ease) both;\n  animation-delay:calc(.12s + var(--i) * .07s)}\n#digg-assessment #dga-s-q.anim .nav{animation:dga-qlift .42s var(--ease) .42s both}\n#digg-assessment #dga-s-q.anim.rev .qhead{animation-name:dga-qinR}\n#digg-assessment #dga-s-q.anim.rev #dga-qtext{animation-name:dga-qinR}\n@keyframes dga-pop{0%{transform:scale(1)}45%{transform:scale(1.32)}100%{transform:scale(1)}}\n#digg-assessment .opt[aria-checked=true] .dot::after{animation:dga-pop .34s var(--ease) both}\n@keyframes dga-pulse{0%,100%{opacity:1}50%{opacity:.45}}\n#digg-assessment .step.now span{animation:dga-pulse 2.4s ease-in-out infinite}\n@media(max-width:640px){#digg-assessment{padding-bottom:48px}\n#digg-assessment::before{height:340px;clip-path:polygon(0 0,100% 0,100% calc(100% - 40px),calc(100% - 70px) 100%,0 100%)}\n#digg-assessment .card{padding:30px 22px 28px}\n#digg-assessment .meta{gap:16px}\n#digg-assessment .steps{gap:5px}\n#digg-assessment .step span{font-size:7.5px;letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:clip}\n#digg-assessment .nav{flex-direction:column-reverse;align-items:stretch}\n#digg-assessment .cta{flex-direction:column;align-items:stretch}\n#digg-assessment .email{flex-direction:column;min-width:0}\n#digg-assessment .email .btn, #digg-assessment .cta>.btn{width:100%}\n#digg-assessment .gate{position:static;padding:26px 20px 22px;margin-top:20px}\n#digg-assessment .locked{filter:blur(6px)}\n#digg-assessment .gate h3{font-size:17px}\n#digg-assessment .cta{justify-content:stretch}}\n@media(prefers-reduced-motion:reduce){#digg-assessment *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}\n#digg-assessment .res-head{margin:11px 0 10px}\n#digg-assessment .bar .top{align-items:center}\n#digg-assessment .bar .rt{flex-wrap:wrap;justify-content:flex-end}\n#digg-assessment .bar.lv-mid .lvl{color:var(--purple)}\n#digg-assessment .bar.lv-hi .lvl{color:var(--orange)}\n#digg-assessment .bar.first .top b::after{content:\"Investigate first\";margin-left:9px;font:700 9px Montserrat;letter-spacing:.11em;\n  text-transform:uppercase;color:var(--purple);background:rgba(105,68,198,.1);padding:3px 8px;\n  border-radius:99px;position:relative;top:-1px;white-space:nowrap}\n#digg-assessment .segs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}\n#digg-assessment .segs i{display:block;height:10px;border-radius:2px;background:#efecf7;transition:background .45s var(--ease)}\n#digg-assessment .bar.lv-lo .segs i.on{background:#a891e0}\n#digg-assessment .bar.lv-mid .segs i.on{background:var(--purple)}\n#digg-assessment .bar.lv-hi .segs i.on{background:var(--orange)}\n#digg-assessment .chk{display:inline-block;font:700 9.5px Montserrat;letter-spacing:.1em;text-transform:uppercase;line-height:1.4;\n  color:var(--orange);background:rgba(247,85,26,.1);padding:3px 9px;border-radius:99px;white-space:nowrap}\n#digg-assessment .bar .chk{display:none}\n#digg-assessment .bar.flagged .chk{display:inline-block}\n#digg-assessment .bars-note{font-family:\"Open Sans\",sans-serif;font-size:12.5px;line-height:1.55;color:var(--mute);max-width:66ch}\n#digg-assessment .bars-note .chk{margin-right:6px}\n#digg-assessment .rec{margin-top:30px}\n#digg-assessment .rec>.eyebrow{margin-bottom:12px}\n#digg-assessment .pick{background:var(--soft);border-radius:var(--dg-radius);padding:24px 26px;border-left:3px solid var(--orange)}\n#digg-assessment .pick+.pick{margin-top:14px}\n#digg-assessment .pick-area{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}\n#digg-assessment .pick-area>span:first-child{font:700 13px Montserrat;color:var(--ink)}\n#digg-assessment .pick-area .lvl{font:600 10px Montserrat;letter-spacing:.12em;text-transform:uppercase;color:var(--orange)}\n#digg-assessment .pick h3{font-size:clamp(18px,2.4vw,21px);line-height:1.3;font-weight:700;letter-spacing:-.01em;margin:10px 0 12px}\n#digg-assessment .pick p{font-family:\"Open Sans\",sans-serif;font-size:14.5px;line-height:1.6;color:var(--gray);margin-bottom:10px}\n#digg-assessment .pick p.more{background:#fff;border:1px dashed #d3cce6;border-radius:var(--dg-radius-sm);padding:10px 14px;\n  font-size:13.5px;color:var(--ink);margin-bottom:12px}\n#digg-assessment .pick h4{font:700 10.5px Montserrat;letter-spacing:.15em;text-transform:uppercase;color:var(--purple);margin:18px 0 10px}\n#digg-assessment .pick ol{list-style:none;counter-reset:s;display:grid;gap:10px;margin-bottom:4px}\n#digg-assessment .pick ol li{counter-increment:s;position:relative;padding-left:34px;font-family:\"Open Sans\",sans-serif;\n  font-size:14.5px;line-height:1.55;color:var(--gray)}\n#digg-assessment .pick ol li::before{content:counter(s);position:absolute;left:0;top:0;width:23px;height:23px;border-radius:50%;\n  display:grid;place-items:center;background:#fff;border:1.5px solid var(--line);font:700 11px Montserrat;color:var(--purple)}\n#digg-assessment .pick ol b{color:var(--ink);font-weight:600}\n#digg-assessment .pick p:last-child{margin-bottom:0}\n#digg-assessment .nogaps{background:var(--soft);border-radius:var(--dg-radius);padding:20px 24px;border-left:3px solid var(--purple);\n  font-size:16px;font-weight:600;color:var(--ink)}\n@media(max-width:640px){#digg-assessment .bar .top{flex-direction:column;align-items:flex-start;gap:6px}\n#digg-assessment .bar .rt{justify-content:flex-start}\n#digg-assessment .pick{padding:20px 18px}}\n#digg-assessment .btn:focus-visible,#digg-assessment .opt:focus-visible,#digg-assessment .email input:focus-visible,#digg-assessment .fixbox:focus-visible{outline:3px solid var(--indigo);outline-offset:3px}\n#digg-assessment .btn.ghost:focus-visible{outline-offset:0}\n\n/* Fields: pin what the host theme's kit would otherwise set (values match production) */\n#digg-assessment input,#digg-assessment textarea{color:#000;line-height:1.55;font-weight:400;letter-spacing:normal;text-transform:none;box-shadow:none;height:auto}\n#digg-assessment .fixbox{color:var(--ink);line-height:1.5}\n";
  var HTML = "<div class=\"shell\">\n  <section class=\"card screen on\" id=\"dga-s-intro\">\n    <div class=\"eyebrow\">Your Sales &amp; Marketing Growth Gap – Assessment</div>\n    <h1>Not sure what’s holding your business back? Take the <span style=\"white-space:nowrap\">5-minute</span> assessment and find out.</h1>\n    <p class=\"lede\">Thirteen quick questions about your products, customers, sales and marketing. At the end you see where your potential gaps are and the first area we recommend you investigate.</p>\n    <div class=\"meta\">\n      <div><b>13 questions</b>About 5 minutes</div>\n      <div><b>5 areas</b>Scored separately</div>\n      <div><b>Instant results</b>Plus a copy by email</div>\n    </div>\n    <button class=\"btn\" id=\"dga-start\">Start the assessment <span class=\"arr\">&rarr;</span></button>\n  </section>\n\n  <section class=\"card screen\" id=\"dga-s-q\">\n    <div class=\"steps\" id=\"dga-steps\"></div>\n    <div class=\"qhead\"><span class=\"qnum\" id=\"dga-qnum\">01</span><span class=\"qof\" id=\"dga-qof\"></span></div>\n    <h2 id=\"dga-qtext\"></h2>\n    <ul class=\"opts\" id=\"dga-opts\" role=\"radiogroup\"></ul>\n    <div class=\"nav\">\n      <button class=\"btn ghost\" id=\"dga-back\">&larr; Back</button>\n      <button class=\"btn\" id=\"dga-next\" disabled>Next <span class=\"arr\">&rarr;</span></button>\n    </div>\n  </section>\n\n  <section class=\"card screen\" id=\"dga-s-res\">\n    <div class=\"eyebrow\">Your results</div>\n    <h2 class=\"res-head\">Your Sales &amp; Marketing Growth Gap</h2>\n    <p class=\"lede\">How your answers map across five areas, and the first area we recommend you investigate.</p>\n\n    <div class=\"confirm\" id=\"dga-confirm\" hidden>\n      <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"\n           stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 6 9 17l-5-5\"/></svg>\n      <span>A copy is on its way to <b id=\"dga-confirmmail\"></b>.</span>\n    </div>\n\n    <div class=\"vault\" id=\"dga-vault\">\n      <div class=\"locked\" id=\"dga-locked\">\n        <div class=\"bars\" id=\"dga-bars\"></div>\n        <div class=\"rec\" id=\"dga-rec\"></div>\n      </div>\n\n      <div class=\"gate\" id=\"dga-gate\">\n        <div class=\"lock\" aria-hidden=\"true\">\n          <svg viewBox=\"0 0 24 24\" width=\"17\" height=\"17\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.1\"\n               stroke-linecap=\"round\" stroke-linejoin=\"round\">\n            <rect x=\"4\" y=\"10.5\" width=\"16\" height=\"11\" rx=\"2.5\"/><path d=\"M8 10.5V7a4 4 0 0 1 8 0v3.5\"/>\n          </svg>\n        </div>\n        <h3>See the full breakdown</h3>\n        <p>Your potential gap in each area, the first area to investigate, and three practical next steps. We will send a copy to your inbox.</p>\n        <form class=\"email\" id=\"dga-emailwrap\" novalidate>\n          <input type=\"email\" id=\"dga-mail\" placeholder=\"you@company.com\" aria-label=\"Work email\" autocomplete=\"email\" required>\n          <input type=\"text\" name=\"website\" id=\"dga-hp\" class=\"hp\" tabindex=\"-1\" autocomplete=\"off\" aria-hidden=\"true\">\n          <button class=\"btn\" id=\"dga-send\" type=\"submit\">Unlock results <span class=\"arr\">&rarr;</span></button>\n        </form>\n        <div class=\"err\" id=\"dga-err\" role=\"alert\"></div>\n        <small>No newsletter. We will only follow up if you ask us to.</small>\n      </div>\n    </div>\n\n    <div class=\"cta\" id=\"dga-post\" hidden>\n      <div>\n        <b>Want to go through this with someone?</b>\n        <span>Twenty minutes, no pitch.</span>\n      </div>\n      <button class=\"btn\" id=\"dga-book\">Book a call <span class=\"arr\">&rarr;</span></button>\n    </div>\n\n    <div class=\"nav\" style=\"margin-top:22px\">\n      <button class=\"btn ghost\" id=\"dga-again\">&larr; Start over</button><span></span>\n    </div>\n  </section>\n\n  </div>\n";

/* ---------- content: questions.js from digg-assessment, verbatim ---------- */
/* ---------------------------------------------------------------
   The Digg Agency — Growth Opportunity Assessment
   Content lives here. Everything else is presentation.
   Questions: Joselyne Walter. Layout and scoring: this build.
   --------------------------------------------------------------- */

const AREAS = [
  { key:'product',   label:'Product & Market Fit',          short:'Product' },
  { key:'customer',  label:'Customer & Market Focus',       short:'Customers' },
  { key:'sales',     label:'Sales Effectiveness',           short:'Sales' },
  { key:'marketing', label:'Marketing & Demand Generation', short:'Marketing' },
  { key:'growth',    label:'Growth Strategy & Execution',   short:'Growth' }
];

/* Scoring (Joselyne Walter, "Growth Opportunity Assessment – Scoring").
   Scored questions list answers A to D, best to worst: A = 0, B = 1, C = 2, D = 1.
   D is "don't know": it scores 1 so the area is worth a look, and it flags the
   area "Needs validation". It never counts as proof of poor performance.
   dk:false marks a question whose D is a real answer, not an unknown (Q7 "It’s adhoc").
   area:-1 questions are context only and are not scored. */
const POINTS = [0,1,2,1];
const LETTERS = ['A','B','C','D','E'];

/* Area score = sum of its two questions (0–4) */
function gapLabel(score){
  return score <= 1 ? 'Lower potential gap' : score === 2 ? 'Moderate potential gap' : 'Higher potential gap';
}

const QUESTIONS = [
  { area:-1, key:'revenue', q:'About how much revenue does your company make each year?', a:[
    'Under $5 million', '$5 million to $25 million', '$25 million to $100 million', 'Over $100 million', 'Prefer not to say' ]},

  { area:-1, key:'role', q:'What is your role at the company?', a:[
    'Owner / CEO / President', 'Sales / Business Development', 'Marketing / Product Management', 'Operations / General Management', 'Other' ]},

  { area:0, q:'How clearly can your team describe who your best-fit customer is?', a:[
    'We have defined segments, though sales & marketing does not always follow them',
    'We have a rough idea, but it is not written down',
    'We sell to whoever will buy',
    'Unsure' ]},

  { area:0, q:'Do you know which products bring the most profit and growth?', a:[
    'Yes, we track sales, profit, and demand by product.',
    'We know our best sellers, but not always which make the most profit.',
    'We focus more on sales than on profit by product.',
    'We don’t have enough information to know.' ]},

  { area:1, q:'Do you know which types of customers bring the most value to your business?', a:[
    'Yes, we know which customer groups are most profitable and have room to grow.',
    'We know our main customer groups, but haven’t compared their value.',
    'We pursue most sales opportunities, no matter the type of customer.',
    'We don’t have enough information to know.' ]},

  { area:1, q:'How does your sales team decide which customers to focus on?', a:[
    'We focus on customers with the best profit and growth potential.',
    'We have target customers, but often pursue other opportunities.',
    'Salespeople mostly decide which customers they want to pursue.',
    'I’m not sure how these decisions are made.' ]},

  { area:2, q:'How well does marketing support the people who sell for you, like distributors, dealers and reps?', dk:false, a:[
    'We give them materials, but do not know what gets used',
    'We send them logos and spec sheets',
    'They are mostly on their own',
    'It’s adhoc' ]},

  { area:2, q:'When you lose a sale, do you know why?', a:[
    'Yes, we gather feedback and use it to improve.',
    'We usually have an idea, but don’t always confirm it.',
    'We often assume it’s price or a competitor, but haven’t checked.',
    'We don’t have enough information to know.' ]},

  { area:3, q:'What is your website doing for the business right now?', a:[
    'It brings in inquiries we follow up manually',
    'It is current, but it does not generate anything',
    'It is a brochure that is a few years out of date',
    'Not sure' ]},

  { area:3, q:'Do your website and sales materials help customers understand why they should buy from you?', a:[
    'Yes, they clearly explain our products, value, and why we’re different.',
    'They explain our products, but don’t always answer buyers’ questions.',
    'They’re missing key information or don’t show why we’re different.',
    'We haven’t looked at them from a buyer’s point of view.' ]},

  { area:4, q:'How clear are your company’s top growth goals for the next 12 months?', a:[
    'We have a few clear goals based on market and business needs.',
    'We have growth goals, but they’re broad or compete for attention.',
    'We’re working on several growth ideas, and our priorities often change.',
    'I’m not sure how our growth goals are set.' ]},

  { area:4, q:'How well does your team turn growth plans into action?', a:[
    'Each goal has an owner, a clear plan, and a way to track progress.',
    'We make progress, but plans don’t always stay on track.',
    'Projects often stall or compete for time and resources.',
    'I’m not sure how plans are managed.' ]},

  { area:-1, key:'fix', type:'text', max:500, label:'Optional',
    q:'If you could fix one sales or growth problem in the next 90 days, what would it be?' }
];

/* Results copy: Joselyne Walter, verbatim. "head" is the result headline,
   "desc" the one-line area description shown under each bar. */
const RESULTS = {
  product: {
    head: 'Are your products positioned for profitable growth?',
    desc: 'How well your product offering aligns with customer needs, demand, and profitable growth.',
    body: [
      'Your responses suggest an opportunity to better understand how your product offering aligns with customer demand, purchasing decisions, and profitability.',
      'Even strong manufacturers can find themselves investing in products that sell well but contribute less to growth than expected, or overlooking opportunities to better serve existing markets.' ],
    stepsHead: 'Three practical next steps',
    steps: [
      'Review your top five products by revenue and compare their margins, demand trends, and customer concentration.',
      'Ask your sales team which product features, specifications, or pricing concerns most frequently influence buying decisions.',
      'Identify one product or product family worth investigating for improvement, repositioning, or expansion.' ],
    help: 'A focused product and market assessment can identify gaps between your product portfolio, customer demand, competitive alternatives, and commercial opportunities.'
  },
  customer: {
    head: 'Are you pursuing the customers most likely to drive profitable growth?',
    desc: 'How effectively your team identifies and prioritizes valuable customer segments.',
    body: [
      'Your responses suggest that sales efforts may be spread across customer segments without sufficient clarity about which opportunities create the most value.',
      'Not every customer is equally profitable, and not every market is worth pursuing. Growth becomes harder when sales resources are divided among too many opportunities.' ],
    stepsHead: 'Three practical next steps',
    steps: [
      'Group your existing customers by industry, application, channel, or buying behavior.',
      'Compare the groups based on revenue, gross margin, repeat purchases, and future potential.',
      'Identify one or two segments that deserve greater attention and test a more focused sales approach.' ],
    help: 'Customer segmentation, buyer research, and market prioritization can help your team focus resources on the opportunities with the strongest commercial potential.'
  },
  sales: {
    head: 'Where are sales opportunities losing momentum?',
    desc: 'How consistently qualified opportunities progress and how well you understand buying decisions.',
    body: [
      'Your responses suggest that qualified opportunities may not be progressing as consistently as they could, or that the reasons behind lost business aren’t fully understood.',
      'The issue may not be a lack of leads. It could involve product fit, customer expectations, pricing, buying complexity, or gaps in the sales process.' ],
    stepsHead: 'Three practical next steps',
    steps: [
      'Review your last ten meaningful sales opportunities, including wins, losses, and stalled deals.',
      'Identify the stage where opportunities most frequently stall and compare the reasons given by salespeople with actual buyer feedback.',
      'Select one recurring obstacle and test a specific change to your sales approach.' ],
    help: 'A sales effectiveness review can examine your sales process, buying journey, win/loss patterns, and opportunities to improve conversion.'
  },
  marketing: {
    head: 'Are you reaching the right customers?',
    desc: 'How effectively you reach qualified buyers and support their purchasing decisions.',
    body: [
      'Your answers suggest there may be ways to improve how you attract customers and help them choose your products.',
      'You may be spending time and money on sales and marketing without knowing which efforts work best. Or, potential customers may not have the information they need to make a buying decision.' ],
    stepsHead: 'Three practical next steps',
    steps: [
      '<b>Find out what’s working.</b> Look at your last 10 new sales opportunities. Where did they come from? Which ones were a good fit for your business?',
      '<b>Look at what customers see.</b> Review your website, product information, and sales materials. Can buyers easily find what they need? Is it clear why they should choose you?',
      '<b>Improve one thing.</b> Choose one sales or marketing effort to improve. Track whether it brings in more conversations with the right customers.' ],
    help: 'We help manufacturers identify which sales and marketing efforts are working, where opportunities may be missed, and what to improve first.'
  },
  growth: {
    head: 'Are your growth plans turning into action?',
    desc: 'How clearly growth priorities are defined, resourced, and put into action.',
    body: [
      'Your answers suggest there may be opportunities to improve how your company sets priorities and follows through on growth plans.',
      'You may have several good ideas but not enough time, people, or resources to work on all of them. Or, your team may be busy without making progress on the goals that matter most.' ],
    stepsHead: 'Three practical next steps',
    steps: [
      '<b>List your growth priorities.</b> Write down the main projects your company is working on to grow sales or enter new markets.',
      '<b>Choose what matters most.</b> Compare each project based on its potential value, cost, and the time and people needed.',
      '<b>Build a simple action plan.</b> Pick one priority. Assign an owner, set a goal for the next 30–90 days, and check progress regularly.' ],
    help: 'We help manufacturers choose where to focus, build practical growth plans, and turn those plans into clear actions with owners and measurable goals.'
  }
};

const NO_GAPS = 'No significant gaps identified from your responses.';
const DIRECTIONAL = 'All results are directional, not validated diagnoses or industry benchmarks.';

/* ---------- end of questions.js ---------- */

  function boot(root){
    var $=function(s){return root.querySelector(s)};
    var ans=new Array(QUESTIONS.length).fill(null), i=0;

    /* Height of anything pinned to the top of the viewport (the WP admin bar
       when logged in, or the site header if it is ever made sticky).
       data-offset="80" on the container overrides the detection. */
    function topOffset(){
      var o=parseInt(root.getAttribute('data-offset'),10);
      if(!isNaN(o)) return o;
      var max=0, els=document.querySelectorAll('#wpadminbar, .elementor-location-header, .elementor-location-header > *, .elementor-sticky--active, #site-header');
      for(var k=0;k<els.length;k++){
        var cs=window.getComputedStyle(els[k]);
        if(cs.position!=='fixed' && cs.position!=='sticky') continue;
        var r=els[k].getBoundingClientRect();
        if(r.top<=1 && r.bottom>max && r.height<window.innerHeight/2) max=r.bottom;
      }
      return max;
    }

    /* Inside a host page: only move when the card's top has scrolled out of
       view, and then bring the card (not the header area above it) back. */
    function reveal(){
      var card=$('.shell'), off=topOffset(), top=card.getBoundingClientRect().top;
      if(top < off){
        var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({top:Math.max(0, window.pageYOffset + top - off - 16), behavior:reduce?'auto':'smooth'});
      }
    }

    function show(id){
      root.querySelectorAll('.screen').forEach(function(s){s.classList.remove('on')});
      $(id).classList.add('on');
      reveal();
    }

    function steps(){
      var wrap=$('#dga-steps'); wrap.innerHTML='';
      AREAS.forEach(function(a,n){
        var qs=QUESTIONS.map(function(q,ix){return q.area===n?ix:-1}).filter(function(x){return x>-1});
        var done=qs.filter(function(ix){return ans[ix]!==null}).length;
        var cur=QUESTIONS[i].area===n;
        var d=document.createElement('div');
        d.className='step'+(cur?' now':'')+(done===qs.length&&!cur?' done':'');
        d.innerHTML='<div class="ln"><i style="width:'+Math.round(done/qs.length*100)+'%"></i></div><span>'+a.short+'</span>';
        wrap.appendChild(d);
      });
    }

    /* Light update on pick: no re-render, so nothing re-animates and the
       option keeps focus for keyboard users. */
    function select(n){
      ans[i]=n;
      var list=$('#dga-opts').querySelectorAll('.opt');
      for(var k=0;k<list.length;k++) list[k].setAttribute('aria-checked', k===n?'true':'false');
      $('#dga-next').disabled=false;
      steps();
    }

    function paint(dir){
      var q=QUESTIONS[i];
      $('#dga-qnum').textContent=String(i+1).padStart(2,'0');
      $('#dga-qof').textContent='of '+QUESTIONS.length+'  ·  '+(q.area>-1?AREAS[q.area].label:(q.type==='text'?q.label:'About your company'));
      $('#dga-qtext').textContent=q.q;
      var ul=$('#dga-opts'); ul.innerHTML='';
      (q.type==='text'?[]:q.a).forEach(function(t,n){
        var li=document.createElement('li');
        li.style.setProperty('--i', n);
        var b=document.createElement('button');
        b.className='opt'; b.type='button'; b.setAttribute('role','radio');
        b.setAttribute('aria-checked', ans[i]===n?'true':'false');
        b.innerHTML='<span class="dot"></span><span></span>'; b.lastChild.textContent=t;
        b.onclick=function(){ select(n) };
        li.appendChild(b); ul.appendChild(li);
      });
      if(q.type==='text'){
        var li=document.createElement('li');
        li.innerHTML='<textarea class="fixbox" id="dga-fix" maxlength="'+q.max+'" placeholder="Type your answer (optional)" aria-label="Optional answer"></textarea><div class="fixcount" id="dga-fixcount">0/'+q.max+'</div>';
        ul.appendChild(li);
        var ta=li.querySelector('textarea'); ta.value=ans[i]||'';
        var upd=function(){ ans[i]=ta.value; $('#dga-fixcount').textContent=ta.value.length+'/'+q.max };
        ta.addEventListener('input',upd); upd();
        $('#dga-next').disabled=false;
      } else {
        $('#dga-next').disabled = ans[i]===null;
      }
      $('#dga-next').innerHTML = (i===QUESTIONS.length-1?'See my results':'Next')+' <span class="arr">&rarr;</span>';
      $('#dga-back').style.visibility = i===0?'hidden':'visible';
      steps();
      var c=$('#dga-s-q');
      if(dir){
        c.classList.remove('anim','rev');
        void c.offsetWidth;                      /* restart the animations */
        c.classList.add('anim');
        if(dir<0) c.classList.add('rev');
        reveal();                                /* Next/Back from low on a long question: back to the card */
      } else {
        c.classList.remove('anim','rev');
      }
    }

    var last = {};

    function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}) }

    /* Her scoring: area = sum of its two answers (0–4). A D answer flags the area
       "Needs validation" unless the question marks its D as a real answer (dk:false). */
    function score(){
      var per=AREAS.map(function(){return {score:0,dk:false,dkPts:0}});
      QUESTIONS.forEach(function(q,n){
        if(q.area<0) return;
        var p=POINTS[ans[n]], unknown=(ans[n]===3 && q.dk!==false);
        per[q.area].score+=p;
        if(unknown){ per[q.area].dk=true; per[q.area].dkPts+=p }
      });
      var hi=Math.max.apply(null,per.map(function(p){return p.score}));
      var first = hi>0 ? per.map(function(p,n){return p.score===hi?n:-1}).filter(function(n){return n>-1}) : [];
      /* "mainly from unknowns": at least half the area's points come from don't-know answers */
      per.forEach(function(p){ p.label=gapLabel(p.score); p.mostlyUnknown = p.score>0 && p.dkPts*2>=p.score });
      return { per:per, first:first };
    }

    function results(){
      last = score();
      buildBars();
      buildRec();
      show('#dga-s-res');
    }

    function buildBars(){
      var per=last.per, first=last.first;
      var bars=$('#dga-bars');
      bars.innerHTML='<div class="hd"><span>By area</span><span>Potential gap</span></div>';
      AREAS.forEach(function(a,n){
        var p=per[n], lv=p.score<=1?'lo':p.score===2?'mid':'hi';
        var d=document.createElement('div');
        d.className='bar lv-'+lv+(first.indexOf(n)>-1?' first':'')+(p.dk?' flagged':'');
        d.innerHTML='<div class="top"><b>'+esc(a.label)+'</b>'+
          '<span class="rt"><span class="lvl">'+p.label+'</span><span class="chk">Needs validation</span></span></div>'+
          '<div class="segs" role="img" aria-label="'+p.label+', '+p.score+' of 4"><i></i><i></i><i></i><i></i></div>'+
          '<div class="note">'+esc(RESULTS[a.key].desc)+'</div>';
        bars.appendChild(d);
      });
      var any=per.some(function(p){return p.dk});
      var foot=document.createElement('p');
      foot.className='bars-note';
      foot.innerHTML=(any?'<span class="chk">Needs validation</span> means the area includes a “not sure” answer. Treat it as something to check, not a confirmed gap. ':'')+esc(DIRECTIONAL);
      bars.appendChild(foot);
    }

    function buildRec(){
      var rec=$('#dga-rec'), first=last.first;
      var html='<div class="eyebrow">We recommend the first area to investigate</div>';
      if(!first.length){
        html+='<p class="nogaps">'+esc(NO_GAPS)+'</p>';
      } else {
        first.forEach(function(n){
          var a=AREAS[n], r=RESULTS[a.key], p=last.per[n];
          html+='<article class="pick">'+
            '<div class="pick-area"><span>'+esc(a.label)+'</span><span class="lvl">'+p.label+'</span>'+(p.dk?'<span class="chk">Needs validation</span>':'')+'</div>'+
            '<h3>'+esc(r.head)+'</h3>'+
            (p.mostlyUnknown?'<p class="more">More information is needed. Much of this result comes from “not sure” answers, so it shows what to check first, not a confirmed gap.</p>':'')+
            r.body.map(function(t){return '<p>'+esc(t)+'</p>'}).join('')+
            '<h4>'+esc(r.stepsHead)+'</h4><ol>'+r.steps.map(function(t){return '<li>'+t+'</li>'}).join('')+'</ol>'+
            '<h4>How we can help</h4><p>'+esc(r.help)+'</p>'+
          '</article>';
        });
      }
      rec.innerHTML=html;
    }

    function drawBars(){
      $('#dga-bars').querySelectorAll('.bar').forEach(function(bar,n){
        var segs=bar.querySelectorAll('.segs i'), s=last.per[n].score;
        for(var k=0;k<s;k++) (function(el,delay){ setTimeout(function(){ el.classList.add('on') },delay) })(segs[k],120+n*110+k*70);
      });
    }

    $('#dga-start').onclick=function(){ show('#dga-s-q'); paint(1) };
    $('#dga-next').onclick=function(){ i<QUESTIONS.length-1 ? (i++,paint(1)) : results() };
    $('#dga-back').onclick=function(){ if(i>0){ i--; paint(-1) } };
    $('#dga-again').onclick=function(){
      ans=new Array(QUESTIONS.length).fill(null); i=0;
      $('#dga-vault').classList.remove('open'); $('#dga-gate').style.display=''; $('#dga-post').hidden=true;
      $('#dga-confirm').hidden=true; sent++;
      $('#dga-mail').value=''; $('#dga-hp').value=''; $('#dga-mail').classList.remove('bad'); $('#dga-err').textContent='';
      var b=$('#dga-send'); b.disabled=false; b.innerHTML='Unlock results <span class="arr">&rarr;</span>';
      show('#dga-s-intro');
    };
    var FREE = /@(gmail|yahoo|hotmail|outlook|icloud|aol|proton(mail)?|live|msn)\./i;

    $('#dga-emailwrap').addEventListener('submit', function(e){
      e.preventDefault();
      var el=$('#dga-mail'), v=el.value.trim(), err=$('#dga-err');
      el.classList.remove('bad'); err.textContent='';

      if(!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)){
        el.classList.add('bad'); el.focus(); err.textContent='That does not look like a valid email.'; return;
      }
      if(FREE.test(v)){
        el.classList.add('bad'); el.focus(); err.textContent='Please use your work email so we can tailor the results.'; return;
      }

      var btn=$('#dga-send'); btn.disabled=true; btn.innerHTML='Unlocking\u2026';
      var c=$('#dga-confirm'); c.classList.remove('fail');
      c.querySelector('span').innerHTML='A copy is on its way to <b id="dga-confirmmail"></b>.';
      $('#dga-confirmmail').textContent=v;
      c.hidden=false;
      deliver(v, payload());
      unlock();
    });

    /* Lead record: each original letter is kept separately from its points. */
    function payload(){
      var pick=function(n){ return ans[n]===null ? null : { letter:LETTERS[ans[n]], answer:QUESTIONS[n].a[ans[n]] } };
      return {
        email: null,
        assessment: 'Your Sales & Marketing Growth Gap – Assessment',
        company: { revenue:pick(0), role:pick(1) },
        fixIn90Days: (ans[QUESTIONS.length-1]||'').trim()||null,
        answers: QUESTIONS.map(function(q,n){
          if(q.area<0) return null;
          var unknown = ans[n]===3 && q.dk!==false;
          return { q:'Q'+(n+1), area:AREAS[q.area].label, question:q.q,
                   letter:LETTERS[ans[n]], answer:q.a[ans[n]], points:POINTS[ans[n]], unknown:unknown };
        }).filter(Boolean),
        areas: AREAS.map(function(a,n){ var p=last.per[n];
          return { area:a.label, score:p.score, max:4, label:p.label, needsValidation:p.dk, mostlyUnknown:p.mostlyUnknown } }),
        firstToInvestigate: last.first.map(function(n){ return AREAS[n].label }),
        noSignificantGaps: last.first.length===0,
        completedAt: new Date().toISOString(),
        website: $('#dga-hp').value,                /* honeypot: people never see it */
        page: location.href.slice(0,300),
        source: 'embed v1.0.1'
      };
    }

    /* Never blocks the visitor: results unlock at once. If the email copy can't be
       sent, the confirmation line says so instead of promising it. */
    var sent=0;
    function deliver(email, data){
      data.email = email;
      if(!ENDPOINT){ console.log('[assessment] demo mode \u2014 would POST:', data); return }
      var mine=++sent;
      fetch(ENDPOINT,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data), keepalive:true })
        .then(function(r){ if(!r.ok) throw new Error(r.status) })
        .catch(function(){
          if(mine!==sent) return;                  /* Start over was pressed meanwhile */
          var c=$('#dga-confirm'); c.classList.add('fail');
          c.querySelector('span').textContent='We couldn\u2019t send the email copy just now. Your results are below.';
        });
    }

    function unlock(){
      $('#dga-vault').classList.add('open');
      $('#dga-post').hidden=false;
      drawBars();
      setTimeout(function(){
        $('#dga-emailwrap') && ($('#dga-gate').style.display='none');
        $('#dga-post').scrollIntoView({behavior:'smooth',block:'nearest'});
      },700);
    }
    $('#dga-book').onclick=function(){
      if(BOOK_URL){ window.location.href=BOOK_URL } else { alert('Demo only — this would open the booking link.') }
    };
  }

  /* ---------- mount ---------- */
  function init(){
    var root=document.getElementById('digg-assessment');
    if(!root || root.getAttribute('data-ready')) return;   /* Elementor's editor can run this twice */
    root.setAttribute('data-ready','1');
    if(!document.getElementById('digg-assessment-css')){
      var st=document.createElement('style');
      st.id='digg-assessment-css';
      st.textContent=CSS;
      (document.head||document.documentElement).appendChild(st);
    }
    root.innerHTML=HTML;
    boot(root);
  }
  if(document.getElementById('digg-assessment') || document.readyState!=='loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
