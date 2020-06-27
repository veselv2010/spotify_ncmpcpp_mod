<template>
    <div id="tracklist">
        <a
            class="debugButton"
            v-on:click="loadSavedTracks(`https://api.spotify.com/v1/me/tracks?limit=50&offset=0`);loadCurrentTrack();getArtistBiography();"
        >
            <span>call all methods</span>
        </a>
        <div class="mainContainer flexColumn">
            <TrackListHeader @on-new-track="updateAlbumCover($event)" />

            <div class="savedTracksContainer flexRow">
                <div class="currentTrackImage">
                    <img v-bind:src="this.currentTrackAlbumCoverUri" />
                </div>
                <div class="trackContainer">
                    <div class="track flexRow" v-for="(track, i) of savedTracks" :key="track + i">
                        <a class="darkPinkText trackIndex">{{String(i + 1).padStart(2, '0')}}</a>
                        <a class="whiteText trackName" :href="track.track_uri">{{track.name + " "}}</a>
                        <a class="blueText trackArtist" :href="track.artist_uri">{{track.artist}}</a>
                        <a class="blueText trackEstimatedTime">{{track.estimatedTime}}</a>
                    </div>
                </div>
            </div>

            <div class="futureprogressbar"></div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
axios.defaults.headers.common["Authorization"] =
    "Bearer " + window.localStorage.getItem("access_token");

import TrackListHeader from "@/components/TrackListHeader";

export default {
    name: "TrackList",
    data() {
        return {
            currentTrackAlbumCoverUri: "",
            savedTracks: [],
            interval: null
        };
    },
    components: {
        TrackListHeader
    },
    methods: {
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

                    this.savedTracks.push({
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
                    this.loadSavedTracks(res.data.next, true);
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
        }
    },
    created() {
        this.loadSavedTracks(
            "https://api.spotify.com/v1/me/tracks?limit=50&offset=0"
        );
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
    width: 505px;
    height: 680px;
    background: #1a1a1a;
}

.trackContainer {
    display: inline-block;
    min-width: 313px;
}

.track {
    display: flex;
    justify-content: space-between;
    overflow: hidden;
}

.trackIndex {
    margin-right: 8px;
}

.trackEstimatedTime {
    margin-left: auto;
    margin-right: 5px;
}

.currentTrackImage {
    margin-right: 15px;
}

.currentTrackImage img {
    width: 160px;
}

.savedTracksContainer {
    margin: 2px;
    overflow: auto;
    border-left: 1px #212121 solid;
}

.futureprogressbar {
    min-height: 50px;
}
</style>