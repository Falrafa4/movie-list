const API_KEY_PUBLIC = '8fa5af138d2597abcb92a0df2c91cbc8';
const BASE_URL = `https://api.themoviedb.org/3/`;

async function fetchAPI(url, loadingDivId, resultDivId) {
    const loadingDiv = document.getElementById(loadingDivId);
    const resultDiv = document.getElementById(resultDivId);
    const buttons = document.querySelectorAll('button');

    try {
        // show loading, disable buttons
        loadingDiv.style.display = 'block';
        buttons.forEach(btn => btn.disabled = true);
        resultDiv.innerHTML = '';

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error fetching data: ', error);
        resultDiv.innerHTML = `<div class="error">Error fetching data: ${error.message}</div>`;
        return null;
    } finally {
        // hide loading, enable buttons
        loadingDiv.style.display = 'none';
        buttons.forEach(btn => btn.disabled = false);
    }
}

async function fetchAllMovie() {
    const url = `${BASE_URL}movie/popular?api_key=${API_KEY_PUBLIC}&video=true`;
    const data = await fetchAPI(url, 'loading', 'result');

    if (data && data.results) {
        displayMovies(data.results, 'Popular Movies', 'result');
    }
}

async function fetchPopularPeople() {
    const url = `${BASE_URL}person/popular?api_key=${API_KEY_PUBLIC}`;
    const data = await fetchAPI(url, 'loading-people', 'result-people');

    if (data && data.results) {
        displayPopularPeople(data.results);
    }
}

async function searchMovie() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();

    // window.location.href = href;

    // kalau input kosong, alert error
    if (searchTerm === '') {
        alert('Silakan masukkan nama movie untuk mencari.');
        return;
    }

    const url = `${BASE_URL}search/movie?api_key=${API_KEY_PUBLIC}&query=${encodeURIComponent(searchTerm)}`;
    const data = await fetchAPI(url, 'loading', 'result');

    if (data && data.results) {
        // window.location.href = href;
        console.log(data);
        displayMovies(data.results, `Hasil Pencarian: ${searchTerm}`, 'result');
        document.querySelector('.popular-people').style.display = 'none';
    } else {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `<p>No movies found with the name ${searchTerm}</p>`;
    }
}

async function applyFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');
    // console.log('Filter yang dipilih:', filter);
    let url = '';

    switch (filter) {
        case 'popular':
            url = `${BASE_URL}movie/popular?api_key=${API_KEY_PUBLIC}`;
            break;
        case 'top_rated':
            url = `${BASE_URL}movie/top_rated?api_key=${API_KEY_PUBLIC}`;
            break;
        case 'upcoming':
            url = `${BASE_URL}movie/upcoming?api_key=${API_KEY_PUBLIC}`;
            break;
        case 'now_playing':
            url = `${BASE_URL}movie/now_playing?api_key=${API_KEY_PUBLIC}`;
            break;
        default:
            // kalau user pilih kosong (Filter), tampilkan lagi data populer
            fetchAllMovie();
            return;
    }

    document.querySelector('.popular-people').style.display = 'none';

    const data = await fetchAPI(url, 'loading', 'result');
    if (data && data.results) {
        displayMovies(data.results, `Kategori: ${filter.replace('_', ' ').toUpperCase()}`, 'result');
    }
}

async function fetchMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        document.body.innerHTML = '<p>Movie ID not found in the URL.</p>';
        return;
    }

    const url = `${BASE_URL}movie/${movieId}?api_key=${API_KEY_PUBLIC}`;
    const data = await fetchAPI(url, 'loading', 'movie-detail');

    if (data) {
        displayMovieDetail(data);
    }
}

async function fetchMovieReviews() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (!movieId) {
        document.body.innerHTML = '<p>Movie ID not found in the URL.</p>';
        return;
    }

    const url = `${BASE_URL}movie/${movieId}/reviews?api_key=${API_KEY_PUBLIC}`;
    const data = await fetchAPI(url, 'loading-review', 'movie-review');
    console.log(url);

    if (data) {
        displayReviewDetail(data);
    }
}

