import React, { useEffect, useReducer, useState, useRef } from 'react';

// components
import { Table, Button, Popup, Modal, Header, Icon, Form, List, Divider, Message, Transition } from 'semantic-ui-react'

//services
import api from '../../services/api';
import cepApi from '../../services/cepApi';

// styles
import { Container, InitialText, Float } from './styles';

// dashboard components
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
  const initalState = {nome: '', email: '', cep: ''};
  const [updateInfo, setUpdateInfo] = useState(initalState);
  const [errors, setErrors] = useState(initalState);
  const [cepLoading, setCepLoading] = useState(false);
  const [validCep, setValidCep] = useState(false);

  useEffect(() => {
    if(alunoInfo) {
      setUpdateInfo(alunoInfo);
    }
  }, [alunoInfo]);

  const clearUpdateInfo = () => {
    setUpdateInfo(initalState);
    setErrors(initalState);
    setValidCep(false);
  }

  useEffect(() => {
    if(open) {
      return;
    }
    
    clearUpdateInfo();
  }, [open]);

  const cepValidation = async (cep) => {
    let cepInfo = {};
    if(is_valid_cep(cep)) {
      const {cidade, estado, erro} = await fetchCep(`${cep}`);
      if(erro) {
        return {error: 'CEP não encontrado'};
      }
      
      cepInfo = {cidade, estado};
    } else {
      return {error: 'Formato inválido de CEP'};
    }

    return cepInfo;
  }

  const onChange = (field) => (e, {value}) => {
    if(errors[field]?.length > 0) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
    
    setUpdateInfo(prev => ({...prev, [field]: value}));
  }

  const onSubmit = async () => {
    let invalid = false;
    let newErrors = {};
    let cepInfo = {};

    if(errors?.cep.length === 0) {
      setCepLoading(true);
      cepInfo = await cepValidation(updateInfo.cep);
      if(cepInfo?.error) {
        newErrors = {...newErrors, cep: cepInfo.error};
        invalid = true;
        setValidCep(false);
      } else {
        setValidCep(true);
      }
      setCepLoading(false);
    }
    
    for(const prop in updateInfo) {
      if(updateInfo[prop].length === 0) {
        invalid = true;
        newErrors = {...newErrors, [prop]: 'Campo vazio!'}
      }
    }

    if(invalid) {
      return setErrors(prev => ({...prev, ...newErrors}));
    }

    onSavePress({...updateInfo, ...cepInfo});
  }
  
  return (
    <Modal open={open} onClose={onClose} closeIcon>
      <Header content={title} />
      <Modal.Content>
      <Form>
          <Form.Group widths='equal'>
            <Form.Input
              required
              fluid
              label='Nome'
              value={updateInfo?.nome || ''}
              onChange={onChange('nome')}
              error={errors.nome || undefined }
            />
            <Form.Input

              required
              fluid
              label='Email'
              value={updateInfo?.email || ''}
              onChange={onChange('email')}
              error={errors.email || undefined }
            />
            <Form.Input
              loading={cepLoading}
              icon={validCep ? 'check' : undefined}
              required
              fluid
              label='CEP'
              value={updateInfo?.cep || ''}
              onChange={onChange('cep')}
              error={errors.cep || undefined }
            />
          </Form.Group>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} color='red'>
          <Icon name='remove' /> Cancelar
        </Button>
        <Button color='green' onClick={onSubmit}>
          <Icon name='checkmark' /> Salvar
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

