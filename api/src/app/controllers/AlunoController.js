import Aluno from '../models/Aluno';
import atribuirCursoAluno from '../services/AtribuirCursoAlunoService';

class AlunoController {
  async index(req, res) {
    const alunos = await Aluno.findAll()
    res.json(alunos);
  }

  async read(req, res) {
    const {id} = req.body;
    const aluno = await Aluno.findByPk(id);
    if(aluno) {
      return res.json(aluno.dataValues);
    }

    res.status(404).send('Aluno não foi encontrado, verifique se os dados estão corretos');
  }

  async create(req, res) {
    const aluno = req.body;
    const newAluno = await Aluno.create(aluno);
    if(newAluno) {
      return res.status(200).send('Usuario criado com sucesso');
    }

    res.status(400).send('Algo deu errado');
  }

  async update(req, res) {
    const {id, ...updateInfo} = req.body;
    const aluno = await Aluno.update(updateInfo, {
      where: {
        id,
      }
    });

    res.status(200).send('OK');
  }

  async delete(req, res) {
    const {id} = req.body;
    const rowDeleted = await Aluno.destroy({
      where: {
        id,
      },
    });
    if(rowDeleted > 0) {
      return res.send("Excluido");
    }
    
    res.status(400).send('Id incorreto');
  }

  async addCurso(req, res) {
    const {id_aluno, id_curso} = req.body;
    await atribuirCursoAluno.execute({id_aluno, id_curso});

    res.status(200).send('OK');
  }
}

export default new AlunoController();
