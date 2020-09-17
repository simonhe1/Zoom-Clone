const socket = io("/");

const videoGrid = document.getElementById("video-grid");

const myVideo = document.createElement("video");
myVideo.muted = true;

let peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;

// Gets video and audio from browser
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;

    addVideoStream(myVideo, stream);

    answerCall(stream);

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  })
  .catch((err) => console.log(err));

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const answerCall = (stream) => {
  peer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  });
};

let message = $("input");
console.log(message);

$("html").keydown((e) => {
  // 13 is enter key
  if (e.which == 13 && message.val().length !== 0) {
    socket.emit("message", message.val());
    message.val("");
  }
});

socket.on("createMessage", (message) => {
  console.log("this is coming from server:", message);
  $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
  scrollToBottom();
});

const scrollToBottom = () => {
  let chat_window = $(".main_right_chat_window");
  chat_window.scrollTop(chat_window.prop("scrollHeight"));
};

const toggleMute = () => {
  let audio = myVideoStream.getAudioTracks()[0];
  if (audio.enabled) {
    audio.enabled = false;
    setUnmuteButton();
  } else {
    audio.enabled = true;
    setMuteButton();
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `;
  document.querySelector(".main_left_mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `;
  document.querySelector(".main_left_mute_button").innerHTML = html;
};

const toggleVideo = () => {
  let video = myVideoStream.getVideoTracks()[0];
  if (video.enabled) {
    video.enabled = false;
    setPlayButton();
  } else {
    video.enabled = true;
    setStopButton();
  }
};

const setStopButton = () => {
  const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
      `;
  document.querySelector(".main_left_video_button").innerHTML = html;
};

const setPlayButton = () => {
  const html = `
      <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
      `;
  document.querySelector(".main_left_video_button").innerHTML = html;
};
