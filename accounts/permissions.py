from rest_framework.permissions import BasePermission


class HasOrganizationContext(BasePermission):
    """Blocks access unless OrganizationJWTAuthentication successfully
    attached an Organization to the request. Authentication proves who
    the user is; this proves they actually belong to a hotel.
    """

    message = "You must belong to an organization to access this resource."

    def has_permission(self, request, view):
        return bool(getattr(request, "organization", None))
