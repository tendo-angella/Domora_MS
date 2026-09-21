from rest_framework import serializers

from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="base_uuid", read_only=True)

    class Meta:
        model = Room
        fields = [
            "id",
            "room_number",
            "category",
            "price_per_night",
            "capacity",
            "is_occupied",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]