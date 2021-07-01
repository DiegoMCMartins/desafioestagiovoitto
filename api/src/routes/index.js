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
routes.post('/updateAluno', AlunosController.update);
routes.post('/atribuirCursoAluno', AlunosController.addCurso);
routes.post('/getCursos', AlunosController.getCursos);
routes.post('/getAvailableCursos', AlunosController.getAvailableCursos);
routes.post('/removeCursoAluno', AlunosController.removeCurso);
/** */

/** Curso routes */
routes.get('/cursos', CursosController.index);
/** */

export default routes;
