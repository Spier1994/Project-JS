export class SpotifyApi {

    constructor(clientId, secret) {
        this.clientId = clientId;
        this.secret = secret;
        this.token = this.getToken();
    }

    /**
     * Приватный асинхронный метод получения данных из spotify api
     * @param  {string} url адрес в виде строки
     * @return {Object} объект ответа
     */
    async #getData(url) {
        if (url) {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + await this.getToken()
                }
            });

            const json = await res.json();

            return {
                error: !!json.error,
                status: true,
                data: json
            }

        } else {
            return {
                error: true,
                status: false,
                data: null
            }
        }
    }

    /**
     * Асинхронный метод получения токена из spotify
     * @return {string} полученный токен в виде строки 
     */
    async getToken() {
        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + btoa(this.clientId + ':' + this.secret)
            },
            body: 'grant_type=client_credentials'
        })
        const data = await res.json();

        if (data.error) {
            return 'Ошибка получения токена'
        }

        return data?.access_token;
    }

    /**
     * Асинхронный метод получения плейлиста рекомендаций из spotify
     * @return {Object} полученный объект рекомендаций 
     */
    async getFeaturedPlaylists() {
        const res = await this.#getData('https://api.spotify.com/v1/browse/featured-playlists?country=RU');
        return res.data;
    }

    /**
     * Асинхронный метод получения новых релизов из spotify
     * @return {Object} полученный объект новых релизов
     */
    async getNewReleasesPlaylist() {
        const res = await this.#getData('https://api.spotify.com/v1/browse/new-releases?country=RU');
        return res.data;
    }

    /**
     * Асинхронный метод получения данных по поисковому запросу (плейлисты, треки)
     * @param  {string} query
     * @return {Object} полученный объект найденных плейлистов, треков
     */
    async getSearchResults(query) {
        const res = await this.#getData(`https://api.spotify.com/v1/search?type=track,playlist&q=${query}`);
        return res.data;
    }

    async  getTrack(trackId) {
        const res = await this.#getData(`https://api.spotify.com/v1/tracks/${trackId}`);
        return res.data;
    }
}