//이 js파일은 사이트에 입력해야 하는 곳에 입력값이 있는지 없는지 확인 하는 함수
//
window.onload = function () {
  var submit = document.getElementById("form");
  //폼에 submit 이벤트가 생기면 밑에 함수 실행
  submit.addEventListener("submit", function (e) {
    // id가 form인 폼에서 데이터 들고오기
    var formData = new FormData(submit);

    //폼의 모든 key-value 쌍을 포함하는 iterator를 반환하기
    var entries = formData.entries();

    //for를 사용하는 이유 forEaach 문과 map는 특정 조건에서 멈출수가 없었어
    //forEach, map 둘다 배열에 모든 요소를 순회 할때까지 못 멈춤
    for (var entry of entries) {
      var key = entry[0];
      var value = entry[1];

      //비여있는 곳이 있이면 알람 띄우고 이벤트 멈추고
      //비어 있는 칸에 포인트 이동
      if (!value) {
        let item = document.getElementsByName(key);
        alert(key + "를(을) 입력해주세요");

        e.preventDefault();
        item[0].focus();
        return;
      }
    }
  });
};
