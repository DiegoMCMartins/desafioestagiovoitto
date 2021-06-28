import Aluno from '../models/Aluno';

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
    //TODO: validate aluno
    const newAluno = await Aluno.create(aluno);
    if(newAluno) {
      return res.status(200).send('Usuario criado com sucesso');
    }

    res.status(400).send('Algo deu errado');
  }

  async update(req, res) {
    // TODO
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
}

export default new AlunoController();
