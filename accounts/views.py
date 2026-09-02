from django.contrib.auth import authenticate
from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .authentication import OrganizationJWTAuthentication
from .models import Membership, Organization, User
from .permissions import HasOrganizationContext, IsOwnerOrManager
from .serializers import (
    LoginSerializer,
    MeResponseSerializer,
    MembershipSerializer,
    RegisterResponseSerializer,
    RegisterSerializer,
    StaffCreateSerializer,
    TokenPairSerializer,
    UserSerializer,
)


class RegisterView(APIView):
    """POST /api/accounts/register/ — signs up a new hotel and its first user."""

    authentication_classes = []
    permission_classes = []

    @extend_schema(request=RegisterSerializer, responses={201: RegisterResponseSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            organization = Organization.objects.create(
                name=data["organization_name"],
                slug=data["organization_slug"],
            )
            user = User.objects.create_user(
                email=data["email"],
                password=data["password"],
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
            )
            Membership.objects.create(
                user=user, organization=organization, role=Membership.Role.OWNER
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
                "organization": {
                    "id": organization.base_uuid,
                    "name": organization.name,
                    "slug": organization.slug,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/accounts/login/ — exchanges email+password for JWT tokens."""

    authentication_classes = []
    permission_classes = []

    @extend_schema(request=LoginSerializer, responses={200: TokenPairSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh)})


class MeView(APIView):
    """GET /api/accounts/me/ — the logged-in user plus their hotel and role."""

    authentication_classes = [OrganizationJWTAuthentication]
    permission_classes = [IsAuthenticated, HasOrganizationContext]

    @extend_schema(responses={200: MeResponseSerializer})
    def get(self, request):
        return Response(
            {
                "user": UserSerializer(request.user).data,
                "organization": {
                    "id": request.organization.base_uuid,
                    "name": request.organization.name,
                    "slug": request.organization.slug,
                },
                "role": request.membership.role,
            }
        )


class StaffView(APIView):
    """GET/POST /api/accounts/staff/ — list or add employees of the
    logged-in user's hotel. Adding staff is restricted to Owner/Manager;
    unlike RegisterView, this never creates a new Organization."""

    authentication_classes = [OrganizationJWTAuthentication]
    permission_classes = [IsAuthenticated, HasOrganizationContext, IsOwnerOrManager]

    @extend_schema(responses={200: MembershipSerializer(many=True)})
    def get(self, request):
        memberships = (
            Membership.objects.filter(organization=request.organization)
            .select_related("user", "organization")
        )
        return Response(MembershipSerializer(memberships, many=True).data)

    @extend_schema(request=StaffCreateSerializer, responses={201: MembershipSerializer})
    def post(self, request):
        serializer = StaffCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            user = User.objects.create_user(
                email=data["email"],
                password=data["password"],
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
                created_by=request.user,
            )
            membership = Membership.objects.create(
                user=user,
                organization=request.organization,
                role=data["role"],
                created_by=request.user,
            )

        return Response(MembershipSerializer(membership).data, status=status.HTTP_201_CREATED)