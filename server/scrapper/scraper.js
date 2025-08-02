import { chromium } from 'playwright';
import { parse, subDays, format } from 'date-fns';

let browser;
let page;
let cachedCaptcha = '';
let closed = false;

export async function getCaptchaCode() {
  try {
    if (!browser || closed) {
      closed = false;
      browser = await chromium.launch({ headless: false }); //headless hide the chronium browser
      page = await browser.newPage();
      await page.goto('https://delhihighcourt.nic.in/app/');

      // this let us know if the browser was closed manually
      browser.on('disconnected', () => {
        closed = true;
        browser = null;
        page = null;
        console.log('Browser was manually closed');
      });
    } else {
      try {
        // if the browser is already open, just reload the page and this is for when user give invalid data
        await page.reload();
      } catch (e) {
        
        // if the page is not loaded properly, we close the browser and restart
        closed = true;
        browser = null;
        page = null;
        return await getCaptchaCode(); // restart flow
      }
    }

    const code = await page.textContent('#captcha-code');
    cachedCaptcha = code.trim();

    return cachedCaptcha;
  } catch (err) {
    console.error('Captcha fetch failed:', err);
    throw new Error('Captcha fetch failed');
  }
}
export async function fetchCaseDetails({ caseType, caseNumber, filingYear, captchaInput }) {
  if (!page || !browser) throw new Error('Call getCaptchaCode() first.');
  if (captchaInput !== cachedCaptcha) {
    return {
      error: 'Invalid CAPTCHA. Please try again.'
    };
  }

  //this fills the data on web page
  await page.waitForSelector('#case_type');
  await page.selectOption('#case_type', { label: caseType });
  await page.fill('#case_number', caseNumber);
  await page.selectOption('#year', filingYear);
  await page.fill('#captchaInput', captchaInput);

    //this clicks the Submit button and waits for the results to load
    await page.click('#search');

    await page.waitForFunction(() => {
    const rows = document.querySelectorAll('#caseTable tbody tr');
    return Array.from(rows).some(row => row.querySelector('td a'));
  }, { timeout: 10000 });

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

  // Extract full title (Petitioner VS Respondent)
  // Using strong:text("Title:") + span to ensure we get the correct element
const fullTitleText = await page.textContent('strong:text("Title:") + span')
    .then(el => el?.trim() || 'N/A')
    .catch(() => 'N/A');

  let petitioner = 'N/A';
  let respondent = 'N/A';
  let filingDate = 'N/A';

  // Match the full title text to extract petitioner and respondent
  // Adjusted regex to handle optional periods and whitespace
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
  
  if (orders.length > 0) {
    const lastOrder = orders[orders.length - 1]; // LAST ROW (oldest order)
    const lastDateStr = lastOrder.date; // e.g., "05-01-2023"

    // Convert string to Date
    const parsedDate = parse(lastDateStr, 'dd-MM-yyyy', new Date());

    // Subtract 1 day
    const oneDayBefore = subDays(parsedDate, 1);

    // Format to dd-MM-yyyy
    filingDate = format(oneDayBefore, 'dd-MM-yyyy');
  }

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
      filingDate,
      nextHearing,
    },
    orders,
  };
}






