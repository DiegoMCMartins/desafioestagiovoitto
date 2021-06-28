import { Router } from 'express';

/** Controllers */
import AlunosController from '../app/controllers/AlunoController';
/**  * */

const routes = new Router();

routes.get('/alunos', AlunosController.index);
routes.post('/aluno', AlunosController.read);
routes.post('/novoAluno', AlunosController.create);

export default routes;
