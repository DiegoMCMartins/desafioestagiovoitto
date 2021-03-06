import Aluno from '../models/Aluno';
import Curso from '../models/Curso';
import atribuirCursoAluno from '../services/AtribuirCursoAlunoService';
import {Op} from 'sequelize';

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

    res.status(400).send('Dados incorretos ou faltando, corrija por favor.');
  }

  async update(req, res) {
    const {id, ...updateInfo} = req.body;
    await Aluno.update(updateInfo, {
      where: {
        id,
      }
    });

    res.status(200).send('Dados atualizados');
  }

  async delete(req, res) {
    const {id} = req.body;
    const rowDeleted = await Aluno.destroy({
      where: {
        id,
      },
    });
    if(rowDeleted > 0) {
      return res.send("Aluno excluido do sistema");
    }
    
    res.status(400).send('Id do aluno incorreto');
  }

  async addCurso(req, res) {
    const {id_aluno, id_curso} = req.body;
    await atribuirCursoAluno.execute({id_aluno, id_curso});

    res.status(200).send('Curso atribuido com sucesso');
  }

  async removeCurso(req, res) {
    const {id_aluno, id_curso} = req.body;
    await atribuirCursoAluno.remove({id_aluno, id_curso});

    res.status(200).send('Curso removido do aluno');
  }

  async getCursos(req, res) {
    const {id} = req.body;
    const aluno = await Aluno.findByPk(id);
    if(aluno) {
      const cursos = await aluno.getCursos();
      const formattedCursos = cursos.map(({dataValues: info}) => ({id: info.id, nome: info.nome}));
      console.log(formattedCursos);
      return res.status(200).json(formattedCursos);
    }

    res.status(404).send('Não foi encontrado nenhum aluno com esse id');
  }

  async getAvailableCursos(req, res) {
    const {id} = req.body;
    const aluno = await Aluno.findByPk(id);
    if(aluno) {
      const cursos = await aluno.getCursos();
      const cursosIds = cursos.map(({dataValues: {id}}) => id);
      const availableCursos = await Curso.findAll({
        where: {
          id: {
            [Op.notIn]: cursosIds,
          }
        }
      });
      return res.json(availableCursos);
    }

    res.status(404).send('Aluno não encontrado com esse id');
  }
}

export default new AlunoController();
