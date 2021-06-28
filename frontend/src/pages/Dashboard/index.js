import React, { useEffect, useState } from 'react';

// components
import { Table, Button, Popup, Modal, Header, Icon, Form, List } from 'semantic-ui-react'

//services
import api from '../../services/api';

// styles
import { Container, InitialText } from './styles';

const Dashboard = () => {
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [currentInfo, setCurrentInfo] = useState([]);
  const [modalInfos, setModalInfos] = useState(false);
  const [openSelectCursosModal, setOpenSelectCursosModal] = useState(false);

  useEffect(()=>{
    async function fetchData() {
      try{
        const response = await api.get('/alunos');
        setAlunos(response.data);
      } catch {
        alert('Confira a api');
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchCursos() {
      try{
        const response = await api.get('/cursos');
        setCursos(response.data);
      } catch {
        alert('Confira a api');
      }
    }

    fetchCursos();
  }, [])

  const open_modal_select_courses = (data_aluno) => {
    console.log(data_aluno)
    setCurrentInfo(data_aluno);
    setOpenSelectCursosModal(true);
  }

  const on_select_new_curso = async (curso) => {
    const response = await api.post('/atribuirCursoAluno', {
      id_aluno: currentInfo.id,
      id_curso: curso.id,
    });
    console.log(response);
    setOpenSelectCursosModal(false);
  }

  const render_modal_select_courses = () => (
    <Modal 
      open={openSelectCursosModal}
      onClose={() => setOpenSelectCursosModal(false)}
      closeIcon
      size={'tiny'}>
      <Header content={'Selecione um curso'} />
      <Modal.Content>
        <List divided selection size={'large'}>
          {cursos.map(curso => {
            return (
              <List.Item onClick={() => on_select_new_curso(curso)}>
                <List.Header>
                  {curso.nome}
                </List.Header>
              </List.Item>
            );
          })}
        </List>
      </Modal.Content>
    </Modal>
  );

  const render_modal_info_alunos = () => (
    <Modal open={modalInfos} onClose={()=>setModalInfos(false)} closeIcon>
    <Header content={`Editando informações de ${currentInfo.nome}`} />
    <Modal.Content>
      <Form>
        <Form.Group widths='equal'>
          <Form.Input fluid label='Nome' placeholder='Nome' />
          <Form.Input fluid label='Email' placeholder='Email' />
          <Form.Input fluid label='CEP' placeholder='CEP' />
        </Form.Group>
      </Form>
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={()=>setModalInfos(false)} color='red'>
        <Icon name='remove' /> Cancelar
      </Button>
      <Button color='green'>
        <Icon name='checkmark' /> Salvar
      </Button>
    </Modal.Actions>
  </Modal>
  )

  function open_info_alunos(data_aluno){
    console.log(data_aluno)
    setCurrentInfo(data_aluno)
    setModalInfos(true)
  }

  function render_actions(data_aluno){
    return <center>
      <Popup
        trigger={<Button icon='edit' onClick={()=>open_info_alunos(data_aluno)} />}
        content="Editar informações"
        basic
      />
      <Popup
        trigger={
          <Button
            icon='plus'
            positive 
            onClick={() => open_modal_select_courses(data_aluno)} 
          />
        }
        content="Adicionar curso para aluno"
        basic
      />
      <Popup
        trigger={<Button icon='list' primary />}
        content="Ver cursos do aluno"
        basic
      />
      <Popup
        trigger={<Button icon='close' negative />}
        content="Excluir aluno"
        basic
      />
    </center>
  }

  function render_alunos(){
    return alunos.map((v)=><Table.Row>
      <Table.Cell>{v.id}</Table.Cell>
      <Table.Cell>{v.nome}</Table.Cell>
      <Table.Cell>{v.email}</Table.Cell>
      <Table.Cell>{v.cep}</Table.Cell>
      <Table.Cell>{render_actions(v)}</Table.Cell>
    </Table.Row>)
  }

  return (
    <Container>
      <InitialText>Administrador de alunos</InitialText>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>ID Aluno</Table.HeaderCell>
            <Table.HeaderCell>Nome</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>CEP</Table.HeaderCell>
            <Table.HeaderCell>Ações</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          { alunos.length > 0 ? render_alunos() : <h2>Nenhum dado registrado </h2> }
        </Table.Body>
      </Table>
      {render_modal_info_alunos()}
      {render_modal_select_courses()}
      <Button primary>Adicionar aluno</Button>
      <Button href="/" secondary>Ver instruções</Button>
    </Container>
  );
};

export default Dashboard;
