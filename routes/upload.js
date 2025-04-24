const express   = require('express');
const multer    = require('multer');
const csvParser = require('csv-parser');
const knex      = require('../db');
const router    = express.Router();
const upload    = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  const { file } = req;
  if (!file) return res.status(400).send('No file uploaded.');

  const name = file.originalname.toLowerCase();
  let records = [];

  // 1) JSON?
  if (name.endsWith('.json') || file.mimetype.includes('json')) {
    try {
      records = JSON.parse(file.buffer.toString());
      if (!Array.isArray(records))
        return res.status(400).send('JSON must be an array of objects.');
    } catch {
      return res.status(400).send('Invalid JSON file.');
    }
    await process(records, res);

  // 2) CSV?
  } else if (name.endsWith('.csv') || file.mimetype.includes('csv')) {
    const rows = [];
    const stream = require('stream');
    const readable = new stream.Readable();
    readable._read = () => {};
    readable.push(file.buffer);
    readable.push(null);

    readable
      .pipe(csvParser())
      .on('data', row => rows.push(row))
      .on('end', () => process(rows, res))
      .on('error', () => res.status(400).send('CSV parse error'));

  } else {
    res.status(400).send('Unsupported file type.');
  }

  async function process(data, res) {
    const books = data.map(r => ({
      isbn:             r.ISBN || r.isbn,
      title:            r.Title || r.title,
      author:           r.Author || r.author,
      publication_year: parseInt(r['Publication Year'] || r.publication_year, 10)
    }));

    try {
      await knex.transaction(async trx => {
        for (let b of books) {
          await trx('books')
            .insert(b)
            .onConflict('isbn')
            .merge();
        }
      });
      res.send('✔ Data uploaded.');
    } catch (err) {
      console.error(err);
      res.status(500).send('DB error.');
    }
  }
});

module.exports = router;
