import { Model, DataTypes } from 'sequelize';

class CursoAluno extends Model {
  static init(sequelize) {
    super.init(
      {
        'id_pessoa': DataTypes.INTEGER,
        'id_curso': DataTypes.INTEGER,
      },
      {
        sequelize,
        timestamps: false,
        tableName: 'curso_pessoa',
      }
    )
  }
}

export default CursoAluno;
