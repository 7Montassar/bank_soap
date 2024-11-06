from django.urls import path
from . import views
urlpatterns = [
    path('soap', views.soap_service),
]