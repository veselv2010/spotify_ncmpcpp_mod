<template>
    <div id="tracklistheader">
        <header class="topContainer flexRow">
            <div class="flexColumn leftSide">
                <div class="topCornerText">
                    <a class="darkPinkText">[bio]</a>
                    <a class="darkPinkText">[lyr]</a>
                    <a class="darkPinkText">[vis]</a>
                </div>
                <div class="topCornerText">
                    <a class="whiteText cursorPointer" v-if="currentTrack.is_playing">[playing]</a>
                    <a class="whiteText cursorPointer" v-else>[paused]</a>
                </div>
            </div>

            <div class="flexColumn">
                <div class="flexRow center topCornerText">
                    <a class="whiteText" :href="currentTrack.artist_uri">{{currentTrack.artist}}</a>
                    <a class="blueText" :href="currentTrack.track_uri">{{" " + currentTrack.name}}</a>
                </div>
                <div class="flexRow center topCornerText">
                    <a class="pinkText" :href="currentTrack.album_uri">{{currentTrack.album}}</a>
                </div>
            </div>

            <div class="flexColumn rightSide">
                <div class="flexRow rightSide topCornerText cursorPointer">
                    <a class="blueText">{{currentTrack.currentTime + "r" + " "}}</a>
                    <a class="blueText">@</a>
                    <a class="blueText">{{" " + currentTrack.volume + "%"}}</a>
                </div>
                <div class="flexRow rightSide topCornerText">
                    <a class="darkPinkText cursorPointer" v-if="!isLoved">[+1]</a>
                    <a class="whiteText cursorPointer" v-else>[+1]</a>
                    <a class="darkPinkText">[-m]</a>
                    <a class="whiteText cursorPointer" v-if="!currentTrack.shuffle_state">[----]</a>
                    <a class="whiteText cursorPointer" v-else>[shfl]</a>
                </div>
            </div>
        </header>
    </div>
</template>

<script>
import axios from "axios";
axios.defaults.headers.common["Authorization"] =
    "Bearer " + window.localStorage.getItem("access_token");

let lastTrackId = undefined;

export default {
    name: "TrackListHeader",
    data() {
        return {
            coveruri: "",
            currentTrack: {},
            isLoved: false,
            interval: null
        };
    },
    methods: {
        async loadCurrentTrack() {
            const currentTrackEndPoint = "https://api.spotify.com/v1/me/player";
            try {
                let res = await axios({
                    method: "get",
                    url: currentTrackEndPoint
                });

                const estDeltaMs =
                    (res.data.item.duration_ms - res.data.progress_ms) / 1000;

                const currentTrackTime = `${Math.floor(
                    estDeltaMs / 60
                )}:${String(Math.floor(estDeltaMs % 60)).padStart(2, "0")}`;

                this.currentTrack = {
                    name: res.data.item.name,
                    artist: res.data.item.artists[0].name,
                    album: res.data.item.album.name,
                    volume: res.data.device.volume_percent,
                    coverUri: res.data.item.album.images[1].url,
                    id: res.data.item.id,
                    currentTime: currentTrackTime,
                    is_playing: res.data.is_playing,
                    shuffle_state: res.data.shuffle_state,
                    album_uri: res.data.item.album.external_urls.spotify,
                    artist_uri:
                    res.data.item.album.artists[0].external_urls.spotify,
                    track_uri: res.data.item.external_urls.spotify
                };
                this.coveruri = this.currentTrack.coverUri;

                if (lastTrackId != this.currentTrack.id) {
                    this.$emit("on-new-track", this.coveruri);
                    lastTrackId = this.currentTrack.id;
                    this.isLoved = await this.isTrackLoved(
                        this.currentTrack.id
                    );
                }

                return res.data;
            } catch (x) {
                console.log(x.response);
                return x.response;
            }
        },

        async isTrackLoved(track_id) {
            const currentTrackEndPoint = `https://api.spotify.com/v1/me/tracks/contains?ids=${track_id}`;
            try {
                let res = await axios({
                    method: "get",
                    url: currentTrackEndPoint
                });

                return res.data[0];
            } catch (x) {
                console.log(x.response);
                return x.response;
            }
        }
    },
    mounted() {
        this.loadCurrentTrack();
        setInterval(this.loadCurrentTrack, 1000);
    }
};
</script>

<style scoped>
.flexRow {
    display: flex;
    flex-flow: row;
}

.center {
    justify-content: center;
}

.flexColumn {
    display: flex;
    flex-flow: column;
}

.leftSide {
    margin-right: auto;
}

.rightSide {
    margin-left: auto;
}

.topContainer {
    padding: 2px 2px 0 2px;
}

.topCornerText {
    overflow: hidden;
    line-height: 12px;
}
</style>