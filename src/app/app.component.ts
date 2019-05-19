import { Component, OnInit } from '@angular/core';
import { AngularAgoraRtcService, Stream } from 'angular-agora-rtc';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  localStream: Stream;
  remoteCalls: any  = [];
  constructor(private agoraService: AngularAgoraRtcService) {
    this.agoraService.createClient();
  }
 ngOnInit() {

 }

 /**
  * method to start a call
  */

startCall() {
  console.log('starting Call');
  this.agoraService.client.join(null, '1000', null, (uid) => {
    this.localStream =  this.agoraService.createStream(uid, true, null, null, true, false);
    this.localStream.setVideoProfile('720p_3');
    this.SubscribeToStreams();
  });
}
/***
 * endCall
 */
endCall() {
const stream = this.agoraService.client.leave();
console.log('disconnect stream', stream);
this.agoraService.client.on('stream-removed', (evnt) => {
  console.log('disconnected event', evnt);
});
// this.remoteCalls =  this.remoteCalls.filter(aCall =>  aCall !== `#agora_remote${stream.getId()}`);
}
/** subscribe to stream */
private SubscribeToStreams() {
this.localStream.on('accessAllowed', () => {
console.log('AcessAllowed');
});

this.localStream.on('accessDenied', () => {
  console.log('Access Denied');
});

this.localStream.init(() => {
console.log('got userMedia successFull');
this.localStream.play('agora_local');

this.agoraService.client.publish(this.localStream, (err) => {
console.log('Publish local stream err', err );
});

this.agoraService.client.on('strem-published', (evt) => {
console.log('stream successFully Published');
});
}, (err) => {
  console.log('getUserMedia failed, err');
});

// Another Pear id

// for another pear id

this.agoraService.client.on('error', (err) => {
  console.log('error', err.reason);
  if(err.reason === 'DYNAMIC_KEY_TIMEOUT') {
    this.agoraService.client.renewChannelKey('', () => {
      console.log('Renewed client id SuccessFully');
    }, (error) => {
      console.log('Renewed client id failed', error);
    });

  }
});

// subscribing the published stream

this.agoraService.client.on('stream-added', (event) => {
  const stream =  event.stream;
  this.agoraService.client.subscribe(stream, (err) => {
    console.log('Stream subscription failed', err);
  });
/** Push stream publisher Id on call */
this.agoraService.client.on('stream-subscribed', (event) => {
const stream  =  event.stream;
if (!this.remoteCalls.includes(`agora_remote${stream.getId()}`)) {
this.remoteCalls.push(`agora_remote${stream.getId()}`);
setTimeout(() => stream.play(`agora_remote${stream.getId()}`), 2000);
}
});
// ** On call cutt off */

this.agoraService.client.on('stream-removed', (evt) => {
  const stream  =  evt.stream;
  stream.stop();
  this.remoteCalls =  this.remoteCalls.filter(aCall =>  aCall !== `#agora_remote${stream.getId()}`);
  console.log(`Remote stream is removed ${stream.getId()}`);

});

this.agoraService.client.on('peer-leave', (evt) => {
  const stream =  evt.stream;
  if (stream) {
    stream.stop();
    this.remoteCalls = this.remoteCalls.filter(aCall => aCall === `#agora_remote${stream.getId()}`);
    console.log(`${evt.uid} left from this channel`);
  }
});
});



this.agoraService.client.on('stream-added', (event) => {
const stream =  event.stream;

})

}


}
