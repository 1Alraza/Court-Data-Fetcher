import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { getCaptchaCode, fetchCaseDetails } from './scrapper/scraper.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// GET CAPTCHA CODE
app.get('/api/get-captcha', async (req, res) => {
  try {
    const code = await getCaptchaCode();
    res.json({ captcha: code });
  } catch (e) {
    console.error('CAPTCHA error:', e.message);
    res.status(500).json({ error: 'Captcha fetch failed' });
  }
});

// FETCH CASE DATA
app.post('/api/fetch-case', async (req, res) => {
  const { caseType, caseNumber, filingYear, captchaInput } = req.body;

  try {
    const data = await fetchCaseDetails({
      caseType,
      caseNumber,
      filingYear,
      captchaInput
    });

    // ❗ Forward CAPTCHA or scraping-related errors directly
    if (data?.error) {
      return res.status(400).json({ error: data.error });
    }

    // 📝 Save the fetched case details to the DB
    const query = await prisma.courtQuery.create({
      data: {
        caseType,
        caseNumber,
        filingYear,
        title: data.fullTitleText,
        status: data.status,
        historyLink: data.historyLink,
        metadata: {
          create: {
            petitioner: data.metadata.petitioner,
            respondent: data.metadata.respondent,
            filingDate: data.metadata.filingDate,
            nextHearing: data.metadata.nextHearing,
            courtName: 'Delhi High Court', // optional static field
          }
        },
        orders: {
          createMany: {
            data: data.orders.map(order => ({
              title: order.title,
              url: order.url,
              date: order.date
            }))
          }
        }
      },
      include: {
        metadata: true,
        orders: true
      }
    });

    // 📦 Return structured response
    res.json({
      caseType: query.caseType,
      caseNumber: query.caseNumber,
      filingYear: query.filingYear,
      title: query.title,
      status: query.status,
      historyLink: query.historyLink,
      metadata: {
        petitioner: query.metadata.petitioner,
        respondent: query.metadata.respondent,
        filingDate: query.metadata.filingDate,
        nextHearing: query.metadata.nextHearing
      },
      orders: query.orders
    });

  } catch (err) {
    // console.error('Server error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to fetch case' });
  }
});

// START SERVER
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
