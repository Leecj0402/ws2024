import React from 'react';
import '../App.css';

function ResponseSummary({ questions, registeredAnswers, handleBackToQuestions }) {
  return (
    <div className="response-summary">
      <h1>답변 요약</h1>
      {questions.map((question, index) => (
        <div key={index} className="summary-question-container">
          <h3>{index + 1}. {question.questionText}</h3>
          {question.questionType === 'text' || question.questionType === 'textarea' ? (
            <p>{registeredAnswers[index]}</p>
          ) : question.questionType === 'checkbox' ? (
            <ul>
              {question.options.map((option, optIndex) => (
                <li key={optIndex}>
                  <input
                    type="checkbox"
                    checked={(registeredAnswers[index] || []).includes(optIndex)}
                    disabled
                  />
                  {option}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
      <button onClick={handleBackToQuestions} className="back-button">질문 페이지로 돌아가기</button>
    </div>
  );
}

export default ResponseSummary;
