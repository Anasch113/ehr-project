import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { AiOutlineSend } from "react-icons/ai";
import axios from "axios";
import emailjs from "emailjs-com";
import "../Styles/Chat.css";
import availableLanguages from "./Languages";
import OpenAI from "openai";
import { useMedicalId } from "./MedicalIdProvider";
import { useNavigate } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";
import { useLocation } from "react-router-dom";


const openai = new OpenAI({
  apiKey: process.env.REACT_APP_API_KEY,
  dangerouslyAllowBrowser: true,
});

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [IsRequest, setIsRequest] = useState(false);
  const [isError, setisError] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US"); // Default language
  const [listening, setislistening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setrecognition] = useState("");
  const [isend, setIsEnd] = useState(false); // for rendering messages at the end
  const [summaryData, setSummaryData] = useState("")
  const chatContainerRef = useRef(null);
  const location = useLocation();
  
  
  const synth = window.speechSynthesis;

  const silenceTimerRef = useRef(null);
  const silenceTimeoutDuration = 2000;

  const navigate = useNavigate();
  const { validMedicalId } = useMedicalId();

  useEffect(() => {
    if (!validMedicalId) {
      navigate("/");
    } else {
      const welcomeMessage =
        "Hello! Welcome to the EHR Assistant. How can I assist you today?";
      const initialMessage = {
        id: Math.random(),
        text: welcomeMessage,
        isUser: false,
      };
      setMessages([initialMessage]);
      speakText(welcomeMessage);
    }
  }, [validMedicalId, navigate]);

  useEffect(() => {
    setNewMessage(transcript);

    if (transcript !== "") {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        handleSilenceTimeout();
      }, silenceTimeoutDuration);
    }
  }, [transcript]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
    if (IsRequest) {
      console.log("Message to be processed: ", newMessage);
      // New Message Proceeding
      ProcessInput(newMessage);
    }
  }, [messages]);

  const handleSilenceTimeout = () => {
    console.log("Transcript is Stopped so time to send request");
    console.log("Transcript: ", transcript);
    if (transcript !== "") {
      const message = {
        id: Math.random(),
        text: transcript,
        isUser: true,
      };
      setIsRequest(true);
      setMessages([...messages, message]);
      handleVoiceInput("off");
    }
  };

  function SendEmail(_body) {
    console.log("Sending Email......");
    const serviceId = process.env.REACT_APP_SERVICE_ID;
    const templateId = process.env.REACT_APP_TEMPLATE_ID;
    const userId = process.env.REACT_APP_USER_ID;
    const owner_email = process.env.REACT_APP_OWNER_EMAIL;
    const templateParams = {
      to_name: "Admin",
      message: _body,
      to_mail: owner_email,
    };
    emailjs.send(serviceId, templateId, templateParams, userId).then(
      (response) => {
       
      },
      (error) => {
       
        
        return;
      }
    );
  }

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleVoiceInput = (str) => {
    if (str === "off") {
      setislistening(false);
      if (!recognition) {
        
        return;
      }
      recognition.stop();
    } else {
      if (!listening) {
        const recognition_ = new window.webkitSpeechRecognition();
        setrecognition(recognition_);
        console.log("Listening..........");
        setislistening(true);
        recognition_.continuous = true;
        recognition_.interimResults = true;
        recognition_.lang = selectedLanguage;
        recognition_.onresult = (event) => {
          const transcript_ = event.results[0][0].transcript;
          setTranscript(transcript_);
          setNewMessage(transcript_);
        };
        recognition_.start();
      } else {
        console.log("Turning Off....");
        setislistening(false);
        recognition.stop();
      }
    }
  };

  function speakText(text) {
    console.log("AI is speaking.....");
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.pitch = 1;

    utterance.onend = () => {
      handleVoiceInput();
    };
    synth.speak(utterance);
  }

  const simulateResponse = (userMessage) => {
    setIsRequest(false);
    const responseMessage = {
      id: Math.random(),
      text: `${userMessage}`,
      isUser: false,
    };
    setMessages([...messages, responseMessage]);
    speakText(userMessage);
  };

  // First Call to api for asking questions
  const ProcessInput = async (Input) => {
    setNewMessage("");
    const abstract =
      "You will act as a Human Nurse Pro, a Professional nurse that will be asking the below predetermined questions from each patient to know about there health. Ask the question one by one and wait until the patient answers each of the questions before you proceed to other. After the introduction 'Hello, welcome to EHR Nurse Assistant, how are you feeling today' then once the patient reply your next reply should start asking the question given below. the questions are: 1. What is the main reason you will be seeing the doctor today2. Tell us as much as you can about the current problem. Let the user replied.3. What other medical problems do you have for which you have to take medications? Let the user replied.4. Have you had any surgeries? If so, tell me about the surgeries and dates or years if you can. Let the user replied.5. Are you allergic to any medicines or foods6. Are you married, single, divorced or separated?7. Do you smoke? if so how much?8. Do you drink alcohol? if so how much?9. Do you use any street drugs? if so which one and for how long?10. Do you take any medications on an ongoing basis? if yes, please state the names and the doses?11. What medical problems if any does your father suffer from?12. What medical problems if any does your mother suffer from?13. What medical problems if any do your sibling suffer from?14. Are you a woman? If yes, how many times have you been pregnant?15. if yes How many children do you have.16. if yes How many miscarriages or abortions have you had.17. Is there anything else you would like your doctor to know about you or your medical condition? Note: Make sure you are the one asking the questions. And never repeat any question that is answered, Becareful in detecting questions that is already answered";
    const transformedMessages = [
      { role: "system", content: abstract },
      ...messages.map((message) => ({
        role: message.isUser ? "user" : "assistant",
        content: message.text,
      })),
    ];

    console.log("Request: ", transformedMessages);
    // Sending the request to chatGPT api
    const completion = await openai.chat.completions.create({
      messages: transformedMessages,
      model: "gpt-3.5-turbo",
    });

    // // Extracting the response and summary
    const response = completion.choices[0].message.content;
    const summary = extractSummaryFromResponse(transformedMessages);
    console.log("Response: ", response);
    simulateResponse(response);

    setTranscript("");
  };


  // Extracting summary from the response
