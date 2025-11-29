from rest_framework import serializers

class SegmentationResultSerializer(serializers.Serializer):
    assignments = serializers.ListField()
    centroids = serializers.ListField()
    features = serializers.ListField()
