import { Router } from 'express';

/** Controllers */
import AlunosController from '../app/controllers/AlunoController';
import CursosController from '../app/controllers/CursoController';
/**  * */

const routes = new Router();
/** Aluno routes */
routes.get('/alunos', AlunosController.index);
routes.post('/aluno', AlunosController.read);
routes.post('/novoAluno', AlunosController.create);
routes.post('/excluirAluno', AlunosController.delete);
/** */

/** Curso routes */
routes.get('/cursos', CursosController.index);
/** */

export default routes;
