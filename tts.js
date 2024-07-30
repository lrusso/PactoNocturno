// https://learn.microsoft.com/en-us/azure/developer/javascript/tutorial/convert-text-to-speech-cognitive-services
// https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech?tabs=streaming

const VOICE_LANGUAGE = "en-US"
const VOICE_GENDER = "Male"
const VOICE_PITCH = "0%"
const VOICE_NAME = "ChristopherNeural"
const VOICE_DEMO_TEXT = "This is a test."

const SUBSCRIPTION_KEY = ""
const REGION_IDENTIFIER = ""
const TOKEN_GENERATOR_URL = "https://" + REGION_IDENTIFIER + ".api.cognitive.microsoft.com/sts/v1.0/issueToken"
const VOICE_LIST_URL = "https://" + REGION_IDENTIFIER + ".tts.speech.microsoft.com/cognitiveservices/voices/list"
const VOICE_GENERATOR_URL = "https://" + REGION_IDENTIFIER + ".tts.speech.microsoft.com/cognitiveservices/v1"

// --------------------------------------------------------------------

const fs = require("fs")

const deleteFileIfExists = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

deleteFileIfExists("voice.mp3")

if (!fs.existsSync("tts.txt")) {
  console.log("tts.txt not found, writing a demo tts.txt file...")
  fs.writeFileSync("tts.txt", VOICE_DEMO_TEXT)
}

let text = fs.readFileSync("tts.txt").toString().trim()
text = text.length > 0 ? text : VOICE_DEMO_TEXT

// --------------------------------------------------------------------

const getToken = async () => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  }

  const response = await fetch(TOKEN_GENERATOR_URL, requestOptions)
  const token = await response.text()

  return token
}

// --------------------------------------------------------------------

const getVoiceList = async () => {
  const requestOptions = {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  }

  const response = await fetch(VOICE_LIST_URL, requestOptions)
  const voiceList = await response.text()

  JSON.parse(voiceList).forEach((element) => {
    console.log(element.ShortName)
  })
}

// --------------------------------------------------------------------

const generateAudio = async () => {
  const token = await getToken()

  const data =
    "<speak version='1.0' xml:lang='" +
    VOICE_LANGUAGE +
    "'><voice xml:lang='" +
    VOICE_LANGUAGE +
    "' xml:gender='" +
    VOICE_GENDER +
    "' name='" +
    VOICE_LANGUAGE +
    "-" +
    VOICE_NAME +
    '\'><prosody rate="0%" pitch="' +
    VOICE_PITCH +
    '">' +
    text +
    "</prosody></voice></speak>"

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
      "X-Microsoft-OutputFormat": "audio-48khz-192kbitrate-mono-mp3",
      "Content-Type": "application/ssml+xml",
    },
    body: data,
  }

  const response = await fetch(VOICE_GENERATOR_URL, requestOptions)
  const audioFile = await response.arrayBuffer()

  fs.createWriteStream("voice.mp3").write(Buffer.from(audioFile))
}

// --------------------------------------------------------------------

generateAudio()
