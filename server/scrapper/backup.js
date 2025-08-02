import { chromium } from 'playwright';

let browser;
let page;
let cachedCaptcha = '';

export async function getCaptchaCode() {
  if (!browser) {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    await page.goto('https://delhihighcourt.nic.in/app/');
  }

  const code = await page.textContent('#captcha-code');
  cachedCaptcha = code.trim();

  return cachedCaptcha;
}

// export async function fetchCaseDetails({ caseType, caseNumber, filingYear, captchaInput }) {
//   if (!page || !browser) throw new Error('Call getCaptchaCode() first.');
//   if (captchaInput !== cachedCaptcha) throw new Error('Invalid CAPTCHA');

//   await page.waitForSelector('#case_type');
//   await page.selectOption('#case_type', { label: caseType });
//   await page.fill('#case_number', caseNumber);
//   await page.selectOption('#year', filingYear);
//   await page.fill('#captchaInput', captchaInput);

//   await Promise.all([
//     page.click('#search'),
//     page.waitForSelector('#caseTable tbody tr', { timeout: 10000 }),
//   ]);

//   // Extract full title (Petitioner VS Respondent)
//   const fullTitleText = await page.$$eval('span.text-primary', spans => {
//   const matching = spans.find(span => span.textContent.includes('VS'));
//   return matching ? matching.textContent.trim() : '';
// });
//   let petitioner = 'N/A';
//   let respondent = 'N/A';
//   const titleMatch = fullTitleText?.match(/Title:\s*(.*?)\s+VS\.\s+(.*)/i);
//   if (titleMatch) {
//     petitioner = titleMatch[1].trim();
//     respondent = titleMatch[2].trim();
//   }

//   // ✅ Extract Status
//   const status = await page.textContent('strong:text("Status:") + span')
//     .then(el => el?.trim() || 'N/A')
//     .catch(() => 'N/A');

//   // ✅ Extract Next Hearing Date
//   const nextHearing = await page.textContent('strong:text("Next Date:") + span')
//     .then(el => el?.trim() || 'N/A')
//     .catch(() => 'N/A');

//   // ✅ Extract History Link
//   const historyLink = await page.getAttribute('a.button[href*="online-cause-history"]', 'href')
//     .catch(() => null);

//   // ✅ Extract Orders/Judgments Table
//   const orders = await page.$$eval('#caseTable tbody tr', rows =>
//     rows.map(row => {
//       const columns = row.querySelectorAll('td');
//       const link = columns[1]?.querySelector('a')?.href || '';
//       const title = columns[1]?.innerText.trim() || '';
//       const date = columns[2]?.innerText.trim() || '';
//       return { title, date, url: link };
//     })
//   ).catch(() => []);

//   await browser.close();
//   browser = null;
//   page = null;
//   cachedCaptcha = '';

//   // ✅ Return Complete Case Detail Object
//   return {
//     caseType,
//     caseNumber,
//     filingYear,
//     fullTitleText,
//     status,
//     historyLink,
//     metadata: {
//       petitioner,
//       respondent,
//       filingDate: 'N/A', // still not available on this page
//       nextHearing,
//     },
//     orders,
//   };
// }
export async function fetchCaseDetails({ caseType, caseNumber, filingYear, captchaInput }) {
  if (!page || !browser) throw new Error('Call getCaptchaCode() first.');
  if (captchaInput !== cachedCaptcha) throw new Error('Invalid CAPTCHA');

  await page.waitForSelector('#case_type');
  await page.selectOption('#case_type', { label: caseType });
  await page.fill('#case_number', caseNumber);
  await page.selectOption('#year', filingYear);
  await page.fill('#captchaInput', captchaInput);

  await Promise.all([
    page.click('#search'),
    page.waitForSelector('#caseTable tbody tr', { timeout: 10000 }),
  ]);

  // Full title from span with text-primary
const fullTitleText = await page.textContent('strong:text("Title:") + span')
    .then(el => el?.trim() || 'N/A')
    .catch(() => 'N/A');

  let petitioner = 'N/A';
  let respondent = 'N/A';
  const titleMatch = fullTitleText?.match(/(.*?)\s+VS\.?\s+(.*)/i);
  if (titleMatch) {
    petitioner = titleMatch[1].trim();
    respondent = titleMatch[2].trim();
  }

  const status = await page.textContent('strong:text("Status:") + span')
    .then(el => el?.trim() || 'N/A')
    .catch(() => 'N/A');

  const nextHearing = await page.textContent('strong:text("Next Date:") + span')
    .then(el => el?.trim() || 'N/A')
    .catch(() => 'N/A');

  const historyLink = await page.getAttribute('a.button[href*="online-cause-history"]', 'href')
    .catch(() => null);

const orders = await page.$$eval('#caseTable tbody tr', rows =>
  rows.map(row => {
    const columns = row.querySelectorAll('td');
    const anchor = columns[1]?.querySelector('a');
    return {
      title: anchor?.innerText?.trim() || 'N/A',
      date: columns[2]?.innerText?.trim() || 'N/A',
      url: anchor?.href || '',
    };
  })
).catch(() => []);

  await browser.close();
  browser = null;
  page = null;
  cachedCaptcha = '';

  return {
    caseType,
    caseNumber,
    filingYear,
    fullTitleText,
    status,
    historyLink,
    metadata: {
      caseTitle: fullTitleText || 'N/A',
      petitioner,
      respondent,
      filingDate: 'N/A',
      nextHearing,
    },
    orders,
  };
}






