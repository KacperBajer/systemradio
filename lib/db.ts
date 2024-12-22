import { Pool } from "pg";

const port = parseInt(process.env.PGSQL_PORT as string, 10)

let conn: Pool | undefined;


if (!conn) {
  conn = new Pool({
    user: process.env.PGSQL_USER,
    password: process.env.PGSQL_PASSWORD,
    host: process.env.PGSQL_HOST,
    port: port,
    database: process.env.PGSQL_DATABASE,
  });
}

export default conn ;