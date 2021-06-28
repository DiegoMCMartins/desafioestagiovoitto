import { Model } from 'sequelize';

class Curso extends Model {
  static init(sequelize) {
    super.init(
      {},
      {
        sequelize,
        timestamps: false,
        tableName: 'curso',
      },
    );

    return this;
  }
}

export default Curso;
