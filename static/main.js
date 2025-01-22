console.log('main.js is connected !!!')

var roomId = document.getElementById('roomid').innerHTML

console.log('RoomId = ',roomId)
var localStream;
var remoteStream;
var peerConnection;

const constraints = {
    video: {
        width:960,
        height: 540
    },
    audio: true
}
const uid = Math.floor(Math.random()*10000)

const servers = {
    iceServers:[
        {
            urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:1930','stun:stun4.l.google.com:19302']
        }
    ]
}


var url;
var callSocket;


async function init(){
    console.log('Init Function running!!!')
    navigator.mediaDevices.getUserMedia(constraints)
    .then((mediaAStream)=>{
        localStream = mediaAStream
        document.getElementById('user-1').srcObject = localStream
    })
    .catch((error)=>{
        console.log(error)
    })
    

    if (window.location.protocol == 'https:'){
        url = 'wss://'+window.location.host+'/ws/'+roomId+'/'
    }
    else{
        url = 'ws://'+window.location.host+'/ws/'+roomId+'/'
    }

    
    callSocket = new WebSocket(url)

    callSocket.onopen =  ()=>{
        console.log('Web Socket Connection Opened !!!')
        callSocket.send(JSON.stringify({
            'type':'new_peer',
            'uid':uid,
            'message':'A New Peer Joined'    
        }))
        
    }
    
    
    callSocket.onmessage = (e)=>{
  
        var message = JSON.parse(e.data)
        
        if (message.type == 'offer' && message.uid != uid){
            console.log('An Offer received !!!',message.offer)
            createAnswer(message.offer)
        }
        if (message.type == 'answer' && message.uid != uid){
            console.log('An Answer received !!!',message.answer)
            addAnswer(message.answer)
        }
        if (message.type == 'candidate' && message.uid != uid){
            if (peerConnection){
                peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate))
            }
            
        }
        if (message.type == 'peer_left'){
            console.log('A peer has left the chat !!!')
            window.location = 'call_ended'
        }
        
        if (message.type == 'new_peer' && message.uid != uid){
            console.log('A new peer has joined the chat')

            createOffer()
        }
    }

}


async function addAnswer(answer){
    peerConnection.setRemoteDescription(answer)

}
async function createOffer(){
    peerConnection = new RTCPeerConnection(servers)
    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

    if (!localStream){
        localStream = await navigator.mediaDevices.getUserMedia(constraints)
        document.getElementById('user-1').srcObject = localStream
    }

    await localStream.getTracks().forEach((track)=>{
        peerConnection.addTrack(track,localStream)
    })
    peerConnection.ontrack = (event)=>{
        event.streams[0].getTracks().forEach((track)=>{
            remoteStream.addTrack(track)
        })
    }
    peerConnection.onicecandidate = async (event)=>{
        if (event.candidate){
            callSocket.send(JSON.stringify({'type':'candidate','candidate':event.candidate,'uid':uid}))
        }
    }

    var offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    callSocket.send(JSON.stringify({'type':'offer','offer':offer,'uid':uid}))

}
async function createAnswer(offer){
     peerConnection = new RTCPeerConnection(servers)
    var remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

    if (!localStream){
        localStream = await navigator.mediaDevices.getUserMedia(constraints)
        document.getElementById('user-1').srcObject = localStream
    }
    localStream.getTracks().forEach((track)=>{
     peerConnection.addTrack(track,localStream)   
    })
    peerConnection.ontrack =  (event)=>{
        event.streams[0].getTracks().forEach((track)=>{
            remoteStream.addTrack(track)
        })
    }
    peerConnection.onicecandidate = (event)=>{
        if (event.candidate){
            callSocket.send(JSON.stringify({'type':'candidate','candidate':event.candidate,'uid':uid}))
        }
    }
    console.log(offer)
    await peerConnection.setRemoteDescription(offer)
    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    
    callSocket.send(JSON.stringify({'type':'answer','answer':answer,'uid':uid}))

}

init()

async function toggleCamera(){
    let videoTrack = localStream.getTracks().find(track => track.kind === 'video')
    if (videoTrack.enabled){
        videoTrack.enabled = false
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(255,80,80)'
    }
    else{
        videoTrack.enabled = true
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(179,102,249,0.9)'
    }
}
async function toggleMic(){
    let audioTrack = localStream.getTracks().find(track => track.kind === 'audio')
    if (audioTrack.enabled){
        audioTrack.enabled = false
        document.getElementById('audio-btn').style.backgroundColor = 'rgb(255,80,80)'
    }
    else{
        audioTrack.enabled = true 
        document.getElementById('audio-btn').style.backgroundColor = 'rgb(179,102,249,0.9)'
    }
}
document.getElementById('camera-btn').addEventListener('click',toggleCamera)
document.getElementById('audio-btn').addEventListener('click',toggleMic)