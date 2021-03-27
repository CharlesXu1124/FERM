from django.shortcuts import render
from rest_framework import generics

from FERM_App import models
from .serializers import *

class ListResources(generics.ListCreateAPIView):
    queryset = models.Resource.objects.all()
    serializer_class = ResourceSerializer

class ListResource_Type(generics.ListCreateAPIView):
    queryset = models.Resource_Type.objects.all()
    serializer_class = Resource_TypeSerializer

class ListPlatform(generics.ListCreateAPIView):
    queryset = models.Platform.objects.all()
    serializer_class = PlatformSerializer

class ListStatus(generics.ListCreateAPIView):
    queryset = models.Status.objects.all()
    serializer_class = StatusSerializer