import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = ({ changeFilter,setSortText }) => {

  const obj = document.getElementsByClassName('filter');

  useEffect(() => {  
    var url = document.location.href; 
    var qs = url.slice(-1); 
    if(qs ==='/') qs = 0    
    obj[qs].style.borderTop = '0';
    obj[qs].style.backgroundColor = '#FFFFFF';
    obj[qs].style.boxShadow = 'rgba(0, 0, 0, 0.1) -5px 7px 8px'
  }, []);
  
  const onClickTab = (prop) => (event) => {
      
    for(var i=0;i<4;i++){
        obj[i].style.borderTop = '1px solid #bdbdbd'
        obj[i].style.backgroundColor = '#F5F5F5';
        obj[i].style.boxShadow = '0px 0px 0px'
    }

    event.target.style.borderTop = '0';
    event.target.style.backgroundColor = '#FFFFFF';
    event.target.style.boxShadow = 'rgba(0, 0, 0, 0.1) -5px 7px 8px'
    
    changeFilter(prop)
    setSortText('남은시간 순')
  }

  return (
    <div className="filters">
        <Link to="/" onClick={onClickTab(0)} className="filter">전체</Link>
        <Link to="/1" onClick={onClickTab(1)} className="filter">완료됨</Link>
        <Link to="/2" onClick={onClickTab(2)} className="filter">진행중</Link>
        <Link to="/3" onClick={onClickTab(3)} className="filter">시간 초과</Link>
    </div>
  );
};
export default Home;