from users.models import Artisan
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from users.models import Artisan, ArtisanPhoto
from .serializers import (
    ArtisanWithProductsSerializer,
    ArtisanUpdateSerializer,
    ArtisanStorySerializer,   

)



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
    



# ------------------------------------------------------
# A. GET ALL ARTISANS + THEIR PHOTOS + LATEST PRODUCTS
# ------------------------------------------------------
class ArtisanListWithProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        artisans = Artisan.objects.all().order_by("id")
        serializer = ArtisanWithProductsSerializer(artisans, many=True)
        return Response(serializer.data)
    
class ArtisanStoryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, artisan_id):
        artisan = get_object_or_404(Artisan, id=artisan_id)
        serializer = ArtisanStorySerializer(artisan)
        return Response(serializer.data, status=200)

        

# ------------------------------------------------------
# B. EDIT ARTISAN (PATCH — partial update)
# ------------------------------------------------------
class ArtisanUpdateView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, artisan_id):
        try:
            artisan = Artisan.objects.get(id=artisan_id)
        except Artisan.DoesNotExist:
            return Response({"error": "Artisan not found"}, status=404)

        # Permission check: only artisan owner can update
        if artisan.user != request.user:
            return Response({"error": "Not allowed"}, status=403)

        serializer = ArtisanUpdateSerializer(
            artisan,
            data=request.data,   # supports text + images
            partial=True         # allows optional fields
        )

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Artisan updated successfully", "artisan": serializer.data})

        return Response(serializer.errors, status=400)

class ArtisanDeleteView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, artisan_id):
        try:
            artisan = Artisan.objects.get(id=artisan_id)
        except Artisan.DoesNotExist:
            return Response({"error": "Artisan not found"}, status=404)

        # Permission check
        if artisan.user != request.user:
            return Response({"error": "Not allowed"}, status=403)

        artisan.delete()
        return Response({"message": "Artisan deleted successfully"})

class ArtisanAddPhotoView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, artisan_id):
        try:
            artisan = Artisan.objects.get(id=artisan_id)
        except Artisan.DoesNotExist:
            return Response({"error": "Artisan not found"}, status=404)

        # Permission Check
        if artisan.user != request.user:
            return Response({"error": "Not allowed"}, status=403)

        photos = request.FILES.getlist("photos")

        if not photos:
            return Response({"error": "No photos uploaded. Use `photos[]`."}, status=400)

        created = []
        for img in photos:
            photo_obj = ArtisanPhoto.objects.create(artisan=artisan, photo=img)
            created.append({"id": photo_obj.id, "photo": photo_obj.photo.url})

        return Response({"message": "Photos uploaded", "photos": created})

class ArtisanDeletePhotoView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, photo_id):
        try:
            photo = ArtisanPhoto.objects.select_related("artisan").get(id=photo_id)
        except ArtisanPhoto.DoesNotExist:
            return Response({"error": "Photo not found"}, status=404)

        # Permission check
        if photo.artisan.user != request.user:
            return Response({"error": "Not allowed"}, status=403)

        photo.delete()
        return Response({"message": "Photo deleted successfully"})
