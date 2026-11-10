"""End-to-end checks for the embed, run against a saved copy of her live page.

    python3 -I test/run_tests.py <embed-base-url> <production-base-url> <screenshot-dir>

  embed-base-url       serves test/fixture/ (assessment.html, control.html, dist/)
  production-base-url  serves the digg-assessment repo root (digg-site-with-assessment.html)

Chromium at 1440x900, WebKit (closest to iOS Safari) at 390x844 with touch.
Exit code 1 on any failure."""
import json, random, sys, time
from playwright.sync_api import sync_playwright

EMB, PROD, SHOTS = sys.argv[1].rstrip('/'), sys.argv[2].rstrip('/'), sys.argv[3]
FAILS, PASSES = [], []

def check(cond, msg):
    (PASSES if cond else FAILS).append(msg)
    print(('  PASS ' if cond else '  FAIL ') + msg)

# 13 questions: Q1-Q2 context (5 options), Q3-Q12 scored (A-D), Q13 free text
PATHS = {
    'P1_all_A':  ([0, 0] + [0] * 10, ''),
    'P2_all_D':  ([3, 3] + [3] * 10, ''),
    # Sales Q7=D ("It's adhoc", a real answer: 1 pt, not unknown) + Q8=C (2) = 3, everything else <= 2
    'P3_mixed':  ([1, 2] + [1, 0,  0, 1,  3, 2,  1, 1,  0, 0], 'Our dealers do not use the materials we send.'),
    # Marketing 2+1 = 3 and Growth 1+2 = 3 tie for highest; others <= 1
    'P4_tie':    ([2, 0] + [1, 0,  0, 1,  0, 1,  2, 1,  1, 2], 'Too many priorities at once.'),
}

import re, os
BOOK_URL = re.search(r"var BOOK_URL = '([^']+)'", open(os.path.join(os.path.dirname(__file__), '..', 'src', 'app.js')).read()).group(1)
CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
_CACHE = {}

def her_site(route):
    """Her assets, fetched once with a normal browser UA (her host returns 406 to headless
    UAs) and given CORS headers, so the localhost copy sees her CSS and fonts as her page does."""
    url = route.request.url
    try:
        if url not in _CACHE:
            r = route.fetch(headers={'user-agent': CHROME_UA})
            h = {k: v for k, v in r.headers.items() if k.lower() not in ('content-encoding', 'content-length', 'transfer-encoding')}
            h['access-control-allow-origin'] = '*'
            _CACHE[url] = (r.status, h, r.body())
        st, h, body = _CACHE[url]
        route.fulfill(status=st, headers=h, body=body)
    except Exception:
        pass   # the test closed the page while this request was in flight

BLOCK = ('google-analytics.com', 'googletagmanager.com', 'analytics.google.com', 'doubleclick.net', 'stats.wp.com')

def new_page(browser, mobile):
    if mobile:
        ctx = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3,
                                  is_mobile=True, has_touch=True,
                                  user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1')
    else:
        ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
    ctx.route('**/*', lambda r: r.abort() if any(b in r.request.url for b in BLOCK) else r.continue_())
    ctx.route('https://www.thediggagency.com/**', her_site)
    ctx.route(BOOK_URL.split('?')[0].rstrip('/') + '**', lambda r: r.fulfill(status=200, content_type='text/html', body='<title>booking stub</title>booking'))
    page = ctx.new_page()
    page._errors, page._payloads, page._lead = [], [], {'status': 200, 'origins': []}
    def lead_api(route):
        # Stands in for /api/lead (embed: digg-assessment.pages.dev, production: same origin).
        if route.request.method == 'POST':
            page._payloads.append(json.loads(route.request.post_data))
            page._lead['origins'].append(route.request.headers.get('origin'))
        st = page._lead['status']
        route.fulfill(status=st, content_type='application/json', headers={'access-control-allow-origin': '*'},
                      body='{"ok":true}' if st == 200 else '{"error":"send"}')
    ctx.route('**/api/lead', lead_api)
    page.on('pageerror', lambda e: page._errors.append('pageerror: ' + str(e)))
    def on_console(m):
        if m.type == 'error':
            page._errors.append('console: ' + m.text)
        if m.text.startswith('[assessment] demo mode'):
            page._payloads.append(m.args[1].json_value())
    page.on('console', on_console)
    return ctx, page

