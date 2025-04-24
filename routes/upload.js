const express   = require('express');
const multer    = require('multer');
const csvParser = require('csv-parser');
const knex      = require('../db');
const router    = express.Router();

// On utilise la mémoire pour stocker temporairement le fichier téléversé.
// Utile pour lire directement le buffer sans écrire sur le disque.
const upload    = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  const { file } = req;
  if (!file) 
    return res.status(400).send('No file uploaded.');

  // Nom du fichier en minuscules pour simplifier les vérifications
  const name = file.originalname.toLowerCase();
  let records = [];

  // 1) Traitement JSON
  // Si l'extension ou le mimetype indique du JSON
  if (name.endsWith('.json') || file.mimetype.includes('json')) {
    try {
      // on parse le buffer en chaîne, puis en objet JS
      records = JSON.parse(file.buffer.toString());
      // on vérifie bien qu'on a un tableau
      if (!Array.isArray(records))
        return res.status(400).send('JSON must be an array of objects.');
    } catch {
      // échec du JSON.parse
      return res.status(400).send('Invalid JSON file.');
    }
    // appel au traitement commun
    await process(records, res);

  // 2) Traitement CSV
  } else if (name.endsWith('.csv') || file.mimetype.includes('csv')) {
    const rows = [];
    const stream = require('stream');

    // Création d'un Readable stream à partir du buffer
    const readable = new stream.Readable({
      read() {}
    });
    readable.push(file.buffer);
    readable.push(null); // fin du flux

    // on pipe le flux dans csv-parser
    // 'data' : événement par ligne, 'end' : fin de parsing, 'error' : erreur
    readable
      .pipe(csvParser())
      .on('data', row => rows.push(row))
      .on('end', () => process(rows, res))
      .on('error', () => res.status(400).send('CSV parse error'));

  } else {
    // type de fichier non supporté
    res.status(400).send('Unsupported file type.');
  }

  // Fonction interne pour insérer les données en base
  async function process(data, res) {
    // On mappe chaque ligne pour extraire les champs souhaités
    const books = data.map(r => ({
      isbn:             r.ISBN || r.isbn,
      title:            r.Title || r.title,
      author:           r.Author || r.author,
      publication_year: parseInt(r['Publication Year'] || r.publication_year, 10)
    }));

    try {
      // On utilise une transaction pour garantir l'intégrité
      await knex.transaction(async trx => {
        for (let b of books) {
          await trx('books')
            .insert(b)
            // si la clef isbn existe déjà, on merge les nouveaux champs
            .onConflict('isbn')
            .merge();
        }
      });
      // Succès
      res.send('✔ Data uploaded.');
    } catch (err) {
      // Log pour le debug, renvoi d'une erreur générique
      console.error(err);
      res.status(500).send('DB error.');
    }
  }
});

module.exports = router;
