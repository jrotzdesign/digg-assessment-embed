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
