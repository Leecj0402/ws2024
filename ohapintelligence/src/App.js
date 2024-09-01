import React, { useState } from 'react';
import Form from './components/Form';
import ResponseSummary from './components/ResponseSummary';
import './App.css';

function App() {
  const [showSummary, setShowSummary] = useState(false);  // 결과 페이지를 표시할지 여부를 관리
  const [questions, setQuestions] = useState([]);  // 질문 목록을 관리
  const [registeredAnswers, setRegisteredAnswers] = useState({});  // 등록된 답변을 관리

  const handleSubmit = () => {
    setShowSummary(true);  // 제출 버튼을 클릭하면 결과 페이지를 표시하기
  };

  const handleBackToQuestions = () => {
    setShowSummary(false);  // 질문 페이지로 돌아가기 버튼을 클릭하면 질문 페이지를 다시 표시하기
  };

  return (
    <div className="App">
      {!showSummary ? (
        <Form
          questions={questions}
          setQuestions={setQuestions}
          registeredAnswers={registeredAnswers}
          setRegisteredAnswers={setRegisteredAnswers}
          handleSubmit={handleSubmit}  // 제출 버튼 클릭 시 호출되는 함수 전달
        />
      ) : (
        <ResponseSummary
          questions={questions}
          registeredAnswers={registeredAnswers}
          handleBackToQuestions={handleBackToQuestions}  // 질문 페이지로 돌아가기 버튼 클릭 시 호출되는 함수 전달
        />
      )}
    </div>
  );
}

export default App;