def no_sideways(page):
    return page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth')

def open_embed(page, fixture='assessment.html'):
    page.goto('about:blank')
    page.goto(EMB + '/' + fixture, wait_until='load')
    page.wait_for_selector('#digg-assessment #dga-start')

def open_prod(page):
    page.goto('about:blank')
    page.goto(PROD + '/digg-site-with-assessment.html#assessment', wait_until='load')
    page.wait_for_selector('#view-assessment:not([hidden]) #start')

def answer_all(page, P, answers, text, shot=None):
    page.click(f'#{P}start')
    for qi in range(13):
        page.wait_for_selector(f'#{P}qnum:text-is("{qi+1:02d}")')
        if qi == 12:
            page.fill(f'#{P}fix', text)
            if shot: page.screenshot(path=shot + '-q13-text.png')
        else:
            page.locator(f'#{P}opts .opt').nth(answers[qi]).click()
            if shot and qi == 2: page.screenshot(path=shot + '-q3.png')
        page.click(f'#{P}next')
    page.wait_for_selector(f'#{P}s-res.on')

def submit_email(page, P, email):
    page.fill(f'#{P}mail', email)
    page.click(f'#{P}send')

def strip(p):
    # page and source differ by design (embed vs demo site); everything else must match
    p = dict(p)
    for k in ('completedAt', 'page', 'source'): p.pop(k, None)
    return p

STYLE_PROPS = ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color',
               'background-color', 'padding-top', 'padding-left', 'border-top-width', 'border-top-color',
               'border-radius', 'text-transform', 'width']

def styles(page, root, sels):
    return page.evaluate('''([root, sels, props]) => {
        const out = {}; const r = document.querySelector(root);
        for (const s of sels) { const el = r.querySelector(s); if (!el) { out[s] = null; continue; }
            const cs = getComputedStyle(el); out[s] = Object.fromEntries(props.map(p => [p, cs.getPropertyValue(p)])); }
        return out; }''', [root, sels, STYLE_PROPS])

def compare_styles(a, b, label):
    bad = []
    for sel, bsel in zip(list(a), list(b)):
        if a[sel] is None or b[bsel] is None:
            bad.append(f'{sel}: missing'); continue
        for p in STYLE_PROPS:
            if a[sel][p] != b[bsel][p]:
                bad.append(f'{sel} {p}: prod {a[sel][p]} / embed {b[bsel][p]}')
    check(not bad, f'{label}: computed styles match production' + ('' if not bad else ' -> ' + '; '.join(bad[:6])))

def run_device(pw, name, browser, mobile):
    print(f'\n=== {name} ===')
    tag = name.replace(' ', '_')

    # ---------- 1. host page untouched (control vs assessment) ----------
    snap_js = '''() => {
      const props = ['font-family','font-size','font-weight','line-height','color','background-color','display','position','margin-top','padding-top','z-index'];
      const roots = [document.querySelector('.elementor-location-header'), document.querySelector('.elementor-location-footer')];
      const out = {body: Object.fromEntries(props.map(p => [p, getComputedStyle(document.body).getPropertyValue(p)])),
                   html: Object.fromEntries(props.map(p => [p, getComputedStyle(document.documentElement).getPropertyValue(p)]))};
      roots.forEach((r, ri) => { const rb = r.getBoundingClientRect();
        [r, ...r.querySelectorAll('*')].forEach((el, i) => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
          const box = (b.width || b.height) ? [Math.round(b.x), Math.round(b.y - rb.y), Math.round(b.width), Math.round(b.height)] : ['not rendered'];
          out[ri + ':' + i + ':' + el.tagName] = [...box,
            ...props.map(p => cs.getPropertyValue(p))].join('|'); }); });
      return out; }'''
    ctx, pc = new_page(browser, mobile); pc.goto(EMB + '/control.html', wait_until='load'); pc.wait_for_timeout(1200)
    control = pc.evaluate(snap_js); control_errors = list(pc._errors); ctx.close()
    ctx, pe = new_page(browser, mobile); open_embed(pe); pe.wait_for_timeout(1200)
    withemb = pe.evaluate(snap_js)
    diffs = [k for k in control if control[k] != withemb.get(k)]
    check(len(control) > 50 and not diffs, f'host header/footer/body unchanged ({len(control)} elements compared)' + ('' if not diffs else f' -> {len(diffs)} differ, e.g. {diffs[:3]} {[control[d] for d in diffs[:1]]} vs {[withemb.get(d) for d in diffs[:1]]}'))
    check(pe.evaluate('document.querySelectorAll("style#digg-assessment-css").length') == 1, 'one injected stylesheet')
    fonts = pe.evaluate('''() => document.fonts.ready.then(() => [document.fonts.check('700 20px Montserrat'), document.fonts.check('400 16px "Open Sans"'),
                         getComputedStyle(document.querySelector('#digg-assessment h1')).fontFamily])''')
    check(fonts[0] and fonts[1], f'Montserrat and Open Sans loaded from her site ({fonts[2]})')
    # header readable: the band is behind the header
    band = pe.evaluate('''() => { const h = document.querySelector('.elementor-location-header').getBoundingClientRect();
        const r = document.querySelector('#digg-assessment').getBoundingClientRect();
        const bg = getComputedStyle(document.querySelector('#digg-assessment'), '::before').backgroundImage;
        return [Math.round(r.top), Math.round(h.bottom), bg.slice(0, 40), Math.round(r.left), Math.round(r.width), innerWidth]; }''')
    check(band[0] <= 2 and 'gradient' in band[2], f'purple band starts under the header (embed top {band[0]}px, header bottom {band[1]}px)')
    check(band[3] == 0 and abs(band[4] - pe.evaluate('document.documentElement.clientWidth')) <= 1, f'container is full width ({band[4]}px)')
    pe.screenshot(path=f'{SHOTS}/{tag}-1-intro.png')
    check(no_sideways(pe), 'no sideways scroll: intro')
    # v1.0.1 layout: no top rail, no viewport min-height, 80px (48px on phones) under the card
    lay = pe.evaluate('''() => { const r = document.querySelector('#digg-assessment'), cs = getComputedStyle(r);
        const f = document.querySelector('.elementor-location-footer').getBoundingClientRect();
        return [!!document.querySelector('#dga-rail'), cs.minHeight, cs.paddingBottom, Math.round(f.top - r.getBoundingClientRect().bottom)]; }''')
    want_pb = '48px' if mobile else '80px'
    check(lay[0] is False, 'no progress rail in the page')
    check(lay[1] in ('0px', 'auto') and lay[2] == want_pb, f'container min-height {lay[1]}, padding-bottom {lay[2]} (want 0 and {want_pb})')
    check(lay[3] == 0, f'footer follows the assessment directly (gap {lay[3]}px)')
    hp = pe.evaluate('''() => { const h = document.querySelector('#dga-hp'), b = h.getBoundingClientRect();
        return [h.tabIndex, h.getAttribute('aria-hidden'), getComputedStyle(h).position, b.right <= 0 || getComputedStyle(h).opacity === '0']; }''')
    check(hp == [-1, 'true', 'absolute', True], f'honeypot is off-screen, unfocusable and hidden from screen readers {hp}')

    # ---------- 2. scroll behaviour ----------
    y0 = pe.evaluate('scrollY'); pe.click('#dga-start'); pe.wait_for_timeout(900)
    check(pe.evaluate('scrollY') == y0, f'Start does not jump the page (scrollY {y0} -> {pe.evaluate("scrollY")})')
    pe.locator('#dga-opts .opt').nth(0).click()
    pe.evaluate('window.scrollTo(0, document.querySelector("#digg-assessment .shell").getBoundingClientRect().top + scrollY + 260)')
    pe.wait_for_timeout(300)
    pe.evaluate('document.querySelector("#dga-next").click()'); pe.wait_for_timeout(1400)
    top = pe.evaluate('Math.round(document.querySelector("#digg-assessment .shell").getBoundingClientRect().top)')
    check(12 <= top <= 20, f'Next while scrolled down lands the card 16px from the top (got {top}px)')
    # with a fixed admin bar the card clears it
    pe.evaluate('''() => { const b = document.createElement('div'); b.id = 'wpadminbar';
        b.style.cssText = 'position:fixed;top:0;left:0;right:0;height:32px;background:#1d2327;z-index:99999'; document.body.appendChild(b); }''')
    pe.locator('#dga-opts .opt').nth(1).click()
    pe.evaluate('window.scrollTo(0, document.querySelector("#digg-assessment .shell").getBoundingClientRect().top + scrollY + 260)')
    pe.wait_for_timeout(300)
    pe.evaluate('document.querySelector("#dga-next").click()'); pe.wait_for_timeout(1400)
    top = pe.evaluate('Math.round(document.querySelector("#digg-assessment .shell").getBoundingClientRect().top)')
    check(44 <= top <= 52, f'with a fixed 32px admin bar the card lands at 48px (got {top}px)')
    pe.evaluate('document.getElementById("wpadminbar").remove()')
    pe.screenshot(path=f'{SHOTS}/{tag}-2-question.png')
    check(no_sideways(pe), 'no sideways scroll: question')
    emb_errors = list(pe._errors); ctx.close()

    # ---------- 3. paths, against production ----------
    results_text = {}
    for pname, (answers, text) in PATHS.items():
        ctx, pe = new_page(browser, mobile); open_embed(pe)
        shot = f'{SHOTS}/{tag}-{pname}' if pname == 'P3_mixed' else None
        answer_all(pe, 'dga-', answers, text, shot)
        check(no_sideways(pe), f'{pname}: no sideways scroll on locked results')
        locked = pe.evaluate('[getComputedStyle(document.querySelector("#dga-gate")).display, getComputedStyle(document.querySelector("#dga-locked")).filter]')
        check(locked[0] != 'none' and 'blur' in locked[1], f'{pname}: results blurred behind the gate')
        if pname == 'P3_mixed':
            pe.wait_for_timeout(900)   # let the results screen finish its fade-in
            pe.screenshot(path=f'{SHOTS}/{tag}-3-gate.png')
            gate_z = pe.evaluate('[getComputedStyle(document.querySelector("#dga-gate")).zIndex, getComputedStyle(document.querySelector("#digg-assessment")).isolation]')
            check(gate_z == ['5', 'isolate'], f'gate keeps the low local stacking order (z-index {gate_z[0]}, container {gate_z[1]})')
            # email gate validation
            submit_email(pe, 'dga-', 'not-an-email')
            check(pe.text_content('#dga-err') == 'That does not look like a valid email.', 'gate: malformed email rejected')
            submit_email(pe, 'dga-', 'someone@gmail.com')
            check(pe.text_content('#dga-err') == 'Please use your work email so we can tailor the results.', 'gate: gmail rejected')
            check(not pe._payloads, 'gate: nothing delivered before a valid email')
            fs = pe.evaluate('[getComputedStyle(document.querySelector("#dga-mail")).fontSize, matchMedia("(hover:hover)").matches]')
            want = '16px' if mobile else '14.5px'
            check(fs[0] == want, f'email field font-size {fs[0]} (want {want}; hover:hover={fs[1]})')
        submit_email(pe, 'dga-', 'jane.doe@acme-manufacturing.com')
        pe.wait_for_timeout(1500)
        state = pe.evaluate('''() => ({gate: getComputedStyle(document.querySelector('#dga-gate')).display,
            post: !document.querySelector('#dga-post').hidden, confirm: document.querySelector('#dga-confirm').hidden ? '' : document.querySelector('#dga-confirm').innerText,
            picks: document.querySelectorAll('#dga-rec .pick').length, first: document.querySelectorAll('#dga-bars .bar.first').length,
            flagged: document.querySelectorAll('#dga-bars .bar.flagged').length, more: document.querySelectorAll('#dga-rec .more').length,
            nogaps: !!document.querySelector('#dga-rec .nogaps'), segs: document.querySelectorAll('#dga-bars .segs i.on').length,
            areas: [...document.querySelectorAll('#dga-rec .pick-area > span:first-child')].map(e => e.textContent),
            bars: document.querySelector('#dga-bars').innerText, rec: document.querySelector('#dga-rec').innerText})''')
        check(state['gate'] == 'none' and state['post'] and 'jane.doe@acme-manufacturing.com' in state['confirm'], f'{pname}: unlocked, confirmation shown, CTA visible')
        check(len(pe._payloads) == 1, f'{pname}: one lead POSTed to /api/lead')
        p = pe._payloads[0] if pe._payloads else {}
        check(p.get('source') == 'embed v1.0.1' and str(p.get('page', '')).startswith(EMB) and p.get('website') == ''
              and pe._lead['origins'] == [EMB], f'{pname}: payload has source, page, empty honeypot; sent with Origin {pe._lead["origins"]}')
        exp = {
            'P1_all_A': lambda s: s['picks'] == 0 and s['nogaps'] and s['flagged'] == 0 and s['segs'] == 0,
            'P2_all_D': lambda s: s['picks'] == 5 and s['first'] == 5 and s['flagged'] == 5 and s['more'] == 5 and s['segs'] == 10,
            'P3_mixed': lambda s: s['picks'] == 1 and s['areas'] == ['Sales Effectiveness'] and s['flagged'] == 0,
            'P4_tie':   lambda s: s['picks'] == 2 and s['first'] == 2 and s['areas'] == ['Marketing & Demand Generation', 'Growth Strategy & Execution'],
        }[pname]
        check(exp(state), f'{pname}: expected result ({state["picks"]} picks {state["areas"]}, {state["flagged"]} flagged, {state["more"]} "more info", nogaps={state["nogaps"]})')
        if pname == 'P3_mixed':
            q7 = [a for a in p.get('answers', []) if a['q'] == 'Q7']
            check(q7 and q7[0]['letter'] == 'D' and q7[0]['unknown'] is False, 'P3: Q7 "It’s adhoc" scored as a real answer, not unknown')
            check(p.get('fixIn90Days') == text, 'P3: free-text answer in the payload')
            emb_style = {}
            emb_style['res'] = styles(pe, '#digg-assessment', ['.pick h3', '.pick p', '.pick h4', '.bar .top b', '.bar .lvl', '.cta b', '.btn', '.confirm'])
            pe.screenshot(path=f'{SHOTS}/{tag}-4-results.png', full_page=True)
            check(no_sideways(pe), 'no sideways scroll: unlocked results')
            # Book a call -> booking page in a new tab; the assessment stays put
            before = pe.url
            with pe.expect_popup() as pop:
                pe.click('#dga-book')
            tab = pop.value; tab.wait_for_load_state()
            check(tab.url.startswith(BOOK_URL.split('?')[0]) and pe.url == before and tab.evaluate('window.opener') is None,
                  f'Book a call opens {tab.url} in a new tab (noopener), page unchanged')
            tab.close()
        if pname == 'P4_tie':
            pe.click('#dga-again'); pe.wait_for_timeout(500)
            reset = pe.evaluate('''() => [document.querySelector('#dga-s-intro').classList.contains('on'), document.querySelector('#dga-mail').value,
                                       document.querySelector('#dga-gate').style.display, document.querySelector('#dga-post').hidden]''')
            pe.click('#dga-start'); pe.wait_for_timeout(300)
            reset += pe.evaluate('[document.querySelector("#dga-next").disabled, document.querySelectorAll("#dga-opts .opt[aria-checked=true]").length]')
            check(reset == [True, '', '', True, True, 0], f'Start over resets everything {reset}')
        emb_errors += pe._errors; ctx.close()

        # production, same clicks
        ctx, pp = new_page(browser, mobile); open_prod(pp)
        answer_all(pp, '', answers, text)
        submit_email(pp, '', 'jane.doe@acme-manufacturing.com'); pp.wait_for_timeout(1500)
        prod_txt = pp.evaluate('[document.querySelector("#bars").innerText, document.querySelector("#rec").innerText]')
        check(pp._payloads and strip(pp._payloads[0]) == strip(p), f'{pname}: payload identical to production')
        check(prod_txt == [state['bars'], state['rec']], f'{pname}: results text identical to production')
        if pname == 'P3_mixed':
            compare_styles(styles(pp, '#view-assessment', ['.pick h3', '.pick p', '.pick h4', '.bar .top b', '.bar .lvl', '.cta b', '.btn', '.confirm']), emb_style['res'], 'results screen')
            fs = pp.evaluate('getComputedStyle(document.querySelector("#mail")).fontSize')
            check(fs == ('16px' if mobile else '14.5px'), f'production email field font-size {fs}')
        ctx.close()

    # ---------- 3b. email copy could not be sent ----------
    ctx, pe = new_page(browser, mobile); open_embed(pe)
    answer_all(pe, 'dga-', PATHS['P3_mixed'][0], '')
    pe._lead['status'] = 502
    submit_email(pe, 'dga-', 'jane.doe@acme-manufacturing.com'); pe.wait_for_timeout(1500)
    st = pe.evaluate('''() => { const c = document.querySelector('#dga-confirm');
        return [c.innerText, c.classList.contains('fail'), getComputedStyle(c.querySelector('svg')).display,
                getComputedStyle(document.querySelector('#dga-gate')).display]; }''')
    check(st[0] == 'We couldn’t send the email copy just now. Your results are below.' and st[1] and st[2] == 'none' and st[3] == 'none',
          f'send failure: results still unlock, line says the copy was not sent ({st[0]!r})')
    if not mobile: pe.screenshot(path=f'{SHOTS}/{tag}-5-send-failed.png')
    pe._lead['status'] = 200
    pe.click('#dga-again'); answer_all(pe, 'dga-', PATHS['P1_all_A'][0], '')
    submit_email(pe, 'dga-', 'ops@acme-manufacturing.com'); pe.wait_for_timeout(1200)
    st = pe.evaluate('[document.querySelector("#dga-confirm").innerText, document.querySelector("#dga-confirm").classList.contains("fail")]')
    check(st == ['A copy is on its way to ops@acme-manufacturing.com.', False], f'after Start over a good send shows the normal line {st}')
    emb_errors += [e for e in pe._errors if '502' not in e]; ctx.close()

    # ---------- 3c. her current widget CSS (!important overrides) still in place ----------
    ctx, pe = new_page(browser, mobile); open_embed(pe, 'assessment-override.html'); pe.wait_for_timeout(800)
    lay = pe.evaluate('''() => { const r = document.querySelector('#digg-assessment'), cs = getComputedStyle(r);
        return [!!document.querySelector('#dga-rail'), cs.minHeight, cs.paddingBottom]; }''')
    check(lay[0] is False and lay[1] in ('0px', 'auto') and lay[2] == want_pb, f'with her !important widget CSS: no rail, min-height {lay[1]}, padding-bottom {lay[2]}')
    answer_all(pe, 'dga-', PATHS['P3_mixed'][0], ''); submit_email(pe, 'dga-', 'jane.doe@acme-manufacturing.com'); pe.wait_for_timeout(1500)
    check(len(pe._payloads) == 1 and not pe.evaluate('document.querySelector("#dga-confirm").classList.contains("fail")'), 'with her widget CSS: lead sent, results unlocked')
    pe.screenshot(path=f'{SHOTS}/{tag}-6-override-results.png', full_page=True)
    check(no_sideways(pe), 'with her widget CSS: no sideways scroll')
    emb_errors += pe._errors; ctx.close()

    # ---------- 4. intro/question/gate styles vs production ----------
    ctx, pe = new_page(browser, mobile); open_embed(pe)
    ctx2, pp = new_page(browser, mobile); open_prod(pp)
    intro_sel = ['.card', 'h1', 'p.lede', '.meta b', '.meta div', '#{}start', '.eyebrow']
    compare_styles(styles(pp, '#view-assessment', [s.format('') for s in intro_sel]),
                   styles(pe, '#digg-assessment', [s.format('dga-') for s in intro_sel]), 'intro')
    pe.click('#dga-start'); pp.click('#start'); pe.wait_for_timeout(900); pp.wait_for_timeout(900)
    q_sel = ['.opt', '#{}qtext', '.qof', '.qnum', '.step span', '#{}next', '#{}back']
    compare_styles(styles(pp, '#view-assessment', [s.format('') for s in q_sel]),
                   styles(pe, '#digg-assessment', [s.format('dga-') for s in q_sel]), 'question')
    for page, P in ((pe, 'dga-'), (pp, '')):
        for qi in range(12):
            page.locator(f'#{P}opts .opt').nth(0).click(); page.click(f'#{P}next')
        page.wait_for_selector(f'#{P}fix')
    fx = [pe.evaluate('getComputedStyle(document.querySelector("#dga-fix")).fontSize'), pp.evaluate('getComputedStyle(document.querySelector("#fix")).fontSize')]
    check(fx == (['16px', '16px'] if mobile else ['15px', '15px']), f'text box font-size embed {fx[0]} / production {fx[1]}')
    pe.screenshot(path=f'{SHOTS}/{tag}-2b-textbox.png')
    for page, P in ((pe, 'dga-'), (pp, '')):
        page.click(f'#{P}next'); page.wait_for_selector(f'#{P}s-res.on'); page.wait_for_timeout(600)
    g_sel = ['.gate', '.gate h3', '.gate p', '#{}mail', '#{}send', '.gate small']
    compare_styles(styles(pp, '#view-assessment', [s.format('') for s in g_sel]),
                   styles(pe, '#digg-assessment', [s.format('dga-') for s in g_sel]), 'email gate')
    emb_errors += pe._errors; ctx.close(); ctx2.close()

    # ---------- 5. console ----------
    new_errs = [e for e in emb_errors if e not in control_errors]
    check(not new_errs, f'no console errors from the embed (control page itself logged {len(control_errors)})' + ('' if not new_errs else f' -> {new_errs[:4]}'))

