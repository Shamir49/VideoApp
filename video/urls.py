from django.urls import path 

from video.views import Home, room, call_ended

urlpatterns = [
    path('room/roomname=<str:roomName>',Home,name='home'),
    path('',room,name='Room'),
    path('room/call_ended',call_ended,name='call_ended'),
    
]