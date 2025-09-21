function speechToTextConversion() {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Sorry, your browser does not support Speech Recognition.");
        return;
      }

      var recognition = new SpeechRecognition();
      var languageSelector = document.getElementById('language');
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      var diagnostic = document.getElementById('text');
      var micButton = document.getElementById("playButton");
      let isRecording = false;

      micButton.onclick = function () {
        if (!isRecording) {
          recognition.lang = languageSelector.value; 
          micButton.src = "Recording.png";
          recognition.start();
          isRecording = true;
          console.log("Recognition started for language:", languageSelector.value);
        } else {
          micButton.src = "mic.png";
          recognition.stop();
          isRecording = false;
          console.log("Recognition stopped.");
        }
      };

      recognition.onresult = function (event) {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        diagnostic.value = transcript.trim();

        if (diagnostic.value.trim().length > 0) {
      document.getElementById("downloadSection").style.display = "block";
    }
      };

      recognition.onnomatch = function () {
        diagnostic.value = 'I didn’t recognize that.';
      };

      recognition.onerror = function (event) {
        diagnostic.value = 'Error: ' + event.error;
      };

      document.getElementById("downloadBtn").onclick = function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("This is your Text to Speech Output:", 10, 20);
    doc.setFontSize(12);
    doc.text(diagnostic.value, 10, 40, { maxWidth: 180 });

    // Download locally
    doc.save("VoiceNotes.pdf");

    // Also send to backend (save into DB)
    let pdfBlob = doc.output("blob");

    let formData = new FormData();
    formData.append("file", pdfBlob, "VoiceNotes.pdf");

    fetch("/upload", {  // <-- Your backend endpoint
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      console.log("File saved to DB:", data);
    })
    .catch(err => console.error("Upload error:", err));
  };
    }

    
    speechToTextConversion();
    
