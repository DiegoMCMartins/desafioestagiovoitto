import React, { useEffect, useReducer, useState } from 'react';

// components
import { Table, Button, Popup, Modal, Header, Icon, Form, List, Divider } from 'semantic-ui-react'

//services
import api from '../../services/api';
import cepApi from '../../services/cepApi';

// styles
import { Container, InitialText } from './styles';

// Components
const ModalSelectCursos = ({
  open,
  onClose,
  title,
  loading,
  onAddCurso,
  onRemoveCurso,
  availableCursos,
  alunoCursos,
  hideAvailableCursos
}) => {

  const Loading = () => {
    return (
      <p>Carregando ...</p>
    );
  }

  const CursosListItem = ({curso, buttonContent, buttonIcon, buttonColor, onClick}) => {
    return (
      <List.Item>
        <List.Content floated={'right'}>
          <Button color={buttonColor} onClick={onClick}>
            <Icon name={buttonIcon} />
            {buttonContent}
          </Button>
        </List.Content>
        <List.Content >
          {curso.nome}
        </List.Content>
      </List.Item>
    );
  }

  const EmptyList = ({content}) => {
    return (
      <p>{content}</p>
    );
  }

  const AvailableCursosList = () => {
    const render_list = () => {
      if(availableCursos.length === 0) {
        return <EmptyList content={'Todos os cursos foram atribuidos ao aluno'} />
      }

      return (
        availableCursos.map(curso => (
          <CursosListItem
            curso={curso}
            buttonContent={'Adicionar'}
            buttonIcon={'add'}
            buttonColor={'green'}
            onClick={() => onAddCurso(curso)}
          />
        ))
      );
    }
    return (
      <List size={'large'}>
        <Header as={"h3"}>Disponiveis</Header>
        {render_list()}
      </List>
    );
  }

  const AlunoCursosList = ({curso}) => {
    

    const render_list = () => {
      if(alunoCursos.length === 0) {
        return <EmptyList content={'Nenhum curso atribuido'} />
      }

      return (
        alunoCursos.map(curso => (
          <CursosListItem
            curso={curso}
            buttonContent={'Remover'}
            buttonIcon={'remove'}
            buttonColor={'red'}
            onClick={() => onRemoveCurso(curso)}
          />
        ))
      )
    }
    return (
      <List size={'large'}>
        <Header as={"h3"}>Adquiridos</Header>
        {render_list()}
      </List>
    );
  }

  const CursosList = () => {
    return (
      <>
        <AlunoCursosList />
        {!hideAvailableCursos ? (
          <>
            <Divider />
            <AvailableCursosList />
          </>
        ) : null}
      </>
    );
  }

  return (
    <Modal 
      open={open}
      onClose={onClose}
      closeIcon
      size={'small'}>
      <Modal.Header>
        <Header as={'h3'}>{title}</Header>
      </Modal.Header>
      <Modal.Content>
        {loading ? <Loading /> : <CursosList />}
      </Modal.Content>
      <Modal.Actions>
        <Button primary onClick={onClose}>Concluido</Button>
      </Modal.Actions>
    </Modal>
  );
}

const ModalInfoAlunos = ({title, onClose, open, onSavePress, alunoInfo}) => {
  const [updateInfo, setUpdateInfo] = useState({});

  const clearUpdateInfo = () => {
    setUpdateInfo({});
  }

  useEffect(() => {
    if(open) {
      return;
    }

    clearUpdateInfo();
  }, [open]);
  
  return (
    <Modal open={open} onClose={onClose} closeIcon>
      <Header content={title} />
      <Modal.Content>
      <Form>
          <Form.Group widths='equal'>
            <Form.Input 
              fluid
              label='Nome'
              placeholder={alunoInfo.nome}
              onChange={(_, {value}) => setUpdateInfo(prev => ({...prev, nome: value}))}
            />
            <Form.Input 
              fluid
              label='Email'
              placeholder={alunoInfo.email}
              onChange={(_, {value}) => setUpdateInfo(prev => ({...prev, email: value}))}
            />
            <Form.Input 
              fluid
              label='CEP'
              placeholder={alunoInfo.cep}
              onChange={(_, {value}) => setUpdateInfo(prev => ({...prev, cep: value}))}
            />
          </Form.Group>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} color='red'>
          <Icon name='remove' /> Cancelar
        </Button>
        <Button color='green' onClick={() => onSavePress(updateInfo)}>
          <Icon name='checkmark' /> Salvar
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

const useModalCursoReducer = () => {
  const initialState = {
    open: false,
    loading: false,
    title: '',
    hideAvailableCursos: false,
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'OPEN_SELECT_CURSOS_MODAL': {
        return {
          ...state,
          loading: true,
          open: true,
          title: `Cursos disponíveis para ${action.payload}`,
        }
      }
      case 'CLOSE_MODAL': {
        return {
          ...state,
          loading: false,
          open: false,
          title: '',
          hideAvailableCursos: false,
        }
      }
      case 'OPEN_ALUNO_CURSOS_MODAL': {
        return {
          ...state,
          loading: true,
          open: true,
          title: `Cursos atribuídos a(o) ${action.payload}`,
          hideAvailableCursos: true,
        }
      }
      case 'FETCH_FINISHED': {
        return {
          ...state,
          loading: false,
        }
      }
      default: {
        return {
          ...state
        }
      }
    }
  }

  return useReducer(reducer, initialState);
}

