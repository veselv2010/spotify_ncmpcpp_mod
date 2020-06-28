<template>
    <div id="tracklist">
        <a
            class="debugButton"
            v-on:click="loadSavedTracks(`https://api.spotify.com/v1/me/tracks?limit=50&offset=0`);loadCurrentTrack();getArtistBiography();"
        >
            <span>call all methods</span>
        </a>
        <div class="mainContainer flexColumn">
            <TrackListHeader
                @on-new-track="updateAlbumCover($event)"
                @on-playing-click="changePlaylistListState()"
            />

            <div class="flexRow">
                <div class="playlistList" v-if="this.isPlaylistListOn">
                    <div class="playlist flexRow" v-for="(playlist, i) of userPlaylists" :key="playlist + i" @click="onPlaylistClick(playlist.id);selectedPlaylist=playlist" :class="{selectedPlaylist: selectedPlaylist == playlist}"
                    >
                        <a class="playlistName darkGrayText">{{playlist.name + " "}}</a>
                        <a class="playlistTrackCount grayText">{{playlist.total}}</a>
                    </div>
                </div>

                <div class="savedTracksContainer flexRow">
                    <div class="currentTrackImage">
                        <img v-bind:src="this.currentTrackAlbumCoverUri" />
                    </div>
                    <div class="trackContainer">
                        <div
                            class="track flexRow"
                            v-for="(track, i) of loadedTracks"
                            :key="track + i"
                        >
                            <a class="darkPinkText trackIndex">{{String(i + 1).padStart(2, '0')}}</a>
                            <a
                                class="whiteText trackName"
                                :href="track.track_uri"
                            >{{track.name}}</a>
                            <a
                                class="blueText trackArtist"
                                :href="track.artist_uri"
                            >{{track.artist}}</a>
                            <a class="blueText trackEstimatedTime">{{track.estimatedTime}}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="futureprogressbar"></div>
            <TrackListLyrics />
        </div>
    </div>
</template>

<script>
import axios from "axios";
axios.defaults.headers.common["Authorization"] =
    "Bearer " + window.localStorage.getItem("access_token");

import TrackListHeader from "@/components/TrackListHeader";
import TrackListLyrics from "@/components/TrackListLyrics";

