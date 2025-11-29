from users.models import Artisan
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView



class ArtisanStories(APIView):
    permission_classes = [AllowAny]

    def get(self,request):
        artisans = Artisan.objects.all()
        data = [
            {
                "id": artisan.id,
                "name": artisan.name,
                "short_description": artisan.short_description,
                "main_photo": artisan.main_photo.url if artisan.main_photo else None,
                "location": artisan.location,
                "about_shop": artisan.about_shop,   
            }
            for artisan in artisans
        ]
        return Response(data, status=status.HTTP_200_OK)
    
class ArtisanTestView(ListAPIView):

    permission_classes = [AllowAny]
    
    def post(self, request):
        return Response({"message": "POST request received"}, status=status.HTTP_200_OK)
    def get(self, request):
        return Response({"message": "GET request received"}, status=status.HTTP_200_OK)

