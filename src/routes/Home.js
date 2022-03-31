import React, { useState, useEffect } from "react";
import { dbService, storageService } from "../firebase";
import TodoLists from '../components/TodoLists';

const Home = ({  }) => {
  var newArray=[];
  var newArray2=[];
  
  const [loading, setLoading] = useState(false); 
  const [todoList, setTodoList] = useState([]);  
  const [todoListSave, setTodoListSave] = useState([]);    
  
  useEffect(async() => {
    
    await dbService.collection("lists").onSnapshot((snapshot) => {
      const fbArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        page:0,
        visible:false,
        ...doc.data(),
      }));
      newArray = fbArray.filter((x) => x.isComplete === false) //미완료 데이터
      newArray = newArray.sort((a, b) => new Date(a.targetDeadline.seconds*1000).getTime() - new Date(b.targetDeadline.seconds*1000).getTime()) //시간순 정렬
      newArray2 = fbArray.filter((x) => x.isComplete === true) //완료 데이터           
      setTodoList(newArray.concat(newArray2)); //정렬된 미완료 데이터 뒤에 완료 데이터 붙이기
      setTodoListSave(newArray.concat(newArray2));    
    });
    setTimeout(function() {
      setLoading(true)
    }, 300);
    
  }, []);
  

  return (
    <>
      <TodoLists todoList={todoList} setTodoList={setTodoList} todoListSave={todoListSave} loading={loading}/>
      
    </>
  );
};
export default Home;