export default {
    name: "TrackList",
    data() {
        return {
            currentTrackAlbumCoverUri: "",
            loadedTracks: [], 
            userPlaylists: [],
            selectedPlaylist: {},
            interval: null,
            isPlaylistListOn: false
        };
    },
    components: {
        TrackListHeader,
        TrackListLyrics
    },
    methods: {
        async loadUserInfo() {
            try {
                let res = await axios({
                    method: "get",
                    url: "https://api.spotify.com/v1/me"
                });

                this.loadUserPlaylists(
                    `https://api.spotify.com/v1/users/${res.data.id}/playlists`
                );
                return res.data;
            } catch (error) {
                console.log(error.response);
                return error.response;
            }
        },

        async loadUserPlaylists(endpoint) {
            try {
                let res = await axios({
                    method: "get",
                    url: endpoint
                });

                for (let item of res.data.items) {
                    this.userPlaylists.push({
                        id: item.id,
                        name: item.name,
                        total: item.tracks.total
                    });
                }
                return res.data;
            } catch (error) {
                console.log(error.response);
                return error.response;
            }
        },

        async loadSavedTracks(endpoint) {
            try {
                let res = await axios({
                    method: "get",
                    url: endpoint
                });

                for (let item of res.data.items) {
                    const trackDuration = item.track.duration_ms / 1000;
                    const formattedDuration = `${Math.floor(
                        trackDuration / 60
                    )}:${String(Math.floor(trackDuration % 60)).padStart(
                        2,
                        "0"
                    )}`;

                    this.loadedTracks.push({
                        name: item.track.name,
                        artist: item.track.artists[0].name,
                        estimatedTime: formattedDuration,
                        id: item.track.id,
                        artist_uri:
                            item.track.album.artists[0].external_urls.spotify,
                        track_uri: item.track.external_urls.spotify
                    });
                }

                if (res.data.next != null) {
                    this.loadSavedTracks(res.data.next);
                }

                return res.data;
            } catch (x) {
                console.log(x.response);
                return x.response;
            }
        },

        async loadTracksFromPlaylist(endpoint){
            try {
                let res = await axios({
                    method: "get",
                    url: endpoint + "?fields=id,name,tracks(items(track(name,artists(name,external_urls.spotify),album.name,album.external_urls.spotify,duration_ms,external_urls.spotify)),next)",
                });

                for (let item of res.data.tracks.items) {
                    const trackDuration = item.track.duration_ms / 1000;
                    const formattedDuration = `${Math.floor(
                        trackDuration / 60
                    )}:${String(Math.floor(trackDuration % 60)).padStart(
                        2,
                        "0"
                    )}`;

                    this.loadedTracks.push({
                        name:  item.track.name,
                        artist: item.track.artists[0].name,
                        estimatedTime: formattedDuration,
                       // id: track.id,
                        artist_uri: item.track.artists[0].external_urls.spotify,
                        track_uri: item.track.external_urls.spotify
                    });
                }

                if (res.data.tracks.next != null) {
                    this.loadSavedTracks(res.data.next);
                }

                return res.data;
            } catch (x) {
                console.log(x.response);
                return x.response;
            }
        },

        async getArtistBiography() {
            if (!window.localStorage.getItem("anonymousToken")) return;

            let artistId = "3dz0NnIZhtKKeXZxLOxCam"; //porter robinson
            try {
                let res = await axios({
                    method: "get",
                    url: `https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtist&variables=%7B%22uri%22%3A%22spotify%3Aartist%${artistId}%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22586fab74eb300f60438e327e4142e4a509a656a24b17292672034271fea85079%22%7D%7D`,
                    headers: {
                        Authorization:
                            "Bearer " +
                            window.localStorage.getItem("anonymousToken")
                    }
                });

                return res.data;
            } catch (x) {
                console.log(x.response);
                return x.response;
            }
        },

        updateAlbumCover(currentTrackAlbumCoverUri) {
            this.currentTrackAlbumCoverUri = currentTrackAlbumCoverUri;
        },

        changePlaylistListState() {
            this.isPlaylistListOn = !this.isPlaylistListOn;
        },

        onPlaylistClick(playlist_id){
            this.loadedTracks = [];
            this.loadTracksFromPlaylist(`https://api.spotify.com/v1/playlists/${playlist_id}`);
        },
    },
    created() {
        this.loadSavedTracks(
            "https://api.spotify.com/v1/me/tracks?limit=50&offset=0"
        );
        this.loadUserInfo();
    }
};
</script>

<style scoped>
.flexRow {
    display: flex;
    flex-flow: row;
}

.flexColumn {
    display: flex;
    flex-flow: column;
}

.mainContainer {
    width: 560px;
    height: 680px;
    background: #1a1a1a;
}

.trackContainer {
    flex: auto;
    min-width: 230px;
}

.track {
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    line-height: 15px;
}

.trackIndex {
    margin-right: 8px;
}

.trackName{
    margin-right: 5px;
    overflow: hidden;
}

.trackArtist{
    margin-right: 5px;
    overflow: hidden;
}

.trackEstimatedTime {
    margin-left: auto;
    margin-right: 5px;
}

.currentTrackImage {
    margin-top: 3px;
    margin-right: 15px;
    min-width: 145px;
    max-width: 165px;
}

.currentTrackImage img {
    width: 100%;
    height: auto;
}

.savedTracksContainer {
    position: relative;
    margin: 2px;
    border-right: 1px #212121 solid;
    overflow: auto;
    max-height: 640px;
    flex: 1;
}

.futureprogressbar {
    min-height: 50px;
}

.playlistList {
    max-width: 150px;
    line-height: 12px;
    padding-right: 3px;
    margin-left: 3px;
}

.playlistTrackCount {
    margin-left: auto;
}

.playlistName{
    margin-right: 2px;
    overflow: hidden;
}

.selectedPlaylist{
    cursor: pointer;
}

.selectedPlaylist a{
    color: white;
}
</style>