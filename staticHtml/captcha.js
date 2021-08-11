const start = () => {

    var config = {
        apiKey: "AIzaSyDjm1Y1ii8m11zjzz-rwlq3siCN5Je9Om0",
        authDomain: "damaruprojects.firebaseapp.com",
        projectId: "damaruprojects",
        storageBucket: "damaruprojects.appspot.com",
        messagingSenderId: "734658626326",
        appId: "1:734658626326:web:8562051a6dd33d4a5a0637",
        measurementId: "G-KF43LVE5YW",
      };
      firebase.initializeApp(config);


  function getToken(callback) {
    var container = document.createElement("div");
    container.id = "captcha";
    document.body.appendChild(container);
    var captcha = new firebase.auth.RecaptchaVerifier("captcha", {
      size: "invisible",
      callback: function (token) {
        callback(token);
      },
      "expired-callback": function () {
        callback("");
      },
    });
    captcha.render().then(function () {
      captcha.verify();
    });
  }
  function sendTokenToApp(token) {
    var baseUri = decodeURIComponent(
      location.search.replace(/^\?appurl\=/, "")
    );
    const finalUrl = (location.href =
      baseUri + "/?token=" + encodeURIComponent(token));
    const continueBtn = document.querySelector("#continue-btn");
    console.log(finalUrl);
    // continueBtn.onclick = (event)=>{
    //     window.open(finalUrl,'_blank')
    // }
    continueBtn.style.display = "block";
  }
  document.addEventListener("DOMContentLoaded", function () {
    getToken(sendTokenToApp);
  });
};

start();
