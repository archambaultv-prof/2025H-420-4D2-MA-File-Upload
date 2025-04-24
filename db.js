const knex = require('knex')({
    client: 'sqlite3',
    connection: { filename: './db.sqlite3' },
    useNullAsDefault: true,
  });
  
  (async () => {
    const exists = await knex.schema.hasTable('books');
    if (!exists) {
      await knex.schema.createTable('books', table => {
        table.string('isbn').primary();
        table.string('title').notNullable();
        table.string('author').notNullable();
        table.integer('publication_year').notNullable();
      });
      console.log('✔ Created table: books');
    }
  })();
  
  module.exports = knex;
  