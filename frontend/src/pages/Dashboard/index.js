import React, { useEffect, useState } from 'react';

// components
import { Table, Button, Popup, Modal, Header, Icon, Form, List, Loader, Dimmer, Segment } from 'semantic-ui-react'

//services
import api from '../../services/api';
import cepApi from '../../services/cepApi';

// styles
import { Container, InitialText } from './styles';

const Dashboard = () => {
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [currentInfo, setCurrentInfo] = useState([]);
  const [updateInfo, setUpdateInfo] = useState({});
  const [modalInfos, setModalInfos] = useState(false);
  const [openSelectCursosModal, setOpenSelectCursosModal] = useState(false);
  const [refresh, setRefresh] = useState(true);
  const [loadingCursos, setLoadingCursos] = useState(false);

  useEffect(()=>{
    async function fetchData() {
      try{
        const response = await api.get('/alunos');
        setAlunos(response.data);
      } catch {
        alert('Confira a api');
      }
    }

    if(refresh) {
      fetchData();
      setRefresh(false);
    }

  }, [refresh]);

  async function fetchCursos({id}) {
    try{
      const response = await api.post('/getAvailableCursos', {
        id,
      });
      setCursos(response.data);
    } catch(error) {
      console.log(error);
      alert(error);
    }
  }

  const open_modal_select_cursos = async (data_aluno) => {
    try{
      setLoadingCursos(true);
      setCurrentInfo(data_aluno);
      setOpenSelectCursosModal(true);
      await fetchCursos(data_aluno);
    } catch(error) {
      alert(error);
    } finally {
      setLoadingCursos(false);
    }
  }

  const on_select_new_curso = async (curso) => {
    await api.post('/atribuirCursoAluno', {
      id_aluno: currentInfo.id,
      id_curso: curso.id,
    });
    setOpenSelectCursosModal(false);
  }

  const render_modal_select_cursos = () => (
    <Modal 
      open={openSelectCursosModal}
      onClose={() => setOpenSelectCursosModal(false)}
      closeIcon
      size={'tiny'}>
      <Header content={`Selecione um curso para ${currentInfo.nome}`} />
      <Modal.Content>
        {loadingCursos 
          ? (
            'Carregando ...'
          ) : (
              <List divided selection size={'large'}>
                {cursos.length > 0 
                  ? cursos.map(curso => {
                      return (
                        <List.Item onClick={() => on_select_new_curso(curso)}>
                          <List.Content >
                            {curso.nome}
                          </List.Content>
                        </List.Item>
                      );
                    })
                  : <List.Header>Todos os cursos disponíveis já foram atribuídos</List.Header>
                }
              </List> 
          )
        }
      </Modal.Content>
    </Modal>
  );

  const remove_blank_update_info = (updateInfo) => {
    let newUpdateInfo = {};
    const properties = Object.keys(updateInfo);

    for(const property of properties) {
      if(updateInfo[property].length > 0) {
        newUpdateInfo = {...newUpdateInfo, [property]: updateInfo[property]}
      }
    };

    return newUpdateInfo;
  }

  const is_valid_cep = (cep) => {
    const cepRegex = /^\d{8}$/;

    return cepRegex.test(cep);
  }

  const on_update_aluno_save_press = async () => {
    try{
      const newUpdateInfo = remove_blank_update_info(updateInfo);
      console.log(newUpdateInfo);
      if(Object.keys(newUpdateInfo).length === 0) {
        setModalInfos(false);
        return;
      }
      let config = {
        id: currentInfo.id,
        ...newUpdateInfo
      };
      if(newUpdateInfo.cep) {
        const isValidCep = is_valid_cep(newUpdateInfo.cep);
        if(!isValidCep) {
          alert('Formato invalido de CEP');
          return;
        }
        const response = await cepApi.get(`/${newUpdateInfo.cep}`);
        const {localidade: cidade, uf: estado, erro} = response.data;
        if(erro) {
          alert('CEP não encontrado');
          return;
        }
        config = {
          ...config,
          cidade,
          estado,
        };
      } 
      
      await api.post('/updateAluno', config);
      setRefresh(true);
      setUpdateInfo({});
      setModalInfos(false);
    } catch(error) {
      console.log(error);
    }
    
  };

  const render_modal_info_alunos = () => (
    <Modal open={modalInfos} onClose={()=>setModalInfos(false)} closeIcon>
    <Header content={`Editando informações de ${currentInfo.nome}`} />
    <Modal.Content>
      <Form>
        <Form.Group widths='equal'>
          <Form.Input 
            fluid label='Nome'
            placeholder={currentInfo.nome}
            onChange={(_, {value}) => setUpdateInfo(prev => ({...prev, nome: value}))}
          />
          <Form.Input 
            fluid
            label='Email'
            placeholder={currentInfo.email}
            onChange={(_, {value}) => setUpdateInfo(prev => ({...prev, email: value}))}
          />
          <Form.Input 
            fluid
            label='CEP'
            placeholder={currentInfo.cep}
            onChange={(_, {value}) => setUpdateInfo(prev => ({...prev, cep: value}))}
          />
        </Form.Group>
      </Form>
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={()=>setModalInfos(false)} color='red'>
        <Icon name='remove' /> Cancelar
      </Button>
      <Button color='green' onClick={() => on_update_aluno_save_press()}>
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
            onClick={() => open_modal_select_cursos(data_aluno)} 
          />
        }
        content="Adicionar curso para aluno"
        basic
      />
      <Popup
        trigger={<Button icon='list' primary/>}
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
    <>
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
        {render_modal_select_cursos()}
        <Button primary>Adicionar aluno</Button>
        <Button href="/" secondary>Ver instruções</Button>
      </Container>
    </>
  );
};

export default Dashboard;


// Test

/*
useEffect(() => {
    if(successMessageVisible) {
      setTimeout(() => {
        setSuccessMessageVisible(false);
      }, 2000);
    };
  }, [successMessageVisible]);

  const toggle_success_message_visible = () => {
    setSuccessMessageVisible(prev => !prev);
  };

<Transition visible={successMessageVisible} animation={'fly down'} unmountOnHide duration={500}>
  <FloatMessage>
    <Message
      header={'Curso adicionado com sucesso'}
      content={`O curso foi vinculado ao seu perfil`}
      icon={<Icon name={'check'} />}
      onDismiss={toggle_success_message_visible}
      positive
    />
  </FloatMessage>
</Transition>
*/