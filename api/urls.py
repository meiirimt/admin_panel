from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    GenreViewSet,
    MovieViewSet,
    LoginView,
    LogoutView
)
from django.contrib.auth.decorators import login_required
from django.shortcuts import render

@login_required
def index(request):
    return render(request, "index.html")

router = DefaultRouter()

router.register('genres', GenreViewSet)
router.register('movies', MovieViewSet)

urlpatterns = [
    path(
        'login/',
        LoginView.as_view()
    ),

    path(
        'logout/',
        LogoutView.as_view()
    ),
]

urlpatterns += router.urls