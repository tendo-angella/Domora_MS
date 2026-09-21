from django.db import models

from utils.models_utilities import BaseModel


class Room(BaseModel):
    """A single room belonging to one hotel (Organization)."""

    class Category(models.TextChoices):
        SINGLE = "single", "Single"
        DOUBLE = "double", "Double"
        SUITE = "suite", "Suite"
        DELUXE = "deluxe", "Deluxe"

    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.CASCADE, related_name="rooms"
    )
    room_number = models.CharField(max_length=20)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.SINGLE)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    capacity = models.PositiveIntegerField(default=1)
    is_occupied = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ("organization", "room_number")
        ordering = ["room_number"]

    def __str__(self):
        return f"{self.room_number} ({self.organization.name})"