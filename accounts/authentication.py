from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Membership


class OrganizationJWTAuthentication(JWTAuthentication):
    """Resolves the user from the JWT, then attaches their Organization
    to the request — the API equivalent of what a session-based
    OrganizationMiddleware would do.

    This has to live here, in authentication, rather than in ordinary
    Django middleware. DRF resolves request.user *inside* the view
    dispatch, after Django's middleware chain has already run — so by
    the time middleware executes, a JWT-authenticated request still
    looks anonymous. Doing the organization lookup here, right after
    the token is validated, is the only point that's guaranteed to run
    before the view sees the request.
    """

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None

        user, validated_token = result
        membership = (
            Membership.objects.select_related("organization")
            .filter(user=user)
            .first()
        )
        request.organization = membership.organization if membership else None
        request.membership = membership
        return user, validated_token


from drf_spectacular.extensions import OpenApiAuthenticationExtension


class OrganizationJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    """Tells drf-spectacular how to represent OrganizationJWTAuthentication
    in the OpenAPI schema — without this, Swagger UI has no "Authorize"
    button and no way to know this API even needs a Bearer token."""

    target_class = "accounts.authentication.OrganizationJWTAuthentication"
    name = "jwtAuth"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }