const express = require('express');
const knex    = require('../db');
const router  = express.Router();

router.get('/books', async (req, res) => {
  const fmt = req.query.format;
  try {
    const books = await knex('books').select('*');

    if (fmt === 'csv') {
      res
        .header('Content-Disposition', 'attachment; filename="books.csv"')
        .type('text/csv');
      const header = 'ISBN,Title,Author,Publication Year\n';
      const rows = books.map(b =>
        [
          `"${b.isbn.replace(/"/g,'""')}"`,
          `"${b.title.replace(/"/g,'""')}"`,
          `"${b.author.replace(/"/g,'""')}"`,
          b.publication_year
        ].join(',')
      ).join('\n');
      res.send(header + rows);

    } else {
      res
        .header('Content-Disposition', 'attachment; filename="books.json"')
        .json(books);
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('DB error.');
  }
});

module.exports = router;