const Dashboard = () => {
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState({aluno: [], available: []});
  const [currentInfo, setCurrentInfo] = useState([]);
  const [modalInfos, setModalInfos] = useState(false);
  const [refresh, setRefresh] = useState(true);
  const [modalCursoProps, dispatch] = useModalCursoReducer(currentInfo.name);

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

  async function fetchAvailableCursos({id}) {
    try{
      const response = await api.post('/getAvailableCursos', {
        id,
      });
      setCursos(prev => ({...prev, available: response.data}));
    } catch(error) {
      console.log(error);
      alert(error);
    }
  };

  async function fetchAlunoCursos({id}) {
    try{
      const response = await api.post('/getCursos', {
        id,
      });
      setCursos(prev => ({...prev, aluno: response.data}));
    } catch(error) {
      console.log(error);
      alert(error);
    }
  };

  const open_modal_select_cursos = async (data_aluno) => {
    try{
      setCurrentInfo(data_aluno);
      dispatch({type: 'OPEN_SELECT_CURSOS_MODAL', payload: data_aluno.nome}); // Test for useModalReducer
      await Promise.all([fetchAvailableCursos(data_aluno), fetchAlunoCursos(data_aluno)]);
    } catch(error) {
      alert(error);
    } finally {
      dispatch({type: 'FETCH_FINISHED'});
    }
  };

  const close_modal_select_cursos = () => {
    dispatch({type: 'CLOSE_MODAL'});
  }

  const open_modal_show_aluno_cursos = async (data_aluno) => {
    try {
      setCurrentInfo(data_aluno);
      dispatch({type: 'OPEN_ALUNO_CURSOS_MODAL', payload: data_aluno.nome});
      await fetchAlunoCursos(data_aluno);
    } catch(error) {
      alert(error);
    } finally {
      dispatch({type: 'FETCH_FINISHED'});
    }
  }

  const on_save_new_curso = async (curso) => {
    try{
      await api.post('/atribuirCursoAluno', {
        id_aluno: currentInfo.id,
        id_curso: curso.id,
      });
      await Promise.all([fetchAvailableCursos(currentInfo), fetchAlunoCursos(currentInfo)]);
    } catch(error) {
      alert(error);
    }
  };

  const on_remove_curso = async (curso) => {
    try{
      await api.post('/removeCursoAluno', {
        id_aluno: currentInfo.id,
        id_curso: curso.id,
      });
      await Promise.all([fetchAvailableCursos(currentInfo), fetchAlunoCursos(currentInfo)]);
    } catch(error) {
      alert(error);
    }
  };

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

  const on_update_aluno_save_press = async (updateInfo) => {
    try{
      const newUpdateInfo = remove_blank_update_info(updateInfo);
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
      setModalInfos(false);
    } catch(error) {
      console.log(error);
    }
    
  };
    

  function open_info_alunos(data_aluno){
    setCurrentInfo(data_aluno);
    setModalInfos(true);
  }

  const render_modal_select_cursos = () => {
    return (
      <ModalSelectCursos
        {...modalCursoProps}
        onClose={close_modal_select_cursos}
        availableCursos={cursos.available}
        alunoCursos={cursos.aluno}
        onAddCurso={on_save_new_curso}
        onRemoveCurso={on_remove_curso}
      />
    );
  };

  const render_modal_info_alunos = () => {
    return (
      <ModalInfoAlunos 
        title={`Editando informações de ${currentInfo.nome}`}
        onClose={() => setModalInfos(false)}
        open={modalInfos}
        onSavePress={(updateInfo) => on_update_aluno_save_press(updateInfo)}
        alunoInfo={currentInfo}
      />
    );
  };

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
        trigger={
          <Button
            icon='list'
            primary
            onClick={() => open_modal_show_aluno_cursos(data_aluno)}
          />
        }
        content="Ver cursos do aluno"
        basic
        
      />
      <Popup
        trigger={<Button icon='close' negative />}
        content="Excluir aluno"
        basic
      />
    </center>
  };

  function render_alunos(){
    return alunos.map((v)=><Table.Row>
      <Table.Cell>{v.id}</Table.Cell>
      <Table.Cell>{v.nome}</Table.Cell>
      <Table.Cell>{v.email}</Table.Cell>
      <Table.Cell>{v.cep}</Table.Cell>
      <Table.Cell>{render_actions(v)}</Table.Cell>
    </Table.Row>)
  };

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

/*
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
*/