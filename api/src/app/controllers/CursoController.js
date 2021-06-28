import Curso from '../models/Curso';

class CursoController {
    async index(req, res) {
        const cursos = await Curso.findAll();
        res.json(cursos);
    }
}

export default new CursoController;