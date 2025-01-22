import json

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
class callSocket(WebsocketConsumer):
    def connect(self):
        self.room_group_name = self.scope['url_route']['kwargs']['roomId']
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def receive(self, text_data):
        print('A message received !!!')
        text_data_json = json.loads(text_data)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type':'send_sdp',
                'message':text_data_json
                
            }
        )


    def send_sdp(self,event):
        sdp = event['message']
        self.send(text_data=json.dumps(sdp))


    def disconnect(self, code):
        
        self.close()
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type':'send_leave_msg',
                'message':{'type':'peer_left','message':'A peer has left the chat !!!','uid':'None'}
            }
        )
    def send_leave_msg(self,event):
        
        msg = event['message']
        
        self.send(text_data=json.dumps(msg))
