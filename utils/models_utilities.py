from typing import Any
from django.db import models
import uuid


class BaseModel(models.Model):
    """Base model class with common fields and methods."""

    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_%(class)ss')
    updated_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_%(class)ss')
    is_active = models.BooleanField(default=True)
    base_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True