<template>
    <div class="auth"></div>
</template>

<script>
const client_id = "c27b6a53f6a04edbaa7779d42d08d483";
// #IF_DEBUG
const redirect_uri = (window.webpackHotUpdate != undefined) ? "http://localhost:8080/success" : "https://murmuring-shelf-94214.herokuapp.com/success";
const scope =
    "ugc-image-upload playlist-read-collaborative playlist-modify-private playlist-modify-public playlist-read-private user-library-read user-read-playback-state user-read-playback-position user-read-recently-played user-top-read user-modify-playback-state user-read-currently-playing user-read-private user-read-email user-read-private user-read-email user-library-modify user-follow-modify user-follow-read streaming app-remote-control";
const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&redirect_uri=${redirect_uri}&state=fdsfdsfds&scope=${scope}&show_dialog=true/`;

export default {
    name: "AuthComponent",
    created() {
        window.location = authUrl;
    }
};
</script>