<template>
    <div class="authSuccess">
        
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: "AuthSuccess",
    props:{
        token:{type: String},
    },
    async created(){

        try {           
            let tempToken = await axios({ //выкупить cors реквесты
                method: 'get',
                url: `https://open.spotify.com/get_access_token?reason=transport&productType=web_player`,
            });

            localStorage.setItem("anonymousToken", tempToken.data.accessToken);
        }
        catch(error){
            console.log(error);
        }

        localStorage.setItem("access_token", this.token);
        window.location = "http://localhost:8080/tracklist";
    }
}
</script>