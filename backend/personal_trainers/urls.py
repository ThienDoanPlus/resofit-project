from django.urls import path
from .views import MyMembersListView

urlpatterns = [
    path('my-members/', MyMembersListView.as_view(), name='my_members'),
]