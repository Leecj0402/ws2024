import React, { useState } from 'react';
import '../App.css';

function Form({ questions, setQuestions, registeredAnswers, setRegisteredAnswers, handleSubmit }) {
  const [currentOption, setCurrentOption] = useState('');
  const [answers, setAnswers] = useState({});

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', questionType: 'text', options: [], registered: false }]);
  };

  const handleQuestionChange = (index, event) => {
    const newQuestions = questions.map((question, i) => {
      if (i === index) {
        return { ...question, questionText: event.target.value };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const handleTypeChange = (index, event) => {
    const newQuestions = questions.map((question, i) => {
      if (i === index) {
        return { ...question, questionType: event.target.value, options: [] };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const handleOptionChange = (event) => {
    setCurrentOption(event.target.value);
  };

  const addOption = (index) => {
    const newQuestions = questions.map((question, i) => {
      if (i === index && currentOption) {
        return { ...question, options: [...question.options, currentOption] };
      }
      return question;
    });
    setQuestions(newQuestions);
    setCurrentOption('');
  };

  const deleteOption = (qIndex, optIndex) => {
    const newQuestions = questions.map((question, i) => {
      if (i === qIndex) {
        const newOptions = question.options.filter((_, oi) => oi !== optIndex);
        return { ...question, options: newOptions };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    const newRegisteredAnswers = { ...registeredAnswers };
    delete newRegisteredAnswers[index];
    setRegisteredAnswers(newRegisteredAnswers);
  };

  const handleCheckboxChange = (qIndex, optIndex, event) => {
    const selectedOptions = answers[qIndex] || [];
    const updatedOptions = event.target.checked
      ? [...selectedOptions, optIndex]
      : selectedOptions.filter((i) => i !== optIndex);
    setAnswers({ ...answers, [qIndex]: updatedOptions });
  };

  const handleAnswerChange = (index, event) => {
    setAnswers({ ...answers, [index]: event.target.value });
  };

  const registerQuestion = (index) => {
    const newQuestions = questions.map((question, i) => {
      if (i === index) {
        return { ...question, registered: true };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const submitAnswer = (index) => {
    setRegisteredAnswers({ ...registeredAnswers, [index]: answers[index] });
    alert('답변이 등록되었습니다!');
  };

  const modifyAnswer = (index) => {
    setRegisteredAnswers({ ...registeredAnswers, [index]: null });
  };

  return (
    <div>
      <h1>오합지능 성격유형검사</h1>
      <button onClick={addQuestion}>추가</button>
      {questions.map((question, index) => (
        <div key={index} className="question-container">
          {!question.registered ? (
            <>
              <input
                type="text"
                placeholder="질문을 입력하세요"
                value={question.questionText}
                onChange={(e) => handleQuestionChange(index, e)}
                className="question-input"
              />
              <select
                value={question.questionType}
                onChange={(e) => handleTypeChange(index, e)}
                className="question-select"
              >
                <option value="text">단답형</option>
                <option value="textarea">장문형</option>
                <option value="checkbox">체크박스</option>
              </select>
              {question.questionType === 'checkbox' && (
                <>
                  <div className="option-container">
                    <input
                      type="text"
                      placeholder="옵션을 입력하세요"
                      value={currentOption}
                      onChange={handleOptionChange}
                      className="option-input"
                    />
                    <button onClick={() => addOption(index)} className="add-option-button">등록 완료</button>
                  </div>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="option-container">
                      <label>
                        <input
                          type="checkbox"
                          disabled
                        />
                        {option}
                      </label>
                      <button onClick={() => deleteOption(index, optIndex)} className="delete-option-button">삭제</button>
                    </div>
                  ))}
                </>
              )}
              <button onClick={() => registerQuestion(index)} className="register-question-button">질문 등록</button>
            </>
          ) : registeredAnswers[index] === null || registeredAnswers[index] === undefined ? (
            <>
              <h3>{question.questionText}</h3>
              {question.questionType === 'text' && (
                <>
                  <input
                    type="text"
                    placeholder="답변을 입력하세요"
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e)}
                    className="answer-input"
                  />
                  <button onClick={() => submitAnswer(index)} className="submit-answer-button">답변 등록</button>
                </>
              )}
              {question.questionType === 'textarea' && (
                <>
                  <textarea
                    placeholder="답변을 입력하세요"
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e)}
                    className="answer-textarea"
                  />
                  <button onClick={() => submitAnswer(index)} className="submit-answer-button">답변 등록</button>
                </>
              )}
              {question.questionType === 'checkbox' && (
                <>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="option-container">
                      <label>
                        <input
                          type="checkbox"
                          checked={(answers[index] || []).includes(optIndex)}
                          onChange={(e) => handleCheckboxChange(index, optIndex, e)}
                        />
                        {option}
                      </label>
                    </div>
                  ))}
                  <button onClick={() => submitAnswer(index)} className="submit-answer-button">답변 등록</button>
                </>
              )}
            </>
          ) : (
            <>
              <h3>{question.questionText}</h3>
              {question.questionType === 'text' && (
                <>
                  <input
                    type="text"
                    value={registeredAnswers[index] || ''}
                    readOnly
                    className="answer-input"
                  />
                  <button onClick={() => modifyAnswer(index)} className="modify-answer-button">답변 수정</button>
                </>
              )}
              {question.questionType === 'textarea' && (
                <>
                  <textarea
                    value={registeredAnswers[index] || ''}
                    readOnly
                    className="answer-textarea"
                  />
                  <button onClick={() => modifyAnswer(index)} className="modify-answer-button">답변 수정</button>
                </>
              )}
              {question.questionType === 'checkbox' && (
                <>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="option-container">
                      <label>
                        <input
                          type="checkbox"
                          checked={(registeredAnswers[index] || []).includes(optIndex)}
                          disabled
                        />
                        {option}
                      </label>
                    </div>
                  ))}
                  <button onClick={() => modifyAnswer(index)} className="modify-answer-button">답변 수정</button>
                </>
              )}
            </>
          )}
          <button onClick={() => deleteQuestion(index)} className="delete-question-button">질문 삭제</button>
        </div>
      ))}
      <button onClick={handleSubmit} className="submit-button">제출</button>
    </div>
  );
}

export default Form;