async function fetchTrendingMovies() {
    const url = `${BASE_URL}trending/movie/week?api_key=${API_KEY_PUBLIC}`;
    const data = await fetchAPI(url, 'loading-trending', 'result-trending');
    console.log(url);

    if (data && data.results) {
        displayMovies(data.results, 'Trending Movies', 'result-trending');
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        searchMovie();
    }
}

function resetFilter() {
    document.getElementById('searchInput').value = '';
    fetchAllMovie();
}

function addScrollButtons(resultDivId = 'result') {
    console.log('Adding scroll buttons to', resultDivId);
    const resultDiv = document.getElementById(resultDivId);
    const movieList = resultDiv.querySelector('.movie-list');
    if (!movieList) return;

    const leftBtn = document.createElement('button');
    leftBtn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
    leftBtn.className = 'scroll-btn scroll-left';
    leftBtn.onclick = () => movieList.scrollBy({ left: -300, behavior: 'smooth' });

    const rightBtn = document.createElement('button');
    rightBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
    rightBtn.className = 'scroll-btn scroll-right';
    rightBtn.onclick = () => movieList.scrollBy({ left: 300, behavior: 'smooth' });

    resultDiv.appendChild(leftBtn);
    resultDiv.appendChild(rightBtn);
}

// panggil setelah menampilkan film
function displayMovies(movies, title, resultDivId = 'result') {
    const resultDiv = document.getElementById(resultDivId);
    if (!movies || movies.length === 0) {
        resultDiv.innerHTML = '<p>No movie data found.</p>';
        return;
    }

    let html = `<h2>${title}</h2>`;
    html += `<p>Show ${movies.length} movies</p>`;
    html += '<div class="movie-list">';

    movies.forEach(movie => {
        html += `
            <a href='movies/?id=${movie.id}' class="movie-card">
                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.original_title} Poster">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p><strong>Rating:</strong> ${movie.vote_average}</p>
                    <p><strong>Release:</strong> ${movie.release_date}</p>
                </div>
            </a>
        `;
    });
    html += '</div>';
    resultDiv.innerHTML = html;
    
    addScrollButtons(resultDivId);
}

function displayMovieDetail(movie) {
    document.getElementById('movie-detail').innerHTML = `
        <div class="movie-detail-container">
            <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.original_title} Poster">
            <div class="movie-info">
                <h2>${movie.title}</h2>
                <p>${movie.overview}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Rating:</strong> ${movie.vote_average}</p>
                <p><strong>Popularity:</strong> ${movie.popularity}</p>
                <p><strong>Genres:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>
            </div>
        </div>
    `;
}

function displayPopularPeople(people) {
    const resultDiv = document.getElementById('result-people');
    if (!people || people.length === 0) {
        resultDiv.innerHTML = '<p>Popular people data not found.</p>';
        return;
    }
    let html = '<h2>Popular People</h2>';
    html += '<div class="people-list">';
    people.forEach(person => {
        html += `
            <div class="person-card">
                <img src="https://image.tmdb.org/t/p/w200${person.profile_path}" alt="${person.name} Photo">
                <div class="person-info">
                    <h3>${person.name}</h3>
                    <p><strong>Known For:</strong> ${person.known_for_department}</p>
                </div>
            </div>
        `;
    });
    html += '</div>';
    resultDiv.innerHTML = html;
}

function displayReviewDetail(reviews) {
    const reviewDiv = document.getElementById('movie-review');
    if (!reviews || reviews.results.length === 0) {
        reviewDiv.innerHTML = '<p>There are no reviews for this movie.</p>';
        return;
    }

    console.log(reviews);

    let html = '';
    reviews.results.forEach(review => {
        html += `
            <div class="review-card">
                <h3>Author: ${review.author}</h3>
                <p>${review.content}</p>
            </div>
        `;
    });
    reviewDiv.innerHTML = html;
}