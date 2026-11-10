"""Build the local test pages from a saved copy of her live homepage.

    python3 -I test/make_fixture.py <saved-home.html> <out-dir>

Writes <out-dir>/assessment.html (the snippet inside an Elementor full-width container
and HTML widget, as Elementor 4.3 prints them), <out-dir>/assessment-override.html (the same,
plus the !important CSS her live widget carried for v1.0.0) and <out-dir>/control.html (same
page, no snippet). Her analytics are stripped so tests send nothing to her GA. The output is her
page: it stays out of git (test/fixture/ is ignored)."""
import re, sys, os

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
s = open(src, encoding='utf-8').read()

# analytics / tracking: external and inline
s = re.sub(r'<script[^>]*src=["\'][^"\']*(googletagmanager|google-analytics-for-wordpress|googlesitekit|send-app)[^"\']*["\'][^>]*>\s*</script>', '', s)
s = re.sub(r'<script\b[^>]*>(?:(?!</script>).)*?(gtm4wp|mi_version|monsterinsights_frontend|google_gtagjs|_googlesitekit|eSendElementorFormsSettings)(?:(?!</script>).)*?</script>', '', s, flags=re.S)
s = re.sub(r'<script type="speculationrules">.*?</script>', '', s, flags=re.S)
# homepage-only stylesheets
s = re.sub(r'<link[^>]*(post-31\.css|fadeInUp\.min\.css|fadeInRight\.min\.css)[^>]*>', '', s)
s = s.replace('page-id-31', 'page-id-9999').replace('elementor-page-31', 'elementor-page-9999').replace('<body class="home ', '<body class="page-template-elementor_header_footer ')

SNIPPET = ('<div id="digg-assessment"></div>\n'
           '<script src="/dist/digg-assessment.js" defer data-cfasync="false" data-jetpack-boost="ignore"></script>')

# The CSS in her Elementor widget as of v1.0.0 (Nov 10 2026). v1.0.1 must still work with it in place.
OVERRIDE = '''<style>
#digg-assessment{min-height:0 !important;padding-bottom:80px !important}
@media(max-width:640px){#digg-assessment{padding-bottom:48px !important}}
#digg-assessment #dga-rail{display:none !important}
body{display:flex;flex-direction:column;min-height:100vh}
body.admin-bar{min-height:calc(100vh - 32px)}
body>*{flex-shrink:0}
.elementor-location-footer,#site-footer{margin-top:auto}
</style>
'''

def page(widget):
    return ('<div data-elementor-type="wp-page" data-elementor-id="9999" class="elementor elementor-9999" data-elementor-post-type="page">\n'
            '<div class="elementor-element elementor-element-a1b2c3d e-con-full e-flex e-con e-parent" data-id="a1b2c3d" data-element_type="container" data-e-type="container" '
            'style="--padding-top:0px;--padding-bottom:0px;--padding-left:0px;--padding-right:0px;--gap:0px 0px;--row-gap:0px;--column-gap:0px;--width:100%;">\n'
            '<div class="elementor-element elementor-element-e4f5a6b elementor-widget elementor-widget-html" data-id="e4f5a6b" data-element_type="widget" data-e-type="widget" data-widget_type="html.default">\n'
            + widget + '\n</div>\n</div>\n</div>')

i, j = s.find('<main id="content"'), s.find('</main>')
assert i > 0 and j > i
j += len('</main>')
open(os.path.join(out, 'assessment.html'), 'w', encoding='utf-8').write(s[:i] + page(SNIPPET) + s[j:])
open(os.path.join(out, 'assessment-override.html'), 'w', encoding='utf-8').write(s[:i] + page(OVERRIDE + SNIPPET) + s[j:])
# control: same page, empty widget plus a spacer so both pages scroll the same way
open(os.path.join(out, 'control.html'), 'w', encoding='utf-8').write(s[:i] + page('<div style="height:2600px"></div>') + s[j:])
left = re.findall(r'googletagmanager|monsterinsights_frontend|gtm4wp|googlesitekit', s)
print('fixture written, analytics left:', left)
