import Aluno from '../../models/Aluno';

class AtribuirCursoAlunoService {
  async execute({ id_aluno, id_curso }) {
    const aluno = await Aluno.findByPk(id_aluno);
    await aluno.addCurso(id_curso);
    return true;
  }
}

export default new AtribuirCursoAlunoService();
