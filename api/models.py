from django.db import models


class Genre(models.Model):

    name = models.CharField(max_length=100)

    description = models.TextField()

    def __str__(self):
        return self.name


class Movie(models.Model):

    title = models.CharField(max_length=255)

    description = models.TextField()

    release_year = models.IntegerField()

    genre = models.ForeignKey(
        Genre,
        on_delete=models.PROTECT
    )

    poster = models.ImageField(
        upload_to='posters/'
    )

    trailer = models.FileField(
        upload_to='trailers/'
    )

    def __str__(self):
        return self.title