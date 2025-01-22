from django.urls import re_path 
from . import consumers

websocket_urlpatterns = [
    re_path('ws/(?P<roomId>\w+)/$',consumers.callSocket.as_asgi())
]