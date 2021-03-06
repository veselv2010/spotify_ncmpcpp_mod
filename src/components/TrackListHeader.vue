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
                    <a
                        class="whiteText cursorPointer noHighlight"
                        v-if="currentTrack.is_playing"
                        @click="onPlayingClick()"
                    >[playing]</a>
                    <a class="whiteText cursorPointer noHighlight" v-else @click="onPlayingClick()">[paused]</a>
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
                    <a class="blueText" v-if="!volumeBarState" @mouseenter="volumeMouseEnter()">{{" " + currentTrack.volume + "%"}}</a>
                    <a class="volumeBar blueText" v-else @mouseleave="volumeMouseLeave()">{{" " + volumeBar}}</a>
                </div>
                <div class="flexRow rightSide topCornerText">
                    <a class="darkPinkText cursorPointer" v-if="!isLoved" @click="likeDislikeCurrentTrack()">[+l]</a>
                    <a class="whiteText cursorPointer" v-else @click="likeDislikeCurrentTrack()">[+l]</a>
                    <a class="darkPinkText">[-m]</a>
                    <a class="whiteText cursorPointer" v-if="!currentTrack.shuffle_state" @click="toggleShuffleState()">[----]</a>
                    <a class="whiteText cursorPointer" v-else @click="toggleShuffleState()">[shfl]</a>
                </div>
            </div>
        </header>
    </div>
</template>

<script>
import axios from "axios";
import hotkeys from "hotkeys-js";

let lastTrackId = undefined;

export default {
    name: "TrackListHeader",
    data() {
        return {
            currentTrack: {},
            isLoved: false,
            interval: null,
            volumeBarState: false,
            volumeBar: "",
            pauseContext: {},
        };
    },
    methods: {
        async loadCurrentTrack() {        
            let res = await axios.get("https://api.spotify.com/v1/me/player");

            if(res.data.item == undefined){
                this.currentTrack = {name: "Nothing is playing!", volume: 0, currentTime: "0:00"};
                return;
            }
            const estDeltaMs = (res.data.item.duration_ms - res.data.progress_ms) / 1000;
            const currentTrackTime = Math.floor(estDeltaMs / 60)
                        + ':'
                        + String(
                            Math.floor(estDeltaMs % 60)).padStart(2, "0"); 
                          
            this.currentTrack = {
                name: res.data.item.name,
                artist: res.data.item.artists[0].name,
                album: res.data.item.album.name,
                volume: res.data.device.volume_percent,
                coverUri: res.data.item.album.images[1].url,
                id: res.data.item.id,
                currentTime: currentTrackTime,
                currentTimeMs: res.data.progress_ms,
                is_playing: res.data.is_playing,
                shuffle_state: res.data.shuffle_state,
                album_uri: res.data.item.album.external_urls.spotify,
                artist_uri:
                    res.data.item.album.artists[0].external_urls.spotify,
                track_uri: res.data.item.external_urls.spotify,
                device_id: res.data.device.id,
            };

            if (lastTrackId != this.currentTrack.id) {
                this.$emit("on-new-track", {
                    coverUri: this.currentTrack.coverUri,
                    id: this.currentTrack.id
                });
                lastTrackId = this.currentTrack.id;
                this.isLoved = await this.isTrackLoved(this.currentTrack.id);
            }
        },

        async isTrackLoved(track_id) {
            let res = await axios.get(`https://api.spotify.com/v1/me/tracks/contains?ids=${track_id}`);
            return res.data[0];
        },

        onPlayingClick() {
            this.$emit("on-playing-click");
        },

        async onSpacePressed() {         
            if(this.currentTrack.is_playing){
                this.pauseContext = this.currentTrack;
                await axios.put(`https://api.spotify.com/v1/me/player/pause?device_id=${this.currentTrack.device_id}`);
                return;
            }

            await axios({
                method: 'put',
                url: `https://api.spotify.com/v1/me/player/play?device_id=${this.pauseContext.device_id}`,
                data: `{"position_ms": ${this.pauseContext.currentTimeMs}}`
            });
        },

        async likeDislikeCurrentTrack() {
            let method = this.isLoved ? "delete" : "put";
         
            await axios({
                method: method,
                url: `https://api.spotify.com/v1/me/tracks?ids=${this.currentTrack.id}`
            });

            this.isLoved = !this.isLoved; //чето с этим сделать потом
        },

        async toggleShuffleState(){
            await axios.put(`https://api.spotify.com/v1/me/player/shuffle?state=${!this.currentTrack.shuffle_state}`)
        },

        volumeMouseEnter(){
            const slashCount = Math.floor(this.currentTrack.volume / 5);
            const minusCount = 20 - slashCount;
            const volumeMeter = [...Array(slashCount).fill('|'), ...Array(minusCount).fill('-')];
            this.volumeBar = '[' + volumeMeter.toString().split(',').join("") + ']';
            this.volumeBarState = true;
        },

        volumeMouseLeave(){
            this.volumeBarState = false;
        },
    },
    mounted() {
        this.loadCurrentTrack();
        setInterval(this.loadCurrentTrack, 1000);

        hotkeys("space", () => {
            this.onSpacePressed();
            return false;
        });
    }
};
</script>

<style scoped>
a{
    white-space: pre;
}
.center {
    justify-content: center;
}

.leftSide {
    margin-right: auto;
}

.rightSide {
    margin-left: auto;
}

.topContainer {
    padding: 2px 2px 0 2px;
    border-bottom: 1px solid #212121;
}

.topCornerText {
    overflow: hidden;
    line-height: 13px;
}

.volumeBar{
    letter-spacing: -2.5px;
}
</style>