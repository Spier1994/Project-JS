import {
    SpotifyApi
} from "./api/api.js";
import {
    Player
} from "./player/player.js";
import {
    millisToMinutesAndSeconds,
    formatTime
} from './utils.js'

const clientId = 'f03d452f6b3647c38ab26ad5f8cc8629';
const secret = '8848ff822526499f9d0ba968f87807b3';

const card = document.getElementById('card');
const track = document.getElementById('track');
const search = document.getElementById('search');
const content = document.getElementById('content');

const playButton = document.querySelector('.play_button');
const volumeButton = document.querySelector('.player_volume');
const progress = document.querySelector('.player_controls_playback-input');
const timeTrack = document.querySelector('.player_controls_playback-fullTime');
const currentTimeTrack = document.querySelector('.player_controls_playback-currentTime');
const nextButton = document.querySelector('.button_player.next');
const prevButton = document.querySelector('.button_player.prev');

const spotify = new SpotifyApi(clientId, secret);
const player = new Player();

/**
 * Функция добавления плейлиста
 * @param  {HTMLElement} el - элемент дом дерева
 * @param  {Array} items - массив данных плейлиста
 * @param  {string} playlistName - название плейлиста, по умолчанию пустая строка
 */
function addPlaylistElements(el, items, playlistName = '') {
    const playlist = document.createElement('div');
    playlist.classList.add('playlist');
    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = playlistName;


    items.slice(0, 8).forEach((item) => {
        const cardItem = document.createElement('div');
        cardItem.innerHTML = card.innerHTML;
        cardItem.classList.add('card');
        cardItem.querySelector('.card_image').setAttribute('src', item.images[0].url);
        cardItem.querySelector('.card_title').textContent = item.name;
        cardItem.querySelector('.card_description').textContent = item.description && item.description.slice(0, 55);
        playlist.append(cardItem);
    });

    if (!items.length) {
        playlist.textContent = 'Ничего не найдено';
    }

    el.append(title);
    el.append(playlist);
}

/**
 * Функция добавления и отображения списка треков 
 * @param  {HTMLElement} el - элемент дом дерева
 * @param  {Array} items - масстив треков
 */
function addTracks(el, items) {
    const tracksElement = document.createElement('div');
    tracksElement.classList.add('tracks');
    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = 'Найденные треки';

    if (!items.length) {
        tracksElement.textContent = 'Ничего не найдено';
    }

    items.forEach(async (item) => {
        const tracks = document.createElement('div');
        tracks.innerHTML = track.innerHTML;
        tracks.classList.add('tracks_item');
        if (item.preview_url) {
            tracks.querySelector('.tracks_item_info-play-image').setAttribute('src', item.album.images[0].url);
            tracks.querySelector('.tracks_item_info-album-name').textContent = item.name;
            tracks.querySelector('.tracks_item_info-album-artist').textContent = item.artists[0].name;
            tracks.querySelector('.tracks_item-ms').textContent = millisToMinutesAndSeconds(item.duration_ms);
            tracks.addEventListener('click', async () => {
                player.track = item.name;
                addTrackInfo(item.album.images[0].url, item.name, item.artists[0].name);
                player.play();
                changeButton();
                updateProgressPlayer();
            })
            player.addTrack(await spotify.getTrack(item.id));
            tracksElement.append(tracks);
        }
    });

    el.append(title);
    el.append(tracksElement);
}
/**
 * Асинхронная функция подгрузки контента на страницу
 */
async function loadContent() {
    if (await spotify.token) {
        const featuredPlaylists = await spotify.getFeaturedPlaylists();
        const newReleasesPlaylist = await spotify.getNewReleasesPlaylist();

        addPlaylistElements(content, featuredPlaylists.playlists.items, featuredPlaylists.message);
        addPlaylistElements(content, newReleasesPlaylist.albums.items, 'Новые релизы');
    } else {
        content.textContent = spotify.error;
    }
}
/**
 * Функци добавления и отображения информации по треку
 * @param  {string} img - ссылка на изображение
 * @param  {string} name - названия трека
 * @param  {string} artist - навзание исполнителя 
 */
function addTrackInfo(img, name, artist) {
    const player = document.getElementById('track-info');
    player.querySelector('.player_info-img').setAttribute('src', img);
    player.querySelector('.player_info-album-name').textContent = name;
    player.querySelector('.player_info-album-artist').textContent = artist;
    timeTrack.textContent = '00:30';
}
/**
 * Функция обновления состояни ползунка прогресса исполняемого трека
 */
function updateProgressPlayer() {
    player.audio.addEventListener('timeupdate', (e) => {
        const {
            duration,
            currentTime
        } = e.target;

        const progressPercent = (currentTime / duration) * 100;
        progress.setAttribute('value', progressPercent);
        currentTimeTrack.textContent = formatTime(currentTime % 60);
        if (duration === currentTime) {
            playButton.innerHTML = '<svg role="img" height="16" width="16" viewBox="0 0 16 16" class="svg"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>';
        }
    });
}
/**
 * Функция изменения кнопки
 */
function changeButton() {
    const state = player.isPlaying;
    if (state) {
        playButton.innerHTML = '<svg role="img" height="16" width="16" viewBox="0 0 16 16" class="svg"><path d="M2.7 1a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7H2.7zm8 0a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-2.6z"></path></svg>';

    } else {
        playButton.innerHTML = '<svg role="img" height="16" width="16" viewBox="0 0 16 16" class="svg"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>';

    }
}

window.addEventListener('DOMContentLoaded', loadContent);


search.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length > 3) {
        const res = await spotify.getSearchResults(query);
        content.innerHTML = '';
        addPlaylistElements(content, res.playlists.items, 'Плейлисты');
        addTracks(content, res.tracks.items);
        return;
    }
    if (!query.length) {
        content.innerHTML = '';
        loadContent();
    }
});

playButton.addEventListener('click', (e) => {

    if (!player.isPlaying && player.currentTrack) {
        player.play();
        updateProgressPlayer();
    } else {
        player.pause();
    }
    changeButton();
}, true);

volumeButton.addEventListener('change', (e) => {
    player.setVolume(e.target.value);
});

nextButton.addEventListener('click', () => {
    player.nextTrack();
    const {
        img,
        name,
        artist
    } = player.track;
    if (img && name && artist) {
        addTrackInfo(img, name, artist);
        changeButton();
        updateProgressPlayer();
    }
});

prevButton.addEventListener('click', () => {
    player.previousTrack();
    const {
        img,
        name,
        artist
    } = player.track;
    if (img && name && artist) {
        addTrackInfo(img, name, artist);
        changeButton();
        updateProgressPlayer();
    }
});