import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import Aluno from '../app/models/Aluno';
import Curso from '../app/models/Curso';

const models = [Aluno, Curso];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
