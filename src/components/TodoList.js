import React, { useState, useEffect } from "react";
import { dbService, storageService } from "../firebase";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const TodoList = ({ Obj,setObjForUpdate,setOpen,tags }) => {

  var cratedeDate = new Date(Obj.createdAt)
  var deadlineDate = new Date(Obj.targetDeadline.seconds*1000)
  var completeDate = new Date(Obj.completedAt)
  var today = new Date().getTime();

  const [vis,setVis] = useState(Obj.visible);
  
  useEffect(() => {
  
  }, []);

  const onDeleteClick = async () => {
    const ok = window.confirm("정말 삭제합니까?");
    if (ok) {
      await dbService.doc(`lists/${Obj.id}`).delete();  //list delete

      var tags_query = dbService.collection('tags').where('createdAt','==',Obj.createdAt); //삭제한 리스트와 같은 createdAt을 가진 tag 찾기

      tags_query.get().then(function(querySnapshot) { // 찾아서 삭제
        querySnapshot.forEach(function(doc) {
          doc.ref.delete();
        });
      });
      
    }
  };
  
  const toggleEditing = () => {
    setObjForUpdate(Obj);
    setOpen((prev) => !prev)
  };

  const onCheck = async () => {    
    await dbService.doc(`lists/${Obj.id}`).update({
      isComplete: !Obj.isComplete,
      completedAt: Obj.completedAt ? null : Date.now(),
    });
  }

  const showArticle = () => {  
    vis ? document.getElementById(Obj.id).style.display = 'none' : document.getElementById(Obj.id).style.display = 'block' 
    setVis((prev)=>!prev)
  }

  const makeTime = () => {
    
    if(Obj.isComplete)
      return '완료됨'
    if((deadlineDate.getTime() - today) < 0)
      return '시간 초과'
    const sec = Math.floor((deadlineDate.getTime() - today)/1000);
    let temp = sec;
    let count = 0;
    const unit = ["초", "분", "시간", "일"];
    while (temp > 24) {
        if (count < 2 && temp > 60) temp = Math.floor(temp / 60);
        else if (count = 2) temp = Math.floor(temp / 24);
        else return temp + unit[count] + " 남음";
        count++;
        if(count===3)
          break;
    }

    return(temp + unit[count] + " 남음")
  }

  return (
    <div className="tdl">
      <div className="tdl_header">
        <div className="checkBox"><Checkbox onClick={onCheck} checked={Obj.isComplete}/></div>
        <div className="title" onClick={showArticle}>
          <div className="titleText">{Obj.title}</div>
          <div className="titleDate" style={{color:(Math.floor((deadlineDate - today)/1000)>259200 || Obj.isComplete) ? Obj.isComplete ? '#787878' : '#079FFF' : '#ff0000'}}>{makeTime()}</div>
          {vis ? 
            <div className="titleArrow"><ArrowDropUpIcon/></div>:
            <div className="titleArrow"><ArrowDropDownIcon/></div>
          }
        </div>
      </div>
      <div className="tdl_article" id={Obj.id}>
        <div className="tagBox">
          {tags?.map((x,i)=>(
            <span key={i} style={{color:x.tagTextColor,border:'1px solid '+x.tagColor}}>#{x.tagName}<span className="tooltiptext">내용이 같은 태그는 <br/>같은 색으로 표시됩니다.</span></span>
          ))}  
        </div>
        <div className="btnBox">
          <Button onClick={onDeleteClick}>삭제</Button>
          <Button onClick={toggleEditing}>수정</Button>
        </div>
        <div className="description">
          <TextField 
            label="" 
            variant="outlined" 
            value={Obj.description}
            multiline
          />
        </div>
        <div className="date">
          <div>생성일 : {cratedeDate.getFullYear()+'년 '+(cratedeDate.getMonth()+1)+'월 '+cratedeDate.getDate()+'일 '+cratedeDate.getHours()+'시 '+cratedeDate.getMinutes()+'분'}</div>
          <div>목표일 : {deadlineDate.getFullYear()+'년 '+(deadlineDate.getMonth()+1)+'월 '+deadlineDate.getDate()+'일 '+deadlineDate.getHours()+'시 '+deadlineDate.getMinutes()+'분'}</div>
          <div>
            {Obj.isComplete ? (
              '완료일 : ' +completeDate.getFullYear()+'년 '+(completeDate.getMonth()+1)+'월 '+completeDate.getDate()+'일 '+completeDate.getHours()+'시 '+completeDate.getMinutes()+'분'
            ) : (<></>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoList;