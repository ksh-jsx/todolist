import React, { useState, useEffect } from "react";
import { dbService, storageService } from "../firebase";
import TodoList from "../components/TodoList";
import Factory from "../components/Factory";
import Filter from "../components/Filter"
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';

const TodoLists = ({ todoList,setTodoList,todoListSave,loading }) => {
  var newArray=[];
  var newArray2=[];
  
  const [objForUpdate, setObjForUpdate] = useState(null); //업데이트 할 데이터
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState();
  const [sortType, setSortType] = useState(false);
  const [sortText, setSortText] = useState('남은시간 순');

  const handleOpen = () => {setObjForUpdate(null);setOpen(true)};
  const handleClose = () => {
    
  if (window.confirm("닫으면 입력한 정보가 초기화됩니다. 닫으시겠습니까?")) 
      setOpen(false);
  }
  
  useEffect(() => {
    
    dbService.collection("tags").onSnapshot((snapshot) => {
      const fbArray = snapshot.docs.map((doc) => ({
        id: doc.id,        
        ...doc.data(),
      }));     
      setTags(fbArray);            
    });

    const preventGoBack = () => {
      
      if(open){
        if (window.confirm("뒤로가면 입력한 정보가 초기화됩니다. 뒤로가시겠습니까?")) 
          setOpen(false);
      }
    };
    
    window.onbeforeunload = function (e) { // 새로고침,닫기 방지
      if(open){
        return 0;
      }
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventGoBack);
    return () => window.removeEventListener('popstate', preventGoBack);

  }, [open]);
  
  const changeSort = () => { //남은시간 순, 생성 순 정렬 교체
    setSortType((prev) => !prev)
    
    if(sortType){
      newArray = todoListSave.filter((x) => x.isComplete === false)
      newArray = newArray.sort((a, b) => new Date(a.targetDeadline.seconds*1000).getTime() - new Date(b.targetDeadline.seconds*1000).getTime())
      newArray2 = todoListSave.filter((x) => x.isComplete === true)
      setSortText('남은시간 순')
    }
    else{
      newArray = todoList.sort((a, b) => a.createdAt - b.createdAt)
      setSortText('생성 순')
    }
    setTodoList(newArray.concat(newArray2));
  }

  const deleteCompleted = async() => { //완료됨 데이터 일괄 삭제
    
    const ok = window.confirm("정말 삭제합니까?");
    if (ok) {
      var lists_query = dbService.collection('lists').where('isComplete','==',true);
      lists_query.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          doc.ref.delete();
        });
      });
    }
  }

  const changeFilter = (num) =>{

    if(num === 0){
      newArray = todoListSave.filter((x) => x.createdAt > 0)      
    }
    else if(num === 1){
      newArray = todoListSave.filter((x) => x.isComplete === true)
    }
    else if(num === 2){
      newArray = todoListSave.filter((x) => (x.isComplete === false) && (((new Date(x.targetDeadline.seconds*1000).getTime()) - (new Date().getTime())) > 0))
    }
    else if(num === 3){
      newArray = todoListSave.filter((x) => (x.isComplete === false) && (((new Date(x.targetDeadline.seconds*1000).getTime()) - (new Date().getTime())) < 0))
    }
    setTodoList(newArray)
  }
  
  const Bar = React.forwardRef((props,ref) => ( //Modal warning 없애기용
    <span {...props} ref={ref}>
        {props.children}
    </span>
  ));

  return (
    <>
      <div className="container">
        <div className="addBtn">
          <Button onClick={handleOpen}>todoList 추가</Button>
        </div>
        <div className="header">
          <div>Todo List</div>
        </div>
        <div className="sortBtn">
          {todoList[0]?.page === 1  ?
            <Button onClick={deleteCompleted}>일괄삭제</Button> :
            todoList[0] ?
              <Button onClick={changeSort}>☰ {sortText}</Button> :
              <></> 
          }
        </div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Bar>
            <Factory 
              key={objForUpdate ? objForUpdate.id : 0} 
              Obj={objForUpdate} 
              allTags={tags} 
              tags={tags?.filter((y)=>y?.createdAt === objForUpdate?.createdAt)} 
              setOpen={setOpen}
            />  
          </Bar>
        </Modal>
        
        <div className="tdls">
          {loading ? (
            todoList.length>0 ? 
            todoList.map((x) => (
              <TodoList
                key={x.id}
                Obj={x} 
                setObjForUpdate={setObjForUpdate}
                setOpen={setOpen}
                tags={tags.filter((y)=>y.createdAt === x.createdAt)}
              />
            )) : 
              <div className="noData">해당 데이터 없음</div>
          ) : (
            <div className="loading-container">
              <div className="loading"></div>
            </div>
          )}
        </div>
        <div>
          <Filter changeFilter={changeFilter} setSortText={setSortText}/>
        </div>
      </div>      
    </>
  );
  
};
export default TodoLists;