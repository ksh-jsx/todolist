import React, { useState, useEffect } from "react";
import { dbService, storageService } from "../firebase";
import TodoLists from '../components/TodoLists';

const TimeOver = ({  }) => {
  var newArray=[];
  var newArray2=[];
  
  const [loading, setLoading] = useState(false); 
  const [todoList, setTodoList] = useState([]);  
  const [todoListSave, setTodoListSave] = useState([]);    
  
  useEffect(async() => {
    
    await dbService.collection("lists").onSnapshot((snapshot) => {
      const fbArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        page:3,
        visible:false,
        ...doc.data(),
      }));
      newArray = fbArray.filter((x) => (x.isComplete === false) && (((new Date(x.targetDeadline.seconds*1000).getTime()) - (new Date().getTime())) < 0)) //시간초과
      newArray = newArray.sort((a, b) => new Date(a.targetDeadline.seconds*1000).getTime() - new Date(b.targetDeadline.seconds*1000).getTime())

      setTodoList(newArray.concat(newArray2));      
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
export default TimeOver;