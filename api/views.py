import os

from django.contrib.auth import authenticate, login, logout

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Genre, Movie
from .serializers import GenreSerializer, MovieSerializer


class GenreViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAuthenticated]

    queryset = Genre.objects.all()

    serializer_class = GenreSerializer


class MovieViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAuthenticated]

    queryset = Movie.objects.all()

    serializer_class = MovieSerializer

    def get_queryset(self):

        queryset = Movie.objects.all()

        title = self.request.GET.get("title")
        genre = self.request.GET.get("genre")
        year_from = self.request.GET.get("year_from")
        year_to = self.request.GET.get("year_to")

        if title:
            queryset = queryset.filter(
                title__icontains=title
            )

        if genre:
            queryset = queryset.filter(
                genre_id=genre
            )

        if year_from:
            queryset = queryset.filter(
                release_year__gte=year_from
            )

        if year_to:
            queryset = queryset.filter(
                release_year__lte=year_to
            )

        return queryset

    def perform_destroy(self, instance):

        if instance.poster:
            if os.path.isfile(instance.poster.path):
                os.remove(instance.poster.path)

        if instance.trailer:
            if os.path.isfile(instance.trailer.path):
                os.remove(instance.trailer.path)

        instance.delete()


class LoginView(APIView):

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if user:

            login(request, user)

            return Response({
                "message": "success"
            })

        return Response(
            {
                "error": "invalid credentials"
            },
            status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        logout(request)

        return Response({
            "message": "logout success"
        })