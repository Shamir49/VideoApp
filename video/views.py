from django.shortcuts import redirect, render

# Create your views here.
def Home(request,roomName):
    context = {'roomName':roomName}
    return render(request,'Home.html',context)


def call_ended(request):
    return render(request,'call_ended.html',{})


def room(request):

    return render(request,'room.html',{})