<template>
  <div id="tracklist">
    <div class="mainContainer flexColumn">
      <header>
        <div class="headerBar flexRow">
          <div class="topLeftText">
            <a class="darkPinkText">[bio]</a>
            <a class="darkPinkText">[lyr]</a>
            <a class="darkPinkText">[vis]</a>
          </div>

          <div class="centerText">
            <a class="whiteText">{{currentTrackArtist}}</a>
            <a class="blueText">{{currentTrackName}}</a>
          </div>

          <div class="topRightText">
            <a class="blueText">{{currentTrackEstimatedTime}}</a>
            <a class="blueText">@</a>
            <a class="blueText">Volume</a>
          </div>
        </div>

        <div class="headerBar flexRow">
          <div class="topLeftText">
            <a class="whiteText">[playing]</a>
          </div>

          <div class="centerText">
            <a class="pinkText">{{currentTrackAlbum}}</a>
          </div>

          <div class="topRightText">
            <a class="darkPinkText">[+1]</a>
            <a class="darkPinkText">[-m]</a>
            <a class="whiteText">[----]</a>
          </div>
        </div>
      </header>
      <button class="debugButton" v-on:click="loadSavedTracks();loadCurrentTrack();" />
      <div class="trackContainer">
        <div class="track flexRow">
          <a class="darkPinkText trackIndex">{{trackIndex}}</a>
          <a
            class="whiteText trackName"
            v-for="(trackName, i) in savedTracks"
            :key="trackName.name + i"
          >{{trackName.name}}</a>
          <a
            class="blueText trackArtist"
            v-for="(trackArtist, i) in savedTracks"
            :key="trackArtist.artist + i"
          >{{trackArtist.artist}}</a>
          <a class="blueText trackEstimatedTime">{{trackEstimatedTime}}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
axios.defaults.headers.common["Authorization"] = "Bearer " + window.localStorage.getItem("access_token");

function loadSavedTracks() {}
function loadCurrentTrack() {}

export default {
    name: "TrackList",
    data() {
        return {
        currentTrackEstimatedTime: 0,
        currentTrackArtist: "",
        currentTrackName: "",
        currentTrackAlbum: "",
        trackIndex: 0,
        trackName: "",
        trackArtist: "",
        trackEstimatedTime: "",
        savedTracks: [],
        };
    },
    methods: {
        async loadSavedTracks() {
            let limit = 10;
            let offset = 0;
            const selfUserEndpoint = `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`;

            try {
                let res = await axios({
                    method: "get",
                    url: selfUserEndpoint,
                });
                
                for(let item of res.data.items){

                    let trackName = item.track.name;
                    let trackArtist = item.track.artists[0].name;

                    this.savedTracks.push({
                        name: trackName,
                        artist: trackArtist,
                    });
                }

                return res.data;
            }
            catch(x) {
                console.log(x.response);                
                return x.response;               
            }
        },

        async loadCurrentTrack(){

            const currentTrackEndPoint = "https://api.spotify.com/v1/me/player";
            try {
                let res = await axios({
                    method: "get",
                    url: currentTrackEndPoint,
                });
                
                this.currentTrackName = " " + res.data.item.name; //костыль для отделения названия от артиста в хедере
                this.currentTrackArtist = res.data.item.artists[0].name;
                this.currentTrackAlbum = res.data.item.album.name;
                this.currentTrackEstimatedTime = res.data.progress_ms;               

                console.log(res.data);

                return res.data;
            }
            catch(x) {
                console.log(x.response);                
                return x.response;               
            }
        },
    },
    beforeMount(){
        loadSavedTracks();
        loadCurrentTrack();
    }
}
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
  width: 500px;
  height: 1000px;
  background: #1a1a1a;
}

.debugButton {
  width: 100px;
  height: 50px;
  background: green;
}

.headerBar {
  margin: 4px 3px 0px 4px;
  justify-content: space-between;
}

.headerBar:nth-child(2) {
  margin: 0px 3px 0px 4px;
}

.whiteText {
  color: #f8f8f8;
}

.pinkText {
  color: #db95e5;
}

.blueText {
  color: #2c90b5;
}

.darkPinkText {
  color: #a497b0;
}

.trackContainer {
  width: 250px;
  margin-left: auto;
}

.track {
  line-height: 12px;
}

.trackIndex {
  margin-right: 5px;
}

.trackEstimatedTime {
  margin-left: auto;
  margin-right: 5px;
}
</style>