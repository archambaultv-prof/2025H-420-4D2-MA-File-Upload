# Téléversement de fichiers CSV/JSON avec Node.js et Express

Ce dépôt fournit un exemple minimal pour apprendre à envoyer des fichiers CSV
ou JSON depuis un client web et les traiter dans un serveur Node.js/Express
avec [Multer](https://github.com/expressjs/multer) et [Knex](http://knexjs.org/).

## Structure du projet

- [index.js](./index.js) : point d’entrée de l’application  
- [db.js](./db.js) : configuration de la base SQLite via Knex  
- [routes/upload.js](./routes/upload.js) : route d’upload et de parsing  
- [routes/download.js](./routes/download.js) : route de téléchargement CSV/JSON  
- [public/index.html](./public/index.html) & [public/style.css](./public/style.css) : interface web simple  

Pour une explication détaillée du mécanisme d’upload et de traitement des fichiers, voyez [**file_upload.md**](./file_upload.md).
