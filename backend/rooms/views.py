from django.shortcuts import render, get_object_or_404

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.authentication import OrganizationJWTAuthentication
from accounts.permissions import HasOrganizationContext, IsOwnerOrManager

from .models import Room
from .serializers import RoomSerializer


# Create your views here.
class RoomListCreateView(APIView):
    """GET/POST /api/rooms/ — list or create rooms for the logged-in
    user's hotel. Listing is open to any staff member; creating a room
    is restricted to Owner/Manager."""

    authentication_classes = [OrganizationJWTAuthentication]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), HasOrganizationContext(), IsOwnerOrManager()]
        return [IsAuthenticated(), HasOrganizationContext()]

    @extend_schema(responses={200: RoomSerializer(many=True)})
    def get(self, request):
        rooms = Room.objects.filter(organization=request.organization)
        return Response(RoomSerializer(rooms, many=True).data)

    @extend_schema(request=RoomSerializer, responses={201: RoomSerializer})
    def post(self, request):
        serializer = RoomSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        room = serializer.save(organization=request.organization, created_by=request.user)
        return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)


class RoomDetailView(APIView):
    """GET/PUT/PATCH/DELETE /api/rooms/<uuid>/ — a single room, scoped
    to the logged-in user's hotel. The organization filter in
    get_object is what makes cross-tenant access impossible: even if
    someone from a different hotel knows this exact UUID, the lookup
    simply won't find it under their own organization."""

    authentication_classes = [OrganizationJWTAuthentication]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated(), HasOrganizationContext()]
        return [IsAuthenticated(), HasOrganizationContext(), IsOwnerOrManager()]

    def get_object(self, request, base_uuid):
        return get_object_or_404(Room, organization=request.organization, base_uuid=base_uuid)

    @extend_schema(responses={200: RoomSerializer})
    def get(self, request, base_uuid):
        room = self.get_object(request, base_uuid)
        return Response(RoomSerializer(room).data)

    @extend_schema(request=RoomSerializer, responses={200: RoomSerializer})
    def put(self, request, base_uuid):
        room = self.get_object(request, base_uuid)
        serializer = RoomSerializer(room, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    @extend_schema(request=RoomSerializer, responses={200: RoomSerializer})
    def patch(self, request, base_uuid):
        room = self.get_object(request, base_uuid)
        serializer = RoomSerializer(room, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    @extend_schema(responses={204: None})
    def delete(self, request, base_uuid):
        room = self.get_object(request, base_uuid)
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)