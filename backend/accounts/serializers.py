from rest_framework import serializers

from .models import Membership, Organization, User


class UserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="base_uuid", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name"]


class OrganizationSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="base_uuid", read_only=True)

    class Meta:
        model = Organization
        fields = ["id", "name", "slug"]


class MembershipSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="base_uuid", read_only=True)
    user = UserSerializer(read_only=True)
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ["id", "user", "organization", "role", "created_at"]


class RegisterSerializer(serializers.Serializer):
    """Signs up a new hotel: creates the Organization, the first User,
    and a Membership linking them as Owner — all in one request."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    organization_name = serializers.CharField()
    organization_slug = serializers.SlugField()

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_organization_slug(self, value):
        if Organization.objects.filter(slug=value).exists():
            raise serializers.ValidationError("This organization slug is already taken.")
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class TokenPairSerializer(serializers.Serializer):
    """Documents the {access, refresh} shape returned by login/register."""

    access = serializers.CharField()
    refresh = serializers.CharField()


class RegisterResponseSerializer(TokenPairSerializer):
    user = UserSerializer()
    organization = OrganizationSerializer()


class MeResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    organization = OrganizationSerializer()
    role = serializers.CharField()


class StaffCreateSerializer(serializers.Serializer):
    """Adds a new employee to the Owner/Manager's existing organization —
    distinct from RegisterSerializer, which creates a brand new hotel."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=Membership.Role.choices, default=Membership.Role.RECEPTIONIST)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value