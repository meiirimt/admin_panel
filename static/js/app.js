

// ================= API =================
const GENRES_URL = "/api/genres/";
const MOVIES_URL = "/api/movies/";

// ================= CSRF =================
function getCookie(name) {
    let cookieValue = null;

    if (document.cookie) {
        document.cookie.split(";").forEach(cookie => {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.split("=")[1]);
            }
        });
    }

    return cookieValue;
}

const csrftoken = getCookie("csrftoken");

// ================= HELPER =================
function el(id) {
    return document.getElementById(id);
}

// ================= AUTH CHECK =================
async function checkAuth() {
    try {
        const res = await fetch("/api/genres/", {
            credentials: "include"
        });

        if (res.status === 401 || res.status === 403) {
            window.location.href = "/login/";
        }
    } catch (err) {
        console.error("auth error", err);
        window.location.href = "/login/";
    }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = el("logoutBtn");
    const genresBtn = el("genresBtn");
    const moviesBtn = el("moviesBtn");

    if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
    if (genresBtn) genresBtn.addEventListener("click", showGenres);
    if (moviesBtn) moviesBtn.addEventListener("click", showMovies);

    checkAuth();
    loadGenres();
    loadMovies();
});

// ================= GENRES =================
async function loadGenres() {

    const res = await fetch(GENRES_URL, {
        credentials: "include"
    });

    if (!res.ok) return;

    const genres = await res.json();

    const table = el("genresTable");
    if (!table) return;

    table.innerHTML = genres.map(g => `
        <tr>
            <td>${g.id}</td>
            <td>${g.name}</td>
            <td>${g.description}</td>
            <td>
                <button onclick="editGenre(${g.id})">Edit</button>
                <button onclick="deleteGenre(${g.id})">Delete</button>
            </td>
        </tr>
    `).join("");

    const filter = el("movieGenreFilter");
    const select = el("movieGenre");

    if (filter) {
        filter.innerHTML =
            `<option value="">All</option>` +
            genres.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
    }

    if (select) {
        select.innerHTML =
            genres.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
    }
}

// ================= CREATE GENRE =================
async function createGenre() {

    const name = el("genreName")?.value.trim();
    const description = el("genreDescription")?.value.trim();

    if (!name) return alert("Name required");

    const res = await fetch(GENRES_URL, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({ name, description })
    });

    if (!res.ok) {
        console.log(await res.text());
        alert("Genre create error");
        return;
    }

    el("genreName").value = "";
    el("genreDescription").value = "";

    loadGenres();
}

// ================= DELETE GENRE =================
async function deleteGenre(id) {

    const res = await fetch(`${GENRES_URL}${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "X-CSRFToken": csrftoken
        }
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Cannot delete genre");
        return;
    }

    loadGenres();
}

// ================= MOVIES =================
async function loadMovies() {

    const res = await fetch(MOVIES_URL, {
        credentials: "include"
    });

    if (!res.ok) return;

    const movies = await res.json();

    const table = el("moviesTable");
    if (!table) return;

    table.innerHTML = movies.map(m => `
        <tr>
            <td><img src="${m.poster}" width="60"></td>
            <td>${m.title}</td>
            <td>${m.release_year}</td>
            <td>
                <video width="120" controls>
                    <source src="${m.trailer}" type="video/mp4">
                </video>
            </td>
            <td>
                <button onclick="editMovie(${m.id})">Edit</button>
                <button onclick="deleteMovie(${m.id})">Delete</button>
            </td>
        </tr>
    `).join("");
}

// ================= CREATE MOVIE (FIXED + CLEAN FIELDS) =================
async function createMovie() {

    const title = el("movieTitle");
    const desc = el("movieDescription");
    const year = el("movieYear");
    const genre = el("movieGenre");

    if (!title.value.trim()) return alert("Title required");
    if (!year.value) return alert("Year required");

    const formData = new FormData();

    formData.append("title", title.value);
    formData.append("description", desc.value);
    formData.append("release_year", parseInt(year.value));
    formData.append("genre", genre.value);

    const poster = el("moviePoster")?.files[0];
    const trailer = el("movieTrailer")?.files[0];

    if (poster) formData.append("poster", poster);
    if (trailer) formData.append("trailer", trailer);

    const res = await fetch(MOVIES_URL, {
        method: "POST",
        credentials: "include",
        headers: {
            "X-CSRFToken": csrftoken
        },
        body: formData
    });

    if (!res.ok) {
        console.log(await res.text());
        alert("Create failed");
        return;
    }

    // CLEAR FIELDS
    title.value = "";
    desc.value = "";
    year.value = "";
    genre.value = "";

    el("moviePoster").value = "";
    el("movieTrailer").value = "";

    loadMovies();
}

// ================= EDIT MOVIE (FIXED) =================
async function editMovie(id) {

    const title = prompt("Title");
    const year = prompt("Year");

    if (!title || !year) return;

    const res = await fetch(`${MOVIES_URL}${id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({
            title: title.trim(),
            release_year: parseInt(year)
        })
    });

    if (!res.ok) {
        console.log(await res.text());
        alert("Edit failed");
        return;
    }

    loadMovies();
}

// ================= DELETE MOVIE =================
async function deleteMovie(id) {

    const res = await fetch(`${MOVIES_URL}${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "X-CSRFToken": csrftoken
        }
    });

    if (res.ok) loadMovies();
}

// ================= SPA =================
function showGenres() {
    el("genresSection").style.display = "block";
    el("moviesSection").style.display = "none";
}

function showMovies() {
    el("genresSection").style.display = "none";
    el("moviesSection").style.display = "block";
    loadMovies();
}

// ================= LOGOUT =================
async function logoutUser() {

    const res = await fetch("/api/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
            "X-CSRFToken": csrftoken
        }
    });

    if (res.ok) {
        window.location.href = "/login/";
    } else {
        alert("Logout failed");
    }
}