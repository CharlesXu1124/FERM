from rest_framework import serializers
from FERM_App import models

class Resource_TypeSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            # 'id',
            'resource_type',
            # 'associated_platforms',
        )
        model = models.Resource_Type

class PlatformSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            # 'id',
            'platform',
            # 'resource_type',
        )
        model = models.Platform

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            # 'id',
            'status',
            # 'associated_designations',
        )
        model = models.Status

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'designation',
            'resource_type',
            'platform',
            'location',
            'coords',
            'status',
        )
        model = models.Resource