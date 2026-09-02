from rest_framework.permissions import BasePermission

from .models import Membership


class HasOrganizationContext(BasePermission):
    """Blocks access unless OrganizationJWTAuthentication successfully
    attached an Organization to the request. Authentication proves who
    the user is; this proves they actually belong to a hotel.
    """

    message = "You must belong to an organization to access this resource."

    def has_permission(self, request, view):
        return bool(getattr(request, "organization", None))


class IsOwnerOrManager(BasePermission):
    """Restricts an endpoint to the Owner or Manager of the current
    organization — e.g. only they should be able to add new staff.
    Relies on request.membership, set by OrganizationJWTAuthentication.
    """

    message = "Only an owner or manager can manage staff."

    def has_permission(self, request, view):
        membership = getattr(request, "membership", None)
        return bool(
            membership and membership.role in (Membership.Role.OWNER, Membership.Role.MANAGER)
        )