def random_parity(browser, n):
    print(f'\n=== {n} random answer sets, Chromium 1440, payload + text vs production ===')
    rnd = random.Random(20261109); ok = 0; bad = []
    ctx, pe = new_page(browser, False); ctx2, pp = new_page(browser, False)
    for k in range(n):
        answers = [rnd.randrange(5), rnd.randrange(5)] + [rnd.randrange(4) for _ in range(10)]
        text = rnd.choice(['', 'Pipeline visibility'])
        res = []
        for page, opener, P in ((pe, open_embed, 'dga-'), (pp, open_prod, '')):
            page._payloads.clear(); opener(page)
            answer_all(page, P, answers, text)
            submit_email(page, P, 'qa@example-mfg.com'); page.wait_for_timeout(200)
            res.append((strip(page._payloads[0]) if page._payloads else None,
                        page.evaluate(f'document.querySelector("#{P}rec").innerText')))
        if res[0] == res[1] and res[0][0]: ok += 1
        else: bad.append(answers)
    check(ok == n, f'random parity {ok}/{n}' + ('' if not bad else f' -> first mismatch {bad[0]}'))
    ctx.close(); ctx2.close()

def globals_check(browser):
    print('\n=== globals and double-run ===')
    ctx = browser.new_context(); page = ctx.new_page()
    page.goto(EMB + '/dist/digg-assessment.js')  # same origin, then replace the document
    page.set_content('<!doctype html><html><head></head><body><div id="digg-assessment"></div></body></html>')
    before = page.evaluate('Object.getOwnPropertyNames(window)')
    page.add_script_tag(url=EMB + '/dist/digg-assessment.js')
    page.add_script_tag(url=EMB + '/dist/digg-assessment.js')  # Elementor editor re-run
    after = page.evaluate('Object.getOwnPropertyNames(window)')
    new = sorted(set(after) - set(before))
    check(not new, f'no new globals ({new})')
    check(page.evaluate('[document.querySelectorAll("#digg-assessment .shell").length, document.querySelectorAll("style#digg-assessment-css").length]') == [1, 1],
          'running the script twice renders once')
    for probe in ('AREAS', 'QUESTIONS', 'POINTS', 'RESULTS'):
        check(page.evaluate(f'typeof {probe}') == 'undefined', f'{probe} not leaked to the page')
    ctx.close()

with sync_playwright() as pw:
    chromium = pw.chromium.launch()
    webkit = pw.webkit.launch()
    globals_check(chromium)
    run_device(pw, 'Chromium 1440', chromium, False)
    run_device(pw, 'WebKit 390', webkit, True)
    random_parity(chromium, 25)
    chromium.close(); webkit.close()

print(f'\n{len(PASSES)} passed, {len(FAILS)} failed')
for f in FAILS: print('FAILED: ' + f)
sys.exit(1 if FAILS else 0)
