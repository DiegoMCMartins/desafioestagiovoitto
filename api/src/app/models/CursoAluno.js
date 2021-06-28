import { Model, DataTypes } from 'sequelize';

class CursoAluno extends Model {
  static init(sequelize) {
    super.init(
      {
        id_pessoa: DataTypes.INTEGER,
        id_curso: DataTypes.INTEGER,
      },
      {
        sequelize,
        timestamps: false,
        tableName: 'curso_pessoa',
      }
    );

    return this;
  }

  static associate({Aluno, Curso}) {
    Aluno.belongsToMany(Curso, { through: this, foreignKey: 'id_pessoa' });
    Curso.belongsToMany(Aluno, { through: this, foreignKey: 'id_curso' });
  }
}

export default CursoAluno;