const ModalDeleteConfirmation = ({title, content, open, onConfirmPress, onClose}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>
        <Header as={'h3'}>{title}</Header>
      </Modal.Header>
      <Modal.Content>{content}</Modal.Content>
      <Modal.Actions>
        <Button content={'Cancelar'} basic primary onClick={onClose} />
        <Button negative onClick={onConfirmPress}>
          <Icon name={'trash'}/> Excluir
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

function Action({icon, onClick, popupContent, ...buttonProps}) {
  return (
    <Popup
      trigger={
        <Button
          icon={icon}
          onClick={onClick}
          {...buttonProps}
        />
      }
      content={popupContent}
      basic
    />
  );
}

// hooks
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

const useMessageReducer = () => {
  const initialState = {
    header: '',
    content: '',
    icon: '',
    positive: false,
    negative: false,
    warning: false,
    visible: false,
  }

  const reducer = (state, action) => {
    switch(action.type) {
      case 'SUCCESS': {
        return {
          ...state,
          header: action.header,
          content: action.content,
          visible: true,
          positive: true,
          icon: 'check'
        }
      }
      case 'WARNING': {
        return {
          ...state,
          header: action.header,
          content: action.content,
          visible: true,
          warning: true,
          icon: 'warning'
        }
      }
      case 'ERROR': {
        return {
          ...state,
          header: action.header,
          content: action.content,
          visible: true,
          negative: true,
          icon: 'frown outline'
        }
      }
      case 'DISMISS': {
        return {
          ...initialState,
        }
      }
      default: {
        return {
          ...state,
        }
      }
    }
  }

  return useReducer(reducer, initialState);
}

const useModalInfoAlunoReducer = () => {
  const initialState = {
    open: false,
    setting: 'creating',
    alunoInfo: undefined,
    title: '',
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'CREATE': {
        return {
          ...state,
          open: true,
          setting: 'creating',
          title: 'Cadastrando novo aluno'
        }
      }
      case 'EDIT': {
        return {
          ...state,
          open: true,
          setting: 'editing',
          alunoInfo: action.payload,
          title: `Editando informações de ${action.payload.nome}`
        }
      }
      case 'CLOSE': {
        return {
          ...initialState,
          open: false,
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

// functions
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

async function fetchCep(cep) {
  const response = await cepApi.get(cep);
  const {
    localidade: cidade,
    uf: estado,
    erro
  } = response.data;

  return {cidade, estado, erro};
};

const is_empty_update_info = (updateInfo) => (Object.keys(updateInfo).length === 0);

const Dashboard = () => {
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState({aluno: [], available: []});
  const [currentInfo, setCurrentInfo] = useState([]);
  const [refreshAlunos, setRefreshAlunos] = useState(true);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [modalCursoState, dispatchModalCurso] = useModalCursoReducer(currentInfo.name);
  const [messageState, dispatchMessage]= useMessageReducer();
  const [modalInfoAlunoState, dispatchModalInfoAluno] = useModalInfoAlunoReducer();

  useEffect(()=>{
    async function fetchData() {
      try{
        const response = await api.get('/alunos');
        setAlunos(response.data);
      } catch {
        alert('Confira a api');
      }
    }

    if(refreshAlunos) {
      fetchData();
      setRefreshAlunos(false);
    }

  }, [refreshAlunos]);

  useEffect(() => {
    if(messageState.visible) {
      setTimeout(() => {
        return dispatchMessage({type: 'DISMISS'});
      }, 2000);
    };
  }, [messageState, dispatchMessage]);

  async function fetchCursos({id, endpoint}) {
    try {
      const response = await api.post(`${endpoint}`, { id });
      return response.data;
    }catch(error) {
      // TODO: Show error better
      alert(error);
    }
  }

  async function fetchAvailableCursos({id}) {
    const response = await fetchCursos({id, endpoint: '/getAvailableCursos'});
    setCursos(prev => ({...prev, available: response}));
  };

  async function fetchAlunoCursos({id}) {
    const response = await fetchCursos({ id, endpoint: '/getCursos'});
    setCursos(prev => ({...prev, aluno: response}));
  };

  async function fetchAllCursos(data_aluno) {
    return Promise.all([
      fetchAvailableCursos(data_aluno),
      fetchAlunoCursos(data_aluno)
    ]);
  }

  async function open_modal_select_cursos(data_aluno) {
    try{
      setCurrentInfo(data_aluno);
      dispatchModalCurso({type: 'OPEN_SELECT_CURSOS_MODAL', payload: data_aluno.nome});
      await fetchAllCursos(data_aluno);
    } catch(error) {
      alert(error);
    } finally {
      dispatchModalCurso({type: 'FETCH_FINISHED'});
    }
  };

  async function open_modal_aluno_cursos(data_aluno) {
    try {
      setCurrentInfo(data_aluno);
      dispatchModalCurso({type: 'OPEN_ALUNO_CURSOS_MODAL', payload: data_aluno.nome});
      await fetchAlunoCursos(data_aluno);
    } catch(error) {
      alert(error);
    } finally {
      dispatchModalCurso({type: 'FETCH_FINISHED'});
    }
  }

  const close_modal_cursos = () => {
    dispatchModalCurso({type: 'CLOSE_MODAL'});
  }

  async function change_curso_assign({curso, endpoint}) {
    try {
      await api.post(`${endpoint}`, {
        id_aluno: currentInfo.id,
        id_curso: curso.id
      });
      await fetchAllCursos(currentInfo);
    }catch(error) {
      alert(error);
    }
  }

  async function on_assign_new_curso(curso) {
    await change_curso_assign({curso, endpoint: '/atribuirCursoAluno'});
  };

  const on_remove_assigned_curso = async (curso) => {
    await change_curso_assign({curso, endpoint: '/removeCursoAluno'});
  };

  const on_update_aluno_save_press = async (updateInfo) => {
    try{
      if(modalInfoAlunoState.setting === 'editing') {
        await api.post('/updateAluno', updateInfo);
      } else {
        await api.post('/novoAluno', updateInfo);
        dispatchMessage({
          type: 'SUCCESS',
          header: 'Aluno cadastrado com sucesso',
          content: `O aluno ${updateInfo.nome} foi inserido no sistema`
        });
      }
      setRefreshAlunos(true);
      dispatchModalInfoAluno({type: 'CLOSE'});
    } catch(error) {
      alert(error);
    }
    
  };
    

  function open_edit_info_aluno_modal(data_aluno){
    setCurrentInfo(data_aluno);
    dispatchModalInfoAluno({type: 'EDIT', payload: data_aluno});
  }

  function close_info_aluno_modal() {
    dispatchModalInfoAluno({type: 'CLOSE'});
  }

  function open_register_aluno_modal() {
    dispatchModalInfoAluno({type: 'CREATE'});
  }

  function open_delete_aluno_confirmation_modal(data_aluno) {
    setCurrentInfo(data_aluno);
    setOpenDeleteConfirmation(true);
  }

  async function on_confirm_delete_aluno() {
    await api.post('/excluirAluno', {
      id: currentInfo.id,
    });
    setRefreshAlunos(true);
    setOpenDeleteConfirmation(false);
    dispatchMessage({
      type: 'SUCCESS',
      header: 'Aluno excluído com sucesso',
      content: 'O aluno foi excluido de forma permanente.'
    });
  }

  function close_delete_aluno_confirmation_modal() {
    setOpenDeleteConfirmation(false);
  }

  function Actions({data_aluno}) {
    return (
      <center>
        <Action
          icon={'edit'}
          onClick={() => open_edit_info_aluno_modal(data_aluno)}
          popupContent={'Editar informações'}
        />
        <Action
          icon={'plus'}
          onClick={() => open_modal_select_cursos(data_aluno)}
          popupContent={'Adicionar curso para aluno'}
          positive
        />
        <Action 
          icon={'list'}
          onClick={() => open_modal_aluno_cursos(data_aluno)}
          popupContent={'Ver cursos do aluno'}
          primary
        />
        <Action
          icon={'close'}
          onClick={() => open_delete_aluno_confirmation_modal(data_aluno)}
          popupContent={'Excluir aluno'}
          negative
        />
      </center>
    )
  };

  function Alunos(){
    return alunos.map((aluno) => (
      <Table.Row key={aluno.id}>
        <Table.Cell>{aluno.id}</Table.Cell>
        <Table.Cell>{aluno.nome}</Table.Cell>
        <Table.Cell>{aluno.email}</Table.Cell>
        <Table.Cell>{aluno.cep}</Table.Cell>
        <Table.Cell>
          <Actions data_aluno={aluno} />
        </Table.Cell>
      </Table.Row>
    ))
  };

  const close_message = () => {
    dispatchMessage({type: 'DISMISS'});
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
            { alunos.length > 0 ? <Alunos /> : <h3>Nenhum dado registrado </h3> }
          </Table.Body>
        </Table>
        <ModalInfoAlunos 
          onClose={close_info_aluno_modal}
          onSavePress={on_update_aluno_save_press}
          {...modalInfoAlunoState}
        />
        <ModalSelectCursos
          {...modalCursoState}
          onClose={close_modal_cursos}
          availableCursos={cursos.available}
          alunoCursos={cursos.aluno}
          onAddCurso={on_assign_new_curso}
          onRemoveCurso={on_remove_assigned_curso}
        />
        <ModalDeleteConfirmation
          open={openDeleteConfirmation}
          title={`Deseja realmente excluir ${currentInfo.nome} ?`}
          content={'O aluno será excluido de modo permanente.'}
          onClose={close_delete_aluno_confirmation_modal}
          onConfirmPress={on_confirm_delete_aluno}
        />
        <Button primary onClick={open_register_aluno_modal}>Adicionar aluno</Button>
        <Button href="/" secondary>Ver instruções</Button>
      </Container>
      <Transition.Group
        animation={'fade down'}
        duration={400}
      >
        {messageState.visible && (
          <Float>
            <Message
              icon={<Icon name={messageState.icon} />}
              onDismiss={close_message}
              {...messageState}
            />
          </Float>
          
        )}
      </Transition.Group>
    </>
  );
};

export default Dashboard;


// Test

// const render_delete_confirmation_modal = () => {
  //   return (
  //     <ModalDeleteConfirmation
  //       open={openDeleteConfirmation}
  //       title={`Deseja realmente excluir ${currentInfo.nome} ?`}
  //       content={'O aluno será excluido de modo permanente.'}
  //       onClose={close_delete_aluno_confirmation_modal}
  //       onConfirmPress={on_confirm_delete_aluno}
  //     />
  //   );
  // }

  // const render_modal_select_cursos = () => {
  //   return (
  //     <ModalSelectCursos
  //       {...modalCursoState}
  //       onClose={close_modal_cursos}
  //       availableCursos={cursos.available}
  //       alunoCursos={cursos.aluno}
  //       onAddCurso={on_assign_new_curso}
  //       onRemoveCurso={on_remove_assigned_curso}
  //     />
  //   );
  // };

  // const render_modal_info_alunos = () => {
  //   return (
  //     <ModalInfoAlunos 
  //       // title={`Editando informações de ${currentInfo.nome}`}
  //       onClose={close_info_aluno_modal}
  //       // open={modalInfos}
  //       onSavePress={(updateInfo) => on_update_aluno_save_press(updateInfo)}
  //       // alunoInfo={currentInfo}
  //       {...modalInfoAlunoState}
  //     />
  //   );
  // };

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