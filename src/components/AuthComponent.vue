<template>
    <div class="auth">
        
    </div>
</template>

<script>
const client_id = "c27b6a53f6a04edbaa7779d42d08d483"; 
const redirect_uri = "http://localhost:8080/success";
const scope = "user-library-read user-read-playback-state";
const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&redirect_uri=${redirect_uri}&state=fdsfdsfds&scope=${scope}&show_dialog=true/`; 

export default {
    name: "AuthComponent",
    created(){
        window.location = authUrl;
    }
}
</script>