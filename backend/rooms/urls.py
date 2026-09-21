from django.urls import path

from .views import RoomDetailView, RoomListCreateView

urlpatterns = [
    path('', RoomListCreateView.as_view(), name='room-list-create'),
    path('<uuid:base_uuid>/', RoomDetailView.as_view(), name='room-detail'),
]