const extractSummaryFromResponse = (transformedMessages) => {
  // Find all user responses
  const userResponses = transformedMessages
    .filter((message) => message.role === 'user')
    .map((userMessage) => userMessage.content);

  // Extract key points from user responses
  const keyPoints = userResponses.map((response) => {
   

    return response;
  });

  // Combine key points into the final summary
  const summary = keyPoints.join(', ');

  return summary;
};
  

  const EndChat = async () => {
    if (messages.length === 0) {
      handleVoiceInput("off");
      return;


    }

    // Second Call for summary
    const abstract =
    "You will act as a Human Nurse Pro, a Professional nurse that will be asking the below predetermined questions from each patient to know about there health. Ask the question one by one and wait until the patient answers each of the questions before you proceed to other. After the introduction 'Hello, welcome to EHR Nurse Assistant, how are you feeling today' then once the patient reply your next reply should start asking the question given below. the questions are: 1. What is the main reason you will be seeing the doctor today2. Tell us as much as you can about the current problem. Let the user replied.3. What other medical problems do you have for which you have to take medications? Let the user replied.4. Have you had any surgeries? If so, tell me about the surgeries and dates or years if you can. Let the user replied.5. Are you allergic to any medicines or foods6. Are you married, single, divorced or separated?7. Do you smoke? if so how much?8. Do you drink alcohol? if so how much?9. Do you use any street drugs? if so which one and for how long?10. Do you take any medications on an ongoing basis? if yes, please state the names and the doses?11. What medical problems if any does your father suffer from?12. What medical problems if any does your mother suffer from?13. What medical problems if any do your sibling suffer from?14. Are you a woman? If yes, how many times have you been pregnant?15. if yes How many children do you have.16. if yes How many miscarriages or abortions have you had.17. Is there anything else you would like your doctor to know about you or your medical condition? Note: Make sure you are the one asking the questions. And never repeat any question that is answered, Becareful in detecting questions that is already answered";;
    const command = 
      "Create a JSON summary of the medical consultation based on user response given in the previous chat. Print the user response according to these following questions 1. a AI: What is the main reason you will be seeing the doctor today. b. (print: Presenting complaints 2. Tell us as much as you can about the current problem. Print: History of presenting complaints 3. What other medical problems do you have for which you have to take medications? Print: History of presenting complaints 4. Have you had any surgeries? If so, tell me about the surgeries and dates or years if you can. Print: Past surgical history 5. Are you allergic to any medicines or foods Print: Allergies 6. Are you married, single, divorced or separated? Print: Marital history 7. Do you smoke? if so how much? Print: Smoking history 8. Do you drink alcohol? if so how much? a. Print: Alcohol use: 9. Do you use any street drugs? if so which one and for how long? a. Use of illicit drugs: 10. Do you take any medications on an ongoing basis? if yes, please state the names and the doses a. Print: Medications b. 11. What medical problems if any does your father suffer from? a. Father’s medical history 12. What medical problems if any does your mother suffer from? a. Mother’s medical history 13. What medical problems if any do your sibling suffer from? a. Other social history 14. Are you a woman? If yes, how many times have you been pregnant? a. Number of pregnancies 15. Are you a woman? if yes How many children do you have. a. Number of living children 16. Are you a woman? if yes How many miscarriages or abortions have you had. How many miscarriages 17. Is there anything else you would like your doctor to know about you or your medical condition? Print: other relevant medical history. And please print the N/A if the user not replies for the specific question. ";
    handleVoiceInput("off");
    const Messages = [
      { role: "system", content: abstract },
      ...messages.map((message) => ({
        role: message.isUser ? "user" : "assistant",
        content: message.text,
      })),
      { role: "user", content: command },
    ];
    console.log("Complete Chat: ", Messages);
    const completion = await openai.chat.completions.create({
      messages: Messages,
      model: "gpt-3.5-turbo",
    });
    const JSON_summary = completion.choices[0].message.content;
    console.log("JSON Summary: ", JSON_summary);
    setSummaryData(JSON_summary);
    


    SendEmail(summaryData);
    setIsEnd(true);
    
  };
  useEffect(() => {
  
}, [summaryData]);

  const handleSend = (e) => {
    e.preventDefault();
    setisError(false);
    if (newMessage.trim() === "") return;

    const message = {
      id: Math.random(),
      text: newMessage,
      isUser: true,
    };
    handleVoiceInput("off");
    setIsRequest(true);
    setMessages([...messages, message]);
  };

  const ClearChat = () => {
    setMessages([]);
  };



  
  const handleGenerateSummary = async () => {


    if (summaryData) {
      try {
        await  sendSummaryToAPI(summaryData);
       
        navigate("/summary", { state: { summary: summaryData } });
        
      } catch (error) {
       
      }

     
    }
  };


  // Coverting the response into simple js objects
  const convertResponseToObject = (responseArray) => {
    const responseObject = {};
  
    for (const [key, value] of Object.entries(responseArray)) {
      responseObject[key] = value;
    }
  
    return responseObject;
  };
  
  const sendSummaryToAPI = async (summary) => {
    const medicalId = new URLSearchParams(location.search).get('unin');
  console.log(medicalId)
  try {
    const apiEndpoint = "https://api.pamojapanafrica.com/ai_patient_data_insert.php";

   
    const headers = {
      "Content-Type": "application/json",
     
    };

 
    const requestBody = {
      mrn: medicalId,
      summary,
     
    };

    
    const response = await axios.post(apiEndpoint, requestBody, { headers });
    
console.log("Summary sent to database", response.data)
    
   
    
  
  } catch (error) {
    // Handle errors
   
    throw new Error("Failed to send summary to the API");
  }
};





  
  return (
    <div className="chat-app">
      <div className="navbar">
        <div className="py-6 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 text-center text-4xl ">
          PAMOJA PAN-AFRICA AI PATHWAY
        </div>
      </div>
      <div className="chat-container chatbox-container">
        <div className="bg-blue-100 chatbox  px-20 overflow-y-auto scroll-smooth pt-5 pb-32 rounded-3xl max-w-screen-xl w-full h-[80vh]">
          <div className="response-container" ref={chatContainerRef}>
            <div className="flex items-center justify-between w-full">
              <div className="language-select">
                <label htmlFor="languageSelect">Select Language: </label>
                <select
                  id="languageSelect"
                  value={selectedLanguage}
                  className="px-3 py-2 rounded-lg"
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="btn-div flex items-center gap-[2rem]">
                <button
                  onClick={ClearChat}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 text-white hover:scale-105 ease-in duration-200  py-3 "
                >
                  Clear Chat
                </button>
                <button
                  onClick={EndChat}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 text-white hover:scale-105 ease-in duration-200  py-3 "
                >
                  End Chat
                </button>
              </div>
            </div>
            {
              messages.map((message) => (
                
                <div
                  key={message.id}
                  className={`message ${message.isUser ? "user" : "gpt"}`}
                >
                  <span className="text-[16px] font-[600] text-black uppercase mb-[1rem] flex justify-center items-center mx-auto bg-white max-w-[100px] rounded-full py-[5px]">
                    {message.isUser ? "Patient" : "AI"}
                  </span>
                  <div className="message-text">{message.text}</div>
                  <div className="message-timestamp">{message.timestamp}</div>
                </div>
              ))}

            {/* Summary Tasks */}
           
           { isend ? (
            <div className="flex items-start justify-center">
   <button onClick={handleGenerateSummary}  className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 text-white hover:scale-105 ease-in duration-200  py-3  items-center justify-center  ">Generate Summary</button>
   </div>
           ) : (
            <><p></p></>
           )
          }



          </div>
          <div className="bg-blue-100  w-full pb-5 ">
            <div className="bottom-8  right-0  left-0 max-w-screen-xl mx-auto fixed">
              <div className="input-container rounded-b-3xl  bg-blue-100">
                <input
                  className="chat-inp focus:outline-none"
                  type="text"
                  placeholder={
                    listening ? "Listening...." : "Enter a prompt here"
                  }
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSend(e);
                    }
                  }}
                />
                <div >
         
                  <FontAwesomeIcon
                    onClick={handleVoiceInput}
                    icon={faMicrophone}
                    className={`mic ${
                      listening ? "listening" : "not-listening"
                    }`}
                  />
                 
                </div>
              </div>
            </div>
          </div>

          {isError ? (
            <p className="error">
              Browser does not support speech recognition.
            </p>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatApp;
