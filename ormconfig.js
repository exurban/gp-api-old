const SnakeNamingStrategy = require("typeorm-naming-strategies")
  .SnakeNamingStrategy;

// import SnakeNamingStrategy from "typeorm-naming-strategies";
module.exports = {
  name: "default",
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "photos",
  synchronize: true,
  logging: false,
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/database/migration/**/*.ts"],
  subscribers: ["src/database/subscriber/**/*.ts"],
  namingStrategy: new SnakeNamingStrategy(),
};
