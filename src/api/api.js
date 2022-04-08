export class SpotifyApi {

    constructor(clientId, secret) {
        this.clientId = clientId;
        this.secret = secret;
        this.token = this.getToken(); //первичный запрос токена 
    }

    /**
     * Приватный асинхронный метод получения данных из spotify api
     * @param  {string} url - адрес в виде строки
     * @return {Object} объект ответа
     */
    async #getData(endpoint) {
        try {
            if (endpoint) {
                const res = await fetch('https://api.spotify.com/v1/' + endpoint, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + await this.token
                    }
                });

                const json = await res.json();

                if( json.error ){

                    return {
                        error: true,
                        status: false,
                        data: { msg: 'Что-то пошло не так: ' + json.error.message }
                    }
                }

                return {
                    error: !!json.error,
                    status: true,
                    data: json
                }

            } 
        } catch (e) {
            return Promise.reject({
                error: true,
                status: false,
                data: { msg: 'Что-то пошло не так: ' + e.message }
            });
        }

    }

    /**
     * Асинхронный метод получения токена из spotify
     * @return {string} полученный токен в виде строки 
     */
    async getToken() {
        try {
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
                return {
                    error: true,
                    status: false,
                    data: { msg: 'Что-то пошло не так: ' + data.error }
                }
            }

            return data?.access_token;

        } catch (e) {
            return {
                error: true,
                status: false,
                data: { msg: 'Что-то пошло не так: ' + e.message }
            }
        }
    }

    /**
     * Асинхронный метод получения плейлиста рекомендаций из spotify
     * @return {Object} полученный объект рекомендаций 
     */
    async getFeaturedPlaylists() {
        const res = await this.#getData('browse/featured-playlists?country=RU');
        return res;
    }

    /**
     * Асинхронный метод получения новых релизов из spotify
     * @return {Object} полученный объект новых релизов
     */
    async getNewReleasesPlaylist() {
        const res = await this.#getData('browse/new-releases?country=RU');
        return res;
    }

    /**
     * Асинхронный метод получения данных по поисковому запросу (плейлисты, треки)
     * @param  {string} query - название запроса
     * @return {Object} полученный объект найденных плейлистов и треков
     */
    async getSearchResults(query) {
        const res = await this.#getData(`search?type=track,playlist&q=${query}`);
        return res;
    }
} 