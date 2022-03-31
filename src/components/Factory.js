import React, { useState, useEffect } from "react";
import { storageService, dbService } from "../firebase";
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker  from '@mui/lab/DateTimePicker';

var now = new Date();

const Factory = ({ Obj,allTags,tags,setOpen }) => {  
  
  const [values, setValues] = useState({
    title: Obj?.title,
    description: Obj?.description,
    tag: '',
    tagColor:'#000000',
    tagTextColor:'#000000',
    createdAt: Obj ? Obj.createdAt : Date.now(),
    modifiedAt:  Obj?.modifiedAt,
    targetDeadline: Obj ? new Date(Obj.targetDeadline.seconds*1000) :  new Date(now.setDate(now.getDate() + 1)),
    completedAt: Obj?.completedAt,
    isComplete: Obj?.isComplete
  });  

  const [tagNames,setTagNames] = useState(tags ? (tags.map((x)=>[x.tagName])) : [])
  const [tagColors,setTagColors] = useState(tags ? (tags.map((x)=>[x.tagColor])) : [])
  const [tagTextColors,setTagTextColors] = useState(tags ? (tags.map((x)=>[x.tagTextColor])) : [])
  const [deletedTag,setDeletedTag] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(() => {  
    setLoading(false)
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    const ok = window.confirm("이대로 "+(Obj ? '수정 ' : '입력 ' )+'하시겠습니까?');
    if(ok){
      setLoading(true)
      if(Obj){ // Obj가 존재 => update하는 경우
        const tdlObj = { //update용 할 일 데이터
          title: values.title,
          description: values.description,
          modifiedAt: Date.now(),
          targetDeadline: values.targetDeadline,
          createdAt: values.createdAt,
          isComplete: values.isComplete,
          completedAt: values.completedAt,
        }; 
     
        await dbService.doc(`lists/${Obj.id}`).update({
          ...tdlObj
        });
        
        for(let i=0;i<deletedTag.length;i++){ //지워진 태그 delete
          dbService.collection("tags").doc(deletedTag[i]).delete()          
        }
        
        for(var j=tags.length-deletedTag.length;j<tagNames.length;j++){ //기존의 태그 제외하고 새로운 태그들만 add
          let tmp = null
          let tmpData = {
            tagName: tagNames[j],
            tagTextColor: tagTextColors[j],
            tagColor: tagColors[j],
            createdAt: values.createdAt,
          }
          
          tmp = allTags.filter((x)=>x.tagName === tagNames[j])  //목록에 같은 이름의 태그가 있는지 확인
          if(tmp.length>0){ // 있다면 기존의 태그로 대체
            tmpData = {
              tagName: tmp[0].tagName,
              tagTextColor: tmp[0].tagTextColor,
              tagColor: tmp[0].tagColor, 
              createdAt:values.createdAt
            }
            
          }          
          await dbService.collection("tags").add(tmpData);
        }   
        
      }
      else{ // Obj가 존재x => insert하는 경우
        const tdlObj = { //insert용 할 일 데이터
          title: values.title,
          description: values.description,
          modifiedAt: null,
          targetDeadline: values.targetDeadline,
          createdAt: values.createdAt,
          isComplete: false,
          completedAt: null,
        };

        await dbService.collection("lists").add(tdlObj);
        
        for(var i=0;i<tagNames.length;i++){ //태그 insert
          let tmp = null;
          let tmpData = {
            tagName: tagNames[i],
            tagTextColor: tagTextColors[i],
            tagColor: tagColors[i],
            createdAt: values.createdAt,
          }

          tmp = allTags.filter((x)=>x.tagName === tagNames[i])  //목록에 같은 이름의 태그가 있는지 확인      
          if(tmp.length>0){
            tmpData = {
              tagName: tmp[0].tagName,
              tagTextColor: tmp[0].tagTextColor,
              tagColor: tmp[0].tagColor, 
              createdAt:values.createdAt
            }
            
          }    
          await dbService.collection("tags").add(tmpData);
        }
        
      }
      setOpen(false)
    }        

  };

  const onChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const addTags = () => () => {  //tag validation
    if(tagNames.indexOf(values.tag)!=-1)
      alert('이미 들어간 값입니다.')  
    else if(tagNames.length > 4)
      alert('다섯 개가 최대입니다')
    else if(values.tag.length > 5 || values.tag.length < 1)
      alert('태그의 길이는 0~5글자 입니다')
    
    else{
      setTagNames([...tagNames,values.tag])    
      setTagColors([...tagColors,values.tagColor])
      setTagTextColors([...tagTextColors,values.tagTextColor])      
      setValues({ ...values, 'tag': '' })
      
    }
  }
  const deleteTags = (prop) => () => {    
    
    let tmp = tagNames.filter((x,i)=>i!=prop)    
    let tmp2 = tagColors.filter((x,i)=>i!=prop)
    let tmp3 = tagTextColors.filter((x,i)=>i!=prop)
    let tmp4 = tags.filter((x)=>x.tagName == tagNames[prop])
    setDeletedTag([...deletedTag,tmp4[0]?.id])
    setTagNames([...tmp])    
    setTagColors([...tmp2])
    setTagTextColors([...tmp3])
  }
  return (
    <form onSubmit={onSubmit} className="factory">
    {loading  ? (
      <div className="loading-container">
        <div className="loading" style={{margin:'0 auto'}}></div>
      </div>
    ) :(
      <>
        <TextField 
          label="제목" 
          variant="outlined" 
          value={values.title}
          onChange={onChange('title')}        
          inputProps={{ maxLength: 12 }}
          autoComplete="off"
          required
        />
        <TextField 
          label="추가 설명" 
          variant="outlined" 
          value={values.description}
          onChange={onChange('description')}
          maxLength={120}
          autoComplete="off"
          multiline
          rows={4}
          required
        />
        <div className="hr-sect">마감 목표일</div>
        <LocalizationProvider dateAdapter={AdapterDateFns} >
          <DateTimePicker
            disablePast
            renderInput={({ inputRef, inputProps, InputProps }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <input ref={inputRef} {...inputProps} readOnly style={{  width: '350px', height:'30px', border: '1px solid #bdbdbd' }}/>
                {InputProps?.endAdornment}
              </Box>
            )}
            label="마감 목표일" 
            value={values.targetDeadline}
            onChange={(newValue) => {
                setValues({ ...values, 'targetDeadline': newValue });
            }}
            autoComplete="off"
            required
          />
        </LocalizationProvider>      
        <div className="hr-sect">태그</div>
        <Box id="inputBox">
          <div className="selectBox">
            <FormControl>
              <InputLabel id="background-select">배경 색</InputLabel>
              <Select
                labelId="background-select"
                value={values.tagColor}
                label="color"
                onChange={onChange('tagColor')}
                style={{fontSize:'10px'}}             
              >
                <MenuItem value={'#D0021B'}>빨강</MenuItem>
                <MenuItem value={'#F5A623'}>주황</MenuItem>
                <MenuItem value={'#F8E71C'}>노랑</MenuItem>
                <MenuItem value={'#7ED321'}>초록</MenuItem>
                <MenuItem value={'#4A90E2'}>파랑</MenuItem>
                <MenuItem value={'#9C27B0'}>보라</MenuItem>
                <MenuItem value={'#000000'}>검정</MenuItem>
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel id="color-select">글자 색</InputLabel>
              <Select
                labelId="color-select"
                value={values.tagTextColor}
                label="color"
                onChange={onChange('tagTextColor')}
                style={{fontSize:'10px'}}            
              >
                <MenuItem value={'#D0021B'}>빨강</MenuItem>
                <MenuItem value={'#F5A623'}>주황</MenuItem>
                <MenuItem value={'#F8E71C'}>노랑</MenuItem>
                <MenuItem value={'#7ED321'}>초록</MenuItem>
                <MenuItem value={'#4A90E2'}>파랑</MenuItem>
                <MenuItem value={'#9C27B0'}>보라</MenuItem>
                <MenuItem value={'#000000'}>검정</MenuItem>
              </Select>
            </FormControl>
          </div>
          <TextField 
            id="tagVal"
            value={values.tag}
            onChange={onChange('tag')}
            label="태그명"                     
            autoComplete="off"          
            placeholder={values.tagColor ? '최대 5글자' : '색상을 먼저 선택하세요'}
            InputProps={{
              readOnly: values.tagColor ? false : true,
            }}
          />
          <Button onClick={addTags()}>추가</Button>
        </Box>
        <div>
          {tagNames?.map((x,i)=>(
              <div className="tagBox" key={i} style={{border:'1px solid '+tagColors[i],color:tagTextColors[i]}}>#{x} <span key={'span'+i} onClick={deleteTags(i)}>x</span></div>
          ))}  
        </div>
        
        <input type="submit" value="저장" />
      </>
    )}
    </form>
  );
};
export default Factory;