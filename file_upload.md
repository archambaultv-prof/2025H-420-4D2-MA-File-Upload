# Traitement des fichiers uploadés

Ce document explique comment fonctionne l’envoi de fichiers depuis un client
web vers un serveur Node.js et comment utiliser **[Multer](https://github.com/expressjs/multer)** pour recevoir et
traiter ces fichiers.

## Envoi côté client

### Formulaire HTML

La plupart du temps, on utilise un formulaire HTML pour envoyer des fichiers. Cela permet
à l’utilisateur de sélectionner un fichier sur son disque et de le soumettre au serveur. Le fichier
[index.html](./public/index.html) contient un formulaire simple.

La partie importante à retenir est que le serveur reçoit une requête de type
`POST` avec un en-tête `Content-Type` de type `multipart/form-data`. Cela
signifie que le corps de la requête contient plusieurs parties, chacune séparée
par une frontière (boundary) du type `----Boundary123`. Chaque partie a ses
propres en-têtes (Content-Disposition, Content-Type, etc.), un saut de ligne,
puis son contenu. Voici un exemple de requête :

```http
POST /api/upload HTTP/1.1
Host: localhost:3000
Content-Type: multipart/form-data; boundary=----Boundary123
Content-Length: 345

------Boundary123
Content-Disposition: form-data; name="userId"

42
------Boundary123
Content-Disposition: form-data; name="file"; filename="books.csv"
Content-Type: text/csv

ISBN,Title,Author,Publication Year
9798351145013,The Great Gatsby,F. Scott Fitzgerald,1925
9780393356250,The Odyssey,Homer,2018

------Boundary123--
```

Les principales parties de cette requête sont :

1. **`boundary=----Boundary123`**  

   Choisi arbitrairement par le client, il ne doit pas apparaître dans les données.  
2. **`------Boundary123`**  

   Sépare chaque partie du formulaire.  
3. **`Content-Disposition`**  

   - `name="userId"` → champ texte  
   - `name="file"; filename="books.csv"` → fichier avec son nom d’origine  
4. **`Content-Type`**

   Indique, dans la partie fichier, le type MIME (ici `text/csv`) pour que le serveur sache comment le lire.  
5. **`------Boundary123--`**  

   Le `--` final signale la fin de toutes les parties du corps de la requête.  

Avec ce format, Multer (ou tout autre parser `multipart/form-data`) peut
extraire chaque partie et vous fournir, par exemple, `req.body.userId` et
`req.file.buffer` pour ensuite traiter le CSV.


### Depuis JavaScript

Il est aussi possible d’envoyer des fichiers via JavaScript. Un code comme celui-ci
exécuté dans le navigateur permet d’envoyer un fichier sélectionné par l’utilisateur :


```js
const form = new FormData();
form.append('file', fileInput.files[0]);
fetch('/api/upload', { method: 'POST', body: form });
```

Le navigateur formate automatiquement la requête en `multipart/form-data` avec
un **boundary** pour séparer chaque partie.

## Réception et parsing côté serveur avec Multer

Multer est un middleware Express spécialisé dans le traitement des requêtes `multipart/form-data`.
Il analyse la requête et repère les champs fichiers, stocke temporairement le contenu en mémoire (ou sur disque)
et fournit un objet `req.file` (ou `req.files`) contenant le buffer, le nom original, le type MIME, etc.

Voici les grandes étapes de son fonctionnement :

1. Express reçoit la requête `POST /api/upload`.  
2. Multer intercepte la requête avant votre route.
3. Il stocke le fichier en mémoire.
4. Il crée `req.file`, un objet qui contient les informations sur le fichier téléversé.
   ```js
   {
     originalname: 'books.csv',
     mimetype: 'text/csv',
     buffer: <Buffer ...>,
     size: 12345
   }
   ```
5. Votre handler peut par la suite lire directement `req.file.buffer` pour parser le contenu.

## Traitement des données

Le code de la route [`upload`](./routes/upload.js) utilise à la fois l'extension du
fichier et le type MIME pour déterminer le format du fichier. Le traitement est
ensuite effectué selon les notions déjà vues en cours.

## À vous de jouer

1. Clonez le repo
2. Démarrez le serveur (`npm install` ➔ `npm run dev`)
3. Ouvrez votre navigateur à l’adresse [http://localhost:3000](http://localhost:3000)
4. Testez l’upload de fichiers CSV/JSON. Un fichier d'exemple est fourni dans le
   répertoire `tests`.
5. Lire et comprendre le code.