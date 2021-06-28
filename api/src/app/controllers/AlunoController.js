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
    
    res.send('OK');
  }

  async update(req, res) {
    // TODO
  }

  async delete(req, res) {
    // TODO
  }
}

export default new AlunoController();
