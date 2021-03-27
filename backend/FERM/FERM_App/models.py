from django.db import models

# this will have an #id and name of a fire (i.e. Biscuit Fire)
class Fire(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
# designation is the specific id assigned to a resource for that fire
# resource types could be hand crew, tender, fire engine, support chopper, fire-suppression chopper, slurry plane, etc
# platform is the specific type of resource like hot shots, huey, 747, 1000 gal tender, or other make/model
# location is generic location like town or road
# coords is exact long,lat location
# status will display things like en-route to base/work area, working, refilling, refueling, broke down, availability
class Resource(models.Model):
    id = models.AutoField(primary_key=True)
    designation = models.CharField( max_length=50)
    resource_type = models.ManytoManyField('Resource_Type', blank=True)
    platform = models.ManyToManyField('Platform', blank=True)
    location = models.CharField(max_length=100)
    coords = models.CharField(max_length=50)    # fix this to require correct formatting
    status = models.ManyToManyField('Status', blank=True)

    def __str__(self):
        return self.designation
    
class Resource_Type(models.Model):
    resource_type = models.CharField(max_length=50)

    def __str__(self):
        return self.resource_type

class Platform(models.Model):
    platform = models.CharField(max_length=100)
    
    def __str__(self):
        return self.platform

class Status(model.Models):
    status = models.CharField(max_length=100)

    def __str__(self):
        return self.status
    